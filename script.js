// objekt pro hru
let hra = {
  element: document.getElementById('hra'),
  sirka: 900,
  vyska: 600,
  dalsiDarek: 150,
  skore: 0,
  skoreElement: document.getElementById('pocet'),
  hudba: document.getElementById('hudba'),
  zvukNaraz: document.getElementById('zvuk-naraz'),
  zvukSebrano: document.getElementById('zvuk-sebrano'),
  uvod: document.getElementById('uvod'),
  tlacitkoStart: document.getElementById('start'),
  konec: document.getElementById('konec'),
  tlacitkoZnovu: document.getElementById('znovu'),
  vysledek: document.getElementById('vysledek'),
  cas: 0,
  casElement: document.getElementById('cas'),
  casovac: null
}

// objekt robota
let robot = {
  element: document.getElementById('robot'),
  x: 0,
  y: 495,
  sirka: 135,
  vyska: 105,
  rychlost: 10
}

// objekt letajicich sani
let sane = {
  element: document.getElementById('sane'),
  x: 0,
  y: 10,
  sirka: 165,
  vyska: 104,
  rychlost: 2
}

// prázdný seznam (pole) dárků
let darky = [];


// počkáme, až se v okně prohlížeče načte veškerý
// obsah a pak zavoláme funkci startHry
window.addEventListener('load', uvodHry);


// funkce pro zobrazení úvodu hry
function uvodHry() {
  // přepneme na úvodní obrazovku
  prepniObrazovku('uvod');

  // na tlačítku budeme čekat na kliknutí
  // při kliknutí zavoláme startHry
  hra.tlacitkoStart.addEventListener('click', startHry);

  // čekáme na kliknutí na tlačítku na záverečné obrazovce
  hra.tlacitkoZnovu.addEventListener('click', startHry);
}


// funkce pro spuštění hry
// volá se po stisku tlačítka Start na úvodní obrazovce
function startHry() {
  // na začátku hry vynulujeme skóre
  hra.skore = 0;
  hra.skoreElement.textContent = '0';

  // nastavíme objekty do výchozí polohy
  robot.x = Math.floor(hra.sirka / 2 - robot.sirka / 2);
  umistiObjekt(robot);
  umistiObjekt(sane);

  // nastavíme výchozí čas a zobrazíme ho
  hra.cas = 90;
  zobrazCas();

  // když na stránce dojde ke stisku klávesy (jakékoliv),
  // zavolá se funkce priStiskuKlavesy
  document.addEventListener('keydown', priStiskuKlavesy);

  // nastartujeme časovač, který bude 50× za vteřinu posouvat sáně, dárky, apod.
  hra.casovac = setInterval(aktualizujHru, 20);

  // spustíme hudbu
  hra.hudba.play();

  // spustíme sněžení
  startSnezeni();

  // přepneme obrazovku na herní plochu
  prepniObrazovku('hra');
}


// funkce pro aktualizování polohy objektů na obrazovce
// spouští se 50× za vteřinu
function aktualizujHru() {
  // posuneme sáně
  posunSane();

  // posuneme padající dárky
  posunDarky();

  // otestujeme padající dárky
  otestujDarky();

  // odpocitavame do dalsiho darku
  cekejNaDalsiDarek();

  // aktualizuje čas a zjistí, zda už nedošel na 0
  aktualizujCas();

  // zjistíme, zda už čas nedoběhl na 0
  if (hra.cas <= 0) {
    konecHry();
  }
}


// fukce se volá při stisku jakékoliv klávesy
// v proměnné udalost bude objekt popisující událost
// objekt obsahuje vlastnost key, ve které je kód stisknuté klávesy
function priStiskuKlavesy(udalost) {
  // stisknutá šipka vpravo
  if (udalost.key === 'ArrowRight') {
    robot.x = robot.x + robot.rychlost;

    // když robot vyjíždí mimo plochu, zastavíme ho na okraji
    if (robot.x > hra.sirka - robot.sirka) {
      robot.x = hra.sirka - robot.sirka;
    }
  }

  // stisknutá šipka vlevo
  if (udalost.key === 'ArrowLeft') {
    robot.x = robot.x - robot.rychlost;
    
    // když robot vyjíždí mimo plochu, zastavíme ho na okraji
    if (robot.x < 0) {
      robot.x = 0;
    }
  }

  // objekt robota umístíme na jeho nové souřadnice
  umistiObjekt(robot);
}


