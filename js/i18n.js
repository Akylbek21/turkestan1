<script>
// js/i18n.js — KK / EN переключатель с localStorage
(function () {
  const LS_KEY = 'lang';
  const SUPPORTED = ['kk','en'];
  const DEFAULT_LANG = 'en'; // сайт по умолчанию на английском

  // ==== Отображаемые названия категорий (value в <option> остаются RU!) ====
  const MAP_CATS = {
    kk: {
      'Мавзолей':'Кесене','Мечеть':'Мешіт','Археология':'Археология','Музей':'Мұражай',
      'Культура':'Мәдениет','Сцена':'Сахна','Развлечения':'Ойын-сауық','Парк':'Саябақ',
      'Аттракцион':'Аттракцион','Природа':'Табиғат','Пещера':'Үңгір','Инфраструктура':'Инфрақұрылым'
    },
    en: {
      'Мавзолей':'Mausoleum','Мечеть':'Mosque','Археология':'Archaeology','Музей':'Museum',
      'Культура':'Culture','Сцена':'Stage','Развлечения':'Attractions','Парк':'Park',
      'Аттракцион':'Ride','Природа':'Nature','Пещера':'Cave','Инфраструктура':'Infrastructure'
    }
  };

  // ==== Словарь интерфейса ====
  const DICT = {
    kk: {
      app:{ title:'Түркістан облысының көрікті жерлері',
            hero:'Түркістан облысын ашыңыз',
            count:n=>`${n} нысан`, cats:n=>`${n} санат` },
      nav:{ guide:'Нұсқаулық', passport:'Саяхатшы паспорты' },
      search:{ placeholder:'Іздеу: Яссауи, Отырар, Сауран…' },
      filter:{ category:'Санат', all:'Барлық санаттар' },
      visited:{ label:'Барғандар:' },
      place:{
        facts:'Қызықты деректер', quiz:'Біліміңді тексер', check:'Тексеру',
        reconTitle:'Өткен / бүгін', reconHint:'Жүгірткіні жылжытыңыз',
        mark:'Бардым', map:'Google картасында ашу', share:'Бөлісу',
        pick:'Нұсқаны таңдаңыз', right:'Дұрыс! 🎉', wrong:'Дұрыс емес. Қайталап көріңіз.'
      },
      footer:{ copy:'Turkestan Guide — көпбетті нұсқа', tech:'HTML • CSS • JS' },
      toast:{ copied:'Сілтеме көшірілді!' },
      guide:{ title:'Түркістанға гид — не көруге болады', back:'← Басты бетке', print:'Басып шығару / PDF',
              note:'Материал мектеп жобасы үшін дайындалды. Суреттер берілген сайын жаңартылады.' }
    },
    en: {
      app:{ title:'Turkestan Region — Places to See',
            hero:'Discover Turkestan Region',
            count:n=>`${n} places`, cats:n=>`${n} categories` },
      nav:{ guide:'Guide', passport:'Passport' },
      search:{ placeholder:'Search: Yasawi, Otrar, Sauran…' },
      filter:{ category:'Category', all:'All categories' },
      visited:{ label:'Visited:' },
      place:{
        facts:'Interesting facts', quiz:'Check your knowledge', check:'Check',
        reconTitle:'Past / Today', reconHint:'Drag the slider',
        mark:'I was here', map:'Open in Google Maps', share:'Share',
        pick:'Choose an option', right:'Correct! 🎉', wrong:'Not quite. Try again.'
      },
      footer:{ copy:'Turkestan Guide — multi-page edition', tech:'HTML • CSS • JS' },
      toast:{ copied:'Link copied!' },
      guide:{ title:'Turkestan Guide — what to see', back:'← Home', print:'Print / PDF',
              note:'This material was prepared for a school project. Images will be updated as available.' }
    }
  };

  // ==== TOC (если используете в guide.html через data-i18n) ====
  const GUIDE_TOC = {
    kk:{
      toc_overview:'Түркістанда не көруге болады',
      toc_azret:'«Әзірет Сұлтан» музей-қорығы',
      toc_yassawi:'Қожа Ахмет Ясауи кесенесі',
      toc_rabia:'Рабиға Сұлтан Бегім кесенесі',
      toc_khilvet:'Жерасты мешіті Хилуат',
      toc_esim:'Есім хан кесенесі',
      toc_ethno:'Этноауыл',
      toc_juma:'Жұма мешіті',
      toc_regmuseum:'Облыстық тарихи-өлкетану музейі',
      toc_keruen:'Керуен Сарай',
      toc_kultobe:'Күлтөбе қалашығы',
      toc_yassawi_museum:'Қожа Ахмет Ясауи музейі',
      toc_station:'Теміржол вокзалы',
      toc_amphi:'Амфитеатр',
      toc_theatre:'Қазақ музыкалық-драма театры',
      toc_park:'Jіbek Joly ойын-сауық паркі',
      toc_flying:'Ұшатын театр',
      toc_firstpark:'Тұңғыш Президент саябағы',
      toc_near:'Түркістан маңында не көруге болады',
      toc_gauhar:'«Гауһар Ана» кесенесі',
      toc_ukasha:'Ұқаша Ата',
      toc_arystan:'Арыстан-Баб кесенесі',
      toc_karatau:'Қаратау қорығы',
      toc_akmeshit:'Ақмешіт үңгірі'
    },
    en:{
      toc_overview:'Highlights in Turkestan',
      toc_azret:'Azret Sultan Reserve-Museum',
      toc_yassawi:'Mausoleum of Khoja Ahmed Yasawi',
      toc_rabia:'Mausoleum of Rabia Sultan Begim',
      toc_khilvet:'Underground Mosque Khilvet',
      toc_esim:'Mausoleum of Esim Khan',
      toc_ethno:'Ethno-village',
      toc_juma:'Juma Mosque',
      toc_regmuseum:'Regional History Museum',
      toc_keruen:'Keruen Sarai',
      toc_kultobe:'Kultobe Settlement',
      toc_yassawi_museum:'Khoja Ahmed Yasawi Museum',
      toc_station:'Railway Station Building',
      toc_amphi:'Amphitheatre',
      toc_theatre:'Kazakh Music & Drama Theatre',
      toc_park:'Jіbek Joly Amusement Park',
      toc_flying:'Flying Theatre',
      toc_firstpark:'First President Park',
      toc_near:'Day trips near Turkestan',
      toc_gauhar:'Gauhar Ana Mausoleum',
      toc_ukasha:'Ukasha Ata',
      toc_arystan:'Arystan Bab Mausoleum',
      toc_karatau:'Karatau Nature Reserve',
      toc_akmeshit:'Akmeshit Cave'
    }
  };
  // пришиваем TOC
  for (const l of SUPPORTED){ DICT[l].guide_toc = GUIDE_TOC[l]; }

  // ==== Вспомогательные ====
  const clampLang = (l)=> SUPPORTED.includes(l) ? l : DEFAULT_LANG;
  const getLangFromQS = ()=>{
    try{ const m = location.search.match(/[?&]lang=(kk|en)\b/i); return m ? m[1].toLowerCase() : null; }
    catch{ return null; }
  };

  const I18N = {
    lang: clampLang(getLangFromQS() || localStorage.getItem(LS_KEY) || document.documentElement.lang || DEFAULT_LANG),
    _cbs:[],

    set(l){
      this.lang = clampLang(l);
      localStorage.setItem(LS_KEY, this.lang);
      this.applyAll();
      this._cbs.forEach(fn => { try{ fn(this.lang); }catch{} });
    },
    get(){ return this.lang; },
    onChange(fn){ this._cbs.push(fn); },

    t(path){
      const d = DICT[this.lang] || DICT[DEFAULT_LANG];
      const v = path.split('.').reduce((o,k)=> (o && o[k] != null) ? o[k] : null, d);
      return (v == null) ? path : v;
    },

    // ===== главная =====
    updateIndexUI(){
      const d = DICT[this.lang] || DICT[DEFAULT_LANG];

      const h1 = document.querySelector('header h1#title-main, header h1');
      if (h1) h1.textContent = d.app.title;

      // навигация
      const navGuide = document.getElementById('nav-guide');
      const navPassport = document.getElementById('nav-passport');
      if (navGuide) navGuide.textContent = d.nav.guide;
      if (navPassport) navPassport.textContent = d.nav.passport;

      // поиск
      const q = document.getElementById('q');
      if (q) q.placeholder = d.search.placeholder;

      // селект категорий (подписи — по текущему языку, значения — RU)
      const cat = document.getElementById('cat');
      if (cat) cat.setAttribute('aria-label', this.t('filter.category'));
      const mapCat = MAP_CATS[this.lang];
      if (cat){
        [...cat.options].forEach(opt=>{
          if (!opt.value) opt.textContent = this.t('filter.all');
          else            opt.textContent = mapCat[opt.value] || opt.value;
        });
      }

      // бейдж количества мест (если используется)
      const cb = document.getElementById('count-badge');
      if (cb){
        const m = cb.textContent.match(/\d+/); const n = m ? +m[0] : 0;
        cb.textContent = d.app.count(n);
        const chipAll = document.getElementById('chip-all'); if (chipAll) chipAll.textContent = d.app.count(n);
      }

      // чип с числом уникальных категорий (если есть)
      const chipCats = document.getElementById('chip-cats');
      if (chipCats && window.PPL_UNIQUE_CATS){
        chipCats.textContent = d.app.cats(window.PPL_UNIQUE_CATS);
      }

      const heroT = document.getElementById('hero-title'); if (heroT) heroT.textContent = d.app.hero;

      // бейдж «Visited»
      const vb = document.getElementById('visited-badge');
      if (vb){
        const count = (vb.textContent.match(/\d+/) || [0])[0];
        vb.textContent = `${this.t('visited.label')} ${count}`;
      }

      // теги категорий на карточках
      document.querySelectorAll('.grid .card .loc .tag').forEach(tag=>{
        const base = tag.dataset.ru || tag.textContent; // базовое (RU) значение в data-ru
        tag.dataset.ru = base;
        tag.textContent = (MAP_CATS[this.lang][base] || base);
      });

      // футер
      const footTech = document.querySelector('footer .container div:last-child');
      const copy = document.querySelector('footer .container div:first-child');
      footTech && (footTech.textContent = d.footer.tech);
      if (copy){
        const tail = copy.childNodes[copy.childNodes.length-1];
        if (tail && tail.nodeType === 3){ tail.nodeValue = ' ' + d.footer.copy; }
      }

      // активный язык
      document.querySelectorAll('a[data-lang]').forEach(a=>{
        a.classList.toggle('active', a.getAttribute('data-lang') === this.lang);
      });

      document.documentElement.setAttribute('lang', this.lang);
    },

    // ===== place-страницы =====
    updatePlaceUI(){
      const d = DICT[this.lang] || DICT[DEFAULT_LANG];

      const factsH = document.querySelector('.section h3');
      if (factsH) factsH.textContent = d.place.facts;

      const quizH = document.querySelector('.section.quiz h3');
      if (quizH) quizH.textContent = d.place.quiz;

      const checkBtn = document.getElementById('check'); if (checkBtn) checkBtn.textContent = d.place.check;

      const reconTitle = document.querySelector('.recon-head h3');
      const reconHint  = document.querySelector('.recon-head .muted');
      reconTitle && (reconTitle.textContent = d.place.reconTitle);
      reconHint  && (reconHint.textContent  = d.place.reconHint);

      const mark = document.getElementById('mark');
      const map  = document.getElementById('map');
      const share= document.getElementById('share');
      mark  && (mark.textContent  = d.place.mark);
      map   && (map.textContent   = d.place.map);
      share && (share.textContent = d.place.share);

      document.querySelectorAll('.tag').forEach(tag=>{
        const base = tag.dataset.ru || tag.textContent;
        tag.dataset.ru = base;
        tag.textContent = (MAP_CATS[this.lang][base] || base);
      });

      const copy = document.querySelector('footer .container');
      if (copy){
        const tail = copy.lastChild;
        if (tail && tail.nodeType === 3){ tail.nodeValue = ' ' + d.footer.copy; }
      }

      document.querySelectorAll('a[data-lang]').forEach(a=>{
        a.classList.toggle('active', a.getAttribute('data-lang') === this.lang);
      });

      document.documentElement.setAttribute('lang', this.lang);
    },

    // ===== guide.html =====
    updateGuideUI(){
      const d = DICT[this.lang] || DICT[DEFAULT_LANG];

      const gTitle = document.getElementById('g-title'); if (gTitle) gTitle.textContent = d.guide.title;
      const gBack  = document.getElementById('g-back');  if (gBack)  gBack.textContent  = d.guide.back;
      const gPrint = document.getElementById('g-print'); if (gPrint) gPrint.textContent = d.guide.print;
      const gNote  = document.getElementById('g-note');  if (gNote)  gNote.textContent  = d.guide.note;

      document.querySelectorAll('#toc [data-i18n]').forEach(a=>{
        const key = a.getAttribute('data-i18n'); const path = `guide_toc.${key}`;
        const text = this.t(path); if (text !== path) a.textContent = text;
      });

      document.querySelectorAll('a[data-lang]').forEach(a=>{
        a.classList.toggle('active', a.getAttribute('data-lang') === this.lang);
      });

      document.documentElement.setAttribute('lang', this.lang);
    },

    // ==== инициализация и применение ====
    init(){
      document.querySelectorAll('[data-lang]').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          const code = btn.getAttribute('data-lang');
          this.set(code);
        });
      });
      document.querySelectorAll('[data-lang]').forEach(b=>{
        b.classList.toggle('active', b.getAttribute('data-lang') === this.lang);
      });
      document.documentElement.setAttribute('lang', this.lang);
    },

    applyAll(){
      this.updateIndexUI();
      this.updatePlaceUI();
      this.updateGuideUI();
    }
  };

  // Экспорт
  window.I18N = I18N;
  window.I18N_MAP_CATS = MAP_CATS;

  // Авто-инициализация
  document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem(LS_KEY)) localStorage.setItem(LS_KEY, DEFAULT_LANG);
    I18N.init();
    I18N.applyAll();
  });
})();
</script>
