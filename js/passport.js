// js/passport.js
(function(){
  const YEAR = document.getElementById('y'); YEAR && (YEAR.textContent = new Date().getFullYear());

  // Полный список (id → краткая карточка). Названия и локации — как в ваших place-страницах.
  const ALL = [
    {id:'yasawi', name:'Мавзолей Х.А. Яссауи', loc:'г. Туркестан'},
    {id:'azret-sultan', name:'Заповедник-музей «Азрет-Султан»', loc:'центр Туркестана'},
    {id:'rabia-sultan-begim', name:'Мавзолей Рабии Султан Бегим', loc:'рядом с Яссауи'},
    {id:'khilvet', name:'Подземная мечеть Хильвет', loc:'«Азрет-Султан»'},
    {id:'esim-khan', name:'Мавзолей Есим хана', loc:'«Азрет-Султан»'},
    {id:'ethnoaul', name:'Этноаул', loc:'г. Туркестан'},
    {id:'juma', name:'Джума-мечеть', loc:'г. Туркестан'},
    {id:'regional-museum', name:'Историко-краеведческий музей', loc:'г. Туркестан'},
    {id:'keruen-sarai', name:'Керуен Сарай', loc:'новый город'},
    {id:'kultobe', name:'Городище Культобе', loc:'исторический центр'},
    {id:'yasawi-museum', name:'Музей Х.А. Яссауи', loc:'«Азрет-Султан»'},
    {id:'railway', name:'Железнодорожный вокзал', loc:'г. Туркестан'},
    {id:'amphitheater', name:'Амфитеатр', loc:'г. Туркестан'},
    {id:'drama-theater', name:'Музыкально-драматический театр', loc:'г. Туркестан'},
    {id:'jibek-joly-park', name:'Парк аттракционов Jіbek Joly', loc:'центр города'},
    {id:'flying-theater', name:'Летающий театр', loc:'г. Туркестан'},
    {id:'first-president-park', name:'Парк Первого Президента', loc:'г. Туркестан'},
    {id:'gauhar-ana', name:'Мавзолей «Гаухар Ана»', loc:'вблизи города'},
    {id:'ukasha-ata', name:'Мавзолей и колодец Укаша Ата', loc:'вблизи города'},
    {id:'arystan-bab', name:'Мавзолей Арыстан-Баба', loc:'~150 км от Туркестана'},
    {id:'karatau-reserve', name:'Каратауский заповедник', loc:'горы Каратау'},
    {id:'akmeshit-cave', name:'Пещера Акмешит', loc:'~90 км от города'},
  ];
  const TOTAL = ALL.length;

  // ===== STORAGE =====
  function loadStore(){
    try{
      const raw = localStorage.getItem('tg_passport_v1');
      const d = raw ? JSON.parse(raw) : {};
      return {visited:(d.visited||{}), profile:(d.profile||{})};
    }catch{ return {visited:{}, profile:{}}; }
  }
  function saveStore(data){
    localStorage.setItem('tg_passport_v1', JSON.stringify(data));
  }

  // ===== UI REFS =====
  const nameEl = document.getElementById('p-name');
  const classEl = document.getElementById('p-class');
  const prBar = document.getElementById('pr-bar');
  const prText = document.getElementById('pr-text');
  const visitedBadge = document.getElementById('visited-badge');
  const levelEl = document.getElementById('level');
  const achWrap = {
    a5: document.getElementById('ach-5'),
    a12: document.getElementById('ach-12'),
    a20: document.getElementById('ach-20'),
  };
  const stamps = document.getElementById('stamps');
  const timeline = document.getElementById('timeline');

  const btnPrint = document.getElementById('btn-print');
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');
  const btnReset = document.getElementById('btn-reset');

  let store = loadStore();

  // init profile
  nameEl.value = store.profile?.name || '';
  classEl.value = store.profile?.klass || '';
  nameEl.addEventListener('input', commitProfile);
  classEl.addEventListener('input', commitProfile);
  function commitProfile(){
    store.profile = {name: nameEl.value.trim(), klass: classEl.value.trim()};
    saveStore(store);
  }

  // build stamps
  render();

  function render(){
    const v = store.visited || {};
    const visitedIds = Object.keys(v);
    // header stats
    const done = visitedIds.length;
    const pct = Math.round((done / TOTAL) * 100);
    prBar.style.width = pct + '%';
    prText.textContent = `${done} из ${TOTAL} мест`;
    visitedBadge.textContent = `${done}/${TOTAL}`;

    // level
    let level = 'новичок';
    if (done >= 20) level = 'мастер-следопыт';
    else if (done >= 12) level = 'исследователь';
    else if (done >= 5) level = 'путешественник';
    levelEl.textContent = `Уровень: ${level}`;

    // achievements
    achWrap.a5.classList.toggle('on', done >= 5);
    achWrap.a12.classList.toggle('on', done >= 12);
    achWrap.a20.classList.toggle('on', done >= 20);

    // stamps grid
    stamps.innerHTML = '';
    ALL.forEach(p=>{
      const rec = v[p.id];
      const isVisited = !!rec;
      const item = document.createElement('article');
      item.className = 'stamp' + (isVisited ? ' visited' : '');
      item.innerHTML = `
        <svg class="emblem" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" fill="none"/>
        </svg>
        <div class="title">${esc(p.name)}</div>
        <div class="loc">${esc(p.loc)}</div>
        <div class="row" style="justify-content:space-between;align-items:center">
          <div class="${isVisited?'date':'status'}">${isVisited?('Посещено: '+fmtDate(rec)): 'Ещё не посещено'}</div>
          <a class="btn" href="places/${p.id}.html">Открыть</a>
        </div>
      `;
      stamps.appendChild(item);
    });

    // timeline
    const visits = visitedIds.map(id=>({id, ts: store.visited[id]})).sort((a,b)=>b.ts-a.ts);
    timeline.innerHTML = visits.length ? '' : '<div class="muted">Пока пусто — отметьте хотя бы одно место кнопкой «Был здесь».</div>';
    visits.forEach(v=>{
      const place = ALL.find(x=>x.id===v.id);
      const el = document.createElement('div');
      el.className = 'tl-item';
      el.innerHTML = `<b>${esc(place?.name||v.id)}</b> — ${esc(place?.loc||'')}
        <div class="muted" style="font-size:12px">Дата: ${fmtFull(v.ts)}</div>`;
      timeline.appendChild(el);
    });
  }

  // buttons
  btnPrint?.addEventListener('click', ()=> window.print());

  btnExport?.addEventListener('click', ()=>{
    const data = JSON.stringify(store, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'turkestan-passport.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  btnImport?.addEventListener('click', ()=>{
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = ()=> {
      const f = inp.files?.[0]; if(!f) return;
      const r = new FileReader();
      r.onload = ()=> {
        try{
          const obj = JSON.parse(String(r.result));
          if (!obj || typeof obj!=='object') throw 0;
          store = {visited: obj.visited||{}, profile: obj.profile||{}};
          saveStore(store);
          nameEl.value = store.profile?.name||''; classEl.value = store.profile?.klass||'';
          render();
          alert('Импорт успешно выполнен!');
        }catch(e){ alert('Файл повреждён или неверный формат.'); }
      };
      r.readAsText(f);
    };
    inp.click();
  });

  btnReset?.addEventListener('click', ()=>{
    if (!confirm('Точно удалить все отметки и профиль?')) return;
    store = {visited:{}, profile:{}};
    saveStore(store);
    nameEl.value = ''; classEl.value = '';
    render();
  });

  // === helpers ===
  function fmtDate(ts){
    try{ return new Date(ts).toLocaleDateString('ru-RU'); }catch{ return '—'; }
  }
  function fmtFull(ts){
    try{ return new Date(ts).toLocaleString('ru-RU'); }catch{ return '—'; }
  }
  function esc(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
})();