// funkce pro umístění objektu na jeho souřadnice
function umistiObjekt(herniObjekt) {
  herniObjekt.element.style.left = herniObjekt.x + 'px';
  herniObjekt.element.style.top = herniObjekt.y + 'px';
}


// funkce pro pohyb sání
function posunSane() {
  // posuneme sáně
  sane.x = sane.x + sane.rychlost;

  // když sáně dojedou na pravý okraj obrazovky
  if (sane.x > hra.sirka - sane.sirka) {
    sane.x = hra.sirka - sane.sirka;
    sane.rychlost = -sane.rychlost;
    sane.element.style.transform = 'scaleX(-1)';
  }

  // když sáně dojedou na levý  okraj obrazovky
  if (sane.x < 0) {
    sane.x = 0;
    sane.rychlost = -sane.rychlost;
    sane.element.style.transform = 'scaleX(1)';
  }

  // změníme polohu obrázku sání na obrazovce
  umistiObjekt(sane);
}


// funkce pro vytvoření nového dárku
// nový dárek se přidá do pole darky[]
function pridejDarek() {
  // vytvoříme nový element pro obrázek dárku
  let obrazek = document.createElement('img');
  obrazek.src = 'obrazky/darek' + nahodneCislo(1, 4) + '.png';

  // přidáme obrázek dárku na herní plochu
  hra.element.appendChild(obrazek);

  // vytvoříme objekt nového dárku
  let novyDarek = {
    element: obrazek,
    x: Math.floor(sane.x + sane.sirka / 2 - 20),
    y: Math.floor(sane.y + sane.vyska / 2),
    sirka: 39,
    vyska: 44,
    rychlost: nahodneCislo(1, 3)
  };

  // nový dárek přidáme do seznamu
  darky.push(novyDarek);

  // ihned umístíme dárek na správnou pozici na obrazovce
  umistiObjekt(novyDarek);
}


// funkce pro pohyb padajících dárků
function posunDarky() {
  // projdeme všechny dárky v poli
  for (let i = 0; i < darky.length; i++) {
    // posuneme dárek směrem dolů
    darky[i].y = darky[i].y + darky[i].rychlost;

    // změníme polohu obrázku dárku na obrazovce
    umistiObjekt(darky[i]);
  }
}


// funkce pro testování padajících dárků
// - dopadl dárek na zem?
// - chytil dárek robot?
function otestujDarky() {
  // projdeme pozpátku všechny dárky v poli
  for (let i = darky.length - 1; i >=0; i--) {

    if (protnutiObdelniku(robot, darky[i])) {
      // obrázek dárku se protnul s obrázkem robota = robot sebere dárek
      // odstraníme sebraný dárek ze hry
      odstranDarek(i);

      // zvětšíme skóre
      zvetsiSkore();

      // přičteme čas a zobrazíme
      hra.cas = hra.cas + 3;
      zobrazCas();

      // přehraj zvuk sebraného dárku
      hra.zvukSebrano.play();

    } else if (darky[i].y + darky[i].vyska > hra.vyska) {
      // dopadl dárek na zem?
      // odstraníme dárek
      odstranDarek(i);

      // odečteme čas a zobrazíme
      hra.cas = hra.cas - 10;
      zobrazCas();

      // přehraj zvuk nárazu na zem
      hra.zvukNaraz.play();
    }

  }
}


// odstraní obrázek dárku z herní plochy s smaže dárek v poli dárků
function odstranDarek(index) {
  // odstraníme obrázek dárku z herní plochy
  darky[index].element.remove();

  // smažeme herní objekt z pole dárků
  darky.splice(index, 1);
}


// funkce generuje náhodné číslo od dolniLimit do horniLimit (oba včetně)
function nahodneCislo(dolniLimit, horniLimit) {
  return dolniLimit + Math.floor(Math.random() * (horniLimit - dolniLimit + 1));
}


