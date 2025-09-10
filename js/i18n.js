// js/i18n.js — RU/KK переключатель с localStorage
(function () {
  const LS_KEY = 'lang';

  // Отображаемые названия категорий (value в <option> остаются RU!)
  const MAP_CATS = {
    ru: {
      'Мавзолей':'Мавзолей','Мечеть':'Мечеть','Археология':'Археология','Музей':'Музей',
      'Культура':'Культура','Сцена':'Сцена','Развлечения':'Развлечения','Парк':'Парк',
      'Аттракцион':'Аттракцион','Природа':'Природа','Пещера':'Пещера','Инфраструктура':'Инфраструктура'
    },
    kk: {
      'Мавзолей':'Кесене','Мечеть':'Мешіт','Археология':'Археология','Музей':'Мұражай',
      'Культура':'Мәдениет','Сцена':'Сахна','Развлечения':'Ойын-сауық','Парк':'Саябақ',
      'Аттракцион':'Аттракцион','Природа':'Табиғат','Пещера':'Үңгір','Инфраструктура':'Инфрақұрылым'
    }
  };

  // Словарь
  const DICT = {
    ru: {
      app:{ title:'Достопримечательности Туркестанской области' },
      nav:{ guide:'Гид', passport:'Паспорт' },
      search:{ placeholder:'Поиск: Яссауи, Отырар, Сауран…' },
      filter:{ category:'Категория', all:'Все категории' },
      visited:{ label:'Посещено:' },
      place:{
        facts:'Интересные факты',
        quiz:'Проверь знания',
        check:'Проверить',
        reconTitle:'Прошлое / сегодня',
        reconHint:'Проведите ползунок',
        mark:'Был здесь',
        map:'Открыть в Google Maps',
        share:'Поделиться',
        pick:'Выберите вариант',
        right:'Верно! 🎉',
        wrong:'Неверно. Попробуйте ещё.'
      },
      footer:{ copy:'Turkestan Guide — мультистраничная версия', tech:'HTML • CSS • JS' },
      toast:{ copied:'Ссылка скопирована!' }
    },
    kk: {
      app:{ title:'Түркістан облысының көрікті жерлері' },
      nav:{ guide:'Нұсқаулық', passport:'Саяхатшы паспорты' },
      search:{ placeholder:'Іздеу: Яссауи, Отырар, Сауран…' },
      filter:{ category:'Санат', all:'Барлық санаттар' },
      visited:{ label:'Барғандар:' },
      place:{
        facts:'Қызықты деректер',
        quiz:'Біліміңді тексер',
        check:'Тексеру',
        reconTitle:'Өткен / бүгін',
        reconHint:'Жүгірткіні жылжытыңыз',
        mark:'Бардым',
        map:'Google картасында ашу',
        share:'Бөлісу',
        pick:'Нұсқаны таңдаңыз',
        right:'Дұрыс! 🎉',
        wrong:'Дұрыс емес. Қайталап көріңіз.'
      },
      footer:{ copy:'Turkestan Guide — көпбетті нұсқа', tech:'HTML • CSS • JS' },
      toast:{ copied:'Сілтеме көшірілді!' }
    }
  };

  const I18N = {
    lang: localStorage.getItem(LS_KEY) || 'ru',
    _cbs:[],
    set(l){
      this.lang = (l === 'kk' ? 'kk' : 'ru');
      localStorage.setItem(LS_KEY, this.lang);
      this.applyAll();
      this._cbs.forEach(fn => fn(this.lang));
    },
    get(){ return this.lang; },
    onChange(fn){ this._cbs.push(fn); },
    t(key){
      const d = DICT[this.lang] || {};
      const r = key.split('.').reduce((o,k)=>o && o[k], d);
      return (r == null) ? key : r;
    },

    // ===== index.html =====
    updateIndexUI(){
      const h1 = document.querySelector('header h1');
      if (h1) h1.textContent = this.t('app.title');

      const nav = document.querySelectorAll('header a.badge');
      nav.forEach(a=>{
        const href = a.getAttribute('href') || '';
        if (href.includes('guide'))    a.textContent = this.t('nav.guide');
        if (href.includes('passport')) a.textContent = this.t('nav.passport');
      });

      const q = document.getElementById('q');
      if (q) q.placeholder = this.t('search.placeholder');

      const cat = document.getElementById('cat');
      if (cat) cat.setAttribute('aria-label', this.t('filter.category'));
      const mapCat = MAP_CATS[this.lang];
      if (cat){
        [...cat.options].forEach(opt=>{
          if (!opt.value) opt.textContent = this.t('filter.all');
          else            opt.textContent = mapCat[opt.value] || opt.value;
        });
      }

      const vb = document.getElementById('visited-badge');
      if (vb){
        const count = (vb.textContent.match(/\d+/) || [0])[0];
        vb.textContent = `${this.t('visited.label')} ${count}`;
      }

      document.querySelectorAll('.grid .card .loc .tag').forEach(tag=>{
        const ru = tag.dataset.ru || tag.textContent;
        tag.dataset.ru = ru;
        tag.textContent = (MAP_CATS[this.lang][ru] || ru);
      });

      const foot = document.querySelector('footer .container div:last-child');
      const copy = document.querySelector('footer .container div:first-child');
      foot && (foot.textContent = this.t('footer.tech'));
      copy && (copy.childNodes[0].nodeValue = `© ${new Date().getFullYear()} ${this.t('footer.copy')} `);

      document.documentElement.setAttribute('lang', this.lang === 'kk' ? 'kk' : 'ru');
    },

    // ===== place-страницы =====
    updatePlaceUI(){
      const factsH = document.querySelector('.section h3');
      if (factsH) factsH.textContent = this.t('place.facts');

      const quizH = document.querySelector('.section.quiz h3');
      if (quizH) quizH.textContent = this.t('place.quiz');

      const checkBtn = document.getElementById('check');
      if (checkBtn) checkBtn.textContent = this.t('place.check');

      const reconTitle = document.querySelector('.recon-head h3');
      const reconHint  = document.querySelector('.recon-head .muted');
      reconTitle && (reconTitle.textContent = this.t('place.reconTitle'));
      reconHint  && (reconHint.textContent  = this.t('place.reconHint'));

      const mark = document.getElementById('mark');
      const map  = document.getElementById('map');
      const share= document.getElementById('share');
      mark  && (mark.textContent  = this.t('place.mark'));
      map   && (map.textContent   = this.t('place.map'));
      share && (share.textContent = this.t('place.share'));

      const y = document.getElementById('y'); y && (y.textContent = new Date().getFullYear());
      const copy = document.querySelector('footer .container');
      copy && (copy.lastChild && (copy.lastChild.nodeValue = ' ' + this.t('footer.copy')));

      document.querySelectorAll('.tag').forEach(tag=>{
        const ru = tag.dataset.ru || tag.textContent;
        tag.dataset.ru = ru;
        tag.textContent = (MAP_CATS[this.lang][ru] || ru);
      });

      document.documentElement.setAttribute('lang', this.lang === 'kk' ? 'kk' : 'ru');
    },

    init(){
      document.querySelectorAll('[data-lang]').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          this.set(btn.dataset.lang);
          document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active', b.dataset.lang===this.lang));
        });
      });
      document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active', b.dataset.lang===this.lang));
      document.documentElement.setAttribute('lang', this.lang === 'kk' ? 'kk' : 'ru');
    },

    applyAll(){
      this.updateIndexUI();
      this.updatePlaceUI();
    }
  };

  // Экспорт
  window.I18N = I18N;
  window.I18N_MAP_CATS = MAP_CATS;

  // Авто-инициализация (можно не вызывать вручную)
  document.addEventListener('DOMContentLoaded', function () {
    I18N.init();
    I18N.applyAll();
  });
})();