// funkce odpočítává čas do vyhození nového dárku
function cekejNaDalsiDarek() {
  if (hra.dalsiDarek === 0) {
    // odpočet je na 0, do hry přidáme nový dárek
    pridejDarek();

    // vygenerujeme náhodný čas v rozmezí 1 - 5 vteřin
    // odpočítává se 50x za vteřinu, takže potřebujeme
    // číslo 50 - 250
    hra.dalsiDarek = nahodneCislo(50, 250);
  } else {
    // odpočet ještě není na 0, tak ho snížíme o 1
    hra.dalsiDarek--;
  }
}


// funkce pro zjištění protnutí obdélníku
// jako parametr se předávají dva herní objekty
// funkce vrací true/false, podle toho, zda ke kolizi dochází nebo ne
function protnutiObdelniku(a, b) {
  if ( a.x + a.sirka < b.x
		    || b.x + b.sirka < a.x
			  || a.y + a.vyska < b.y
			  || b.y + b.vyska < a.y) {
	  // obdelniky se neprotinaji
    return false;
  } else {
    // obdélníky se protinaji
    return true;
  }
}


// zvětší skóre o 1 a vypíše ho na obrazovku
function zvetsiSkore() {
  // zvětšíme o 1
  hra.skore++;
  // vypíšeme do prvku v hlavičce hry
  hra.skoreElement.textContent = hra.skore;
}


// přepínání obrazovky
function prepniObrazovku(obrazovka) {
  // nejprve všechny obrazovky skryjeme
  hra.uvod.style = 'none';      // úvod
  hra.element.style = 'none';   // herní plocha
  hra.konec.style = 'none';     // závěrečná obr.

  // podle parametru zobrazíme příslušnou obrazovku
  if (obrazovka === 'uvod') {
    
    // úvod je flexbox, nastavíme na flex
    hra.uvod.style.display = 'flex';

  } else if (obrazovka === 'hra') {
    
    // herní plocha je blokový prvek, nastavíme na block
    hra.element.style.display = 'block';
  
  } else if (obrazovka === 'konec') {
    
    // závěrečná obr. je stejně jako úvod flexbox, takže nastavíme na flex
    hra.konec.style.display = 'flex';
  
  }
}


// zobrazí závěrečnou obrazovku a vypíše do ní dosažené skóre
function konecHry() {

  // ukončíme sněžení
  konecSnezeni();

  // zastavíme časovač, který se 50× za vteřinu stará o běh hry
  clearInterval(hra.casovac);

  // zrušíme posluchač události, který čeká na stisk klávesy
  document.removeEventListener('keydown', priStiskuKlavesy);

  // vymažeme dárky, které zůstaly na herní ploše
  odeberDarky();

  // přepneme na závěrečnou obrazovku
  prepniObrazovku('konec');

  // podle dosaženého výsledku vypíšeme hlášku
  if (hra.skore === 0) {

    hra.vysledek.textContent = 'Bohužel jsi nechytil žádný dárek. Ale snaha byla.';

  } else if (hra.skore === 1) {

    hra.vysledek.textContent = 'Zachránil jsi pouze 1 dárek, ale i ta jedna rozzářená dětská očička za to určitě stojí.';

  } else if (hra.skore < 5) {

    hra.vysledek.textContent = 'Chytil jsi ' + hra.skore + ' dárky. Mohlo to být lepší, ale určitě to zkusíš znovu, že ano?';

  } else {

    hra.vysledek.textContent = 'Výborně, chytil jsi ' + hra.skore + ' dárků. Tolik dětí bude mít díky tobě radostné Vánoce.';

  }
}


// zobrazí čas ve formátu mm:ss v hlavičce hry
function zobrazCas() {
  // nikdy nechceme zobrazit čas menší než 0,
  // takže je-li čas menší než 0, nastavíme ho na 0
  if (hra.cas < 0) {
    hra.cas = 0;
  }

  // z celkového počtu  vteřin spočítáme minuty a vteřiny
  let minuty = Math.floor(hra.cas / 60);
  let vteriny = Math.round(hra.cas - minuty * 60);
  
  // spočítané minuty a vteřiny převedeme na formát mm:ss
  let naformatovanyCas = ('00' + minuty).slice(-2) + ':' + ('00' + vteriny).slice(-2)

  // naformátovaný čas vypíšeme na obrazovku
  hra.casElement.textContent = naformatovanyCas;
}


// provádí pravidelný odpočet času
function aktualizujCas() {
  // odečteme od času 1/50 vteřiny
  hra.cas = hra.cas - 0.02;

  // zobrazíme aktualizovaný čas
  zobrazCas();
}


// odstraní všechny dárky z herní plochy při skončení hry
function odeberDarky() {
  // projdeme všechny dárky v seznamu
  for (let i = 0; i < darky.length; i++) {
    // a smažeme z herní plochy jejich obrázky
    darky[i].element.remove();
  }

  // vyprázdníme pole dárků
  darky = [];
}




/* -------------------------------------------------- */
/* - PADAJÍCÍ SNĚHOVÉ VLOČKY ------------------------ */
/* -------------------------------------------------- */

// inicializujeme kreslící plátno
let snih = {
  canvas: document.getElementById('snezeni'),
  ctx: null,
  sirka: 900,
  vyska: 600,
  pocet: 120,
  uhel: 0,
  particles: [],
  animovat: false
}
snih.canvas.width = snih.sirka;
snih.canvas.height = snih.vyska;
snih.ctx = snih.canvas.getContext('2d');

// spustí sněžení
function startSnezeni() {
  // vygenerujeme náhodné vločky
  snih.particles = [];
  for(let i = 0; i < snih.pocet; i++) {
    snih.particles.push({
      x: Math.random() * snih.sirka,  // souřadnice X
      y: Math.random() * snih.vyska,  // souřadnice Y
      r: Math.random() * 3 + 1,       // velikost vločky
      d: Math.random() * snih.pocet   // náhodny faktor pro pohyb vločky
    });
  }

  // spustíme snežení
  snih.animovat = true;
  requestAnimationFrame(nakresliSnih);
}


// ukončí sněžení s smaže plátno
function konecSnezeni() {
  // ukončíme animaci vloček
  snih.animovat = false;
  // smažeme plátno
  snih.ctx.clearRect(0, 0, snih.sirka, snih.vyska);
}

// vykreslení vloček na plátno
function nakresliSnih() {
  if (snih.animovat) {
    // smažeme canvas
    snih.ctx.clearRect(0, 0, snih.sirka, snih.vyska);

    // nakreslíme všechny vločky
    snih.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    snih.ctx.beginPath();
    for(let i = 0; i < snih.pocet; i++) {
      let p = snih.particles[i];
      snih.ctx.moveTo(p.x, p.y);
      snih.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
    }
    snih.ctx.fill();

    // aktualizujeme polohu vloček
    aktualizujSnih();

    // vyžádáme si spuštení funkce znovu při další obnově obrazovky
    requestAnimationFrame(nakresliSnih);
  }
}


// funkce pro aktualizaci polohy vloček
function aktualizujSnih() {
  snih.uhel += 0.01;

  for(let i = 0; i < snih.pocet; i++) {
    // aktualni vlocka
    let p = snih.particles[i];

    // aktualizace X a Y souřadnic vločky
    // abychom pohyb udělali náhodnější, přidáváme na různých místech
    // k úhlu poloměr vločky a/nebo její náhodný faktor
    let dy = Math.cos(snih.uhel + p.d) + p.r / 2;
    if (dy < 0) { 
      // nechceme, aby se vločky pohybovaly nahoru
      dy = -dy; 
    }
    p.y += dy;
    p.x += Math.sin(snih.uhel + p.d / 20 );

    // je-li vločka mimo hranice plátna,
    // tak ji přesuneme zpět nahoru na náhodnou pozici X
    if (p.x > snih.sirka + 5 || p.x < -5 || p.y > snih.vyska) {
      snih.particles[i] = {
        x: Math.random() * snih.sirka,
        y: -10,
        r: p.r,
        d: p.d
      };
    }
  }
}
