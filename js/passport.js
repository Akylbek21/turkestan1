// js/passport.js — Traveler Passport (EN) — 27 places + reset fix + legacy sync
(function () {
  const YEAR = document.getElementById('y');
  if (YEAR) YEAR.textContent = new Date().getFullYear();

  // ---- 27 PLACES (id, English name, English location) ----
  const ALL = [
    { id:'arys-station',        name:'Railway Station “Arys-1”',                 loc:'Arys city' },
    { id:'otrar',               name:'Otrar (Otyrar-Tobe) Site',                 loc:'Shaulder village' },
    { id:'kuyryktobe',          name:'Kuyryktobe Ancient Settlement',            loc:'near Qogam village' },
    { id:'sauran',              name:'Sauran Fortress',                           loc:'Turkestan Region' },
    { id:'munlyk-zarlyk',       name:'Epic “Munlyq–Zarlyq”',                      loc:'Turkestan' },

    { id:'yasawi',              name:'Mausoleum of Khoja Ahmed Yasawi',          loc:'Turkestan' },
    { id:'azret-sultan',        name:'Azret Sultan Reserve-Museum',               loc:'Turkestan center' },
    { id:'rabia-sultan-begim',  name:'Mausoleum of Rabia Sultan Begim',           loc:'near Yasawi' },
    { id:'khilvet',             name:'Underground Mosque Khilvet',                loc:'Azret Sultan' },
    { id:'esim-khan',           name:'Mausoleum of Esim Khan',                    loc:'Azret Sultan' },
    { id:'ethnoaul',            name:'Ethno-village',                             loc:'Turkestan' },
    { id:'juma',                name:'Juma Mosque',                               loc:'Turkestan' },
    { id:'regional-museum',     name:'Regional History Museum',                   loc:'Turkestan' },
    { id:'keruen-sarai',        name:'Keruen Sarai',                              loc:'new town' },
    { id:'kultobe',             name:'Kultobe Settlement',                        loc:'historic center' },
    { id:'yasawi-museum',       name:'Khoja Ahmed Yasawi Museum',                 loc:'Azret Sultan' },
    { id:'railway',             name:'Railway Station Building',                  loc:'Turkestan' },
    { id:'amphitheater',        name:'Amphitheatre',                              loc:'Turkestan' },
    { id:'drama-theater',       name:'Kazakh Music & Drama Theatre',              loc:'Turkestan' },
    { id:'jibek-joly-park',     name:'Jіbek Joly Amusement Park',                 loc:'city center' },
    { id:'flying-theater',      name:'Flying Theatre',                             loc:'Turkestan' },
    { id:'first-president-park',name:'First President Park',                       loc:'Turkestan' },
    { id:'gauhar-ana',          name:'Mausoleum of Gauhar Ana',                    loc:'near the city' },
    { id:'ukasha-ata',          name:'Ukasha Ata Mausoleum & Well',                loc:'near the city' },
    { id:'arystan-bab',         name:'Arystan Bab Mausoleum',                      loc:'~150 km from Turkestan' },
    { id:'karatau-reserve',     name:'Karatau Nature Reserve',                     loc:'Karatau Mountains' },
    { id:'akmeshit-cave',       name:'Akmeshit Cave',                              loc:'~90 km from the city' }
  ];
  const TOTAL = ALL.length; // 27

  // ---- Storage (single key) + legacy migration ----
  const KEY = 'tg_passport_v1';            // { visited:{[id]:timestamp}, profile:{name,klass} }
  const LEGACY_VIS = 'visited';            // { [id]:timestamp } — used on place pages
  const LEGACY_LOG = 'passport_log';       // optional array

  function readJSON(k, d){ try{ const s=localStorage.getItem(k); return s?JSON.parse(s):d; }catch{ return d; } }
  function writeJSON(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }

  function loadStore(){
    // base
    const base = readJSON(KEY, {visited:{}, profile:{}});

    // merge legacy visited if present
    const legacy = readJSON(LEGACY_VIS, null);
    if (legacy && typeof legacy === 'object'){
      base.visited = Object.assign({}, base.visited, legacy);
      // persist into unified key
      writeJSON(KEY, base);
    }
    return base;
  }

  let store = loadStore();

  // ---- UI refs ----
  const nameEl       = document.getElementById('p-name');
  const classEl      = document.getElementById('p-class');
  const prBar        = document.getElementById('pr-bar');
  const prText       = document.getElementById('pr-text');
  const visitedBadge = document.getElementById('visited-badge');
  const levelEl      = document.getElementById('level');
  const stamps       = document.getElementById('stamps');
  const timeline     = document.getElementById('timeline');

  const ach = {
    a5:  document.getElementById('ach-5'),
    a12: document.getElementById('ach-12'),
    a20: document.getElementById('ach-20'),
  };

  const btnPrint  = document.getElementById('btn-print');
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');
  const btnReset  = document.getElementById('btn-reset');

  // ---- Profile init ----
  if (nameEl) nameEl.value  = store.profile?.name  || '';
  if (classEl) classEl.value = store.profile?.klass || '';
  function commitProfile(){
    store.profile = { name: (nameEl?.value||'').trim(), klass: (classEl?.value||'').trim() };
    writeJSON(KEY, store);
  }
  nameEl?.addEventListener('input', commitProfile);
  classEl?.addEventListener('input', commitProfile);

  // ---- Render ----
  render();

  function render(){
    const v = store.visited || {};
    const visitedIds = Object.keys(v);
    const done = visitedIds.length;
    const pct = Math.round((done / TOTAL) * 100);

    if (prBar)  prBar.style.width = pct + '%';
    if (prText) prText.textContent = `${done} of ${TOTAL} places`;
    if (visitedBadge) visitedBadge.textContent = `Visited: ${done}/${TOTAL}`;

    // level
    let level = 'newcomer';
    if (done >= 20) level = 'master pathfinder';
    else if (done >= 12) level = 'explorer';
    else if (done >= 5)  level = 'traveler';
    if (levelEl) levelEl.textContent = `Level: ${cap(level)}`;

    // achievements
    ach.a5  && ach.a5.classList.toggle('on',  done >= 5);
    ach.a12 && ach.a12.classList.toggle('on', done >= 12);
    ach.a20 && ach.a20.classList.toggle('on', done >= 20);

    // stamps
    if (stamps){
      stamps.innerHTML = '';
      ALL.forEach(p=>{
        const ts = v[p.id];
        const isVisited = !!ts;
        const art = document.createElement('article');
        art.className = 'stamp' + (isVisited ? ' visited' : '');
        art.innerHTML = `
          <svg class="emblem" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none"/>
          </svg>
          <div class="title">${esc(p.name)}</div>
          <div class="loc">${esc(p.loc)}</div>
          <div class="row" style="justify-content:space-between;align-items:center">
            <div class="${isVisited?'date':'status'}">
              ${isVisited ? ('Visited: ' + fmtDate(ts)) : 'Not visited yet'}
            </div>
            <a class="btn" href="places/${p.id}.html" target="_blank" rel="noopener">Open</a>
          </div>
        `;
        stamps.appendChild(art);
      });
    }

    // timeline
    if (timeline){
      const visits = visitedIds.map(id=>({id, ts: v[id]})).sort((a,b)=>b.ts-a.ts);
      timeline.innerHTML = visits.length
        ? ''
        : '<div class="muted">Empty — mark a place with “I was here”.</div>';
      visits.forEach(rec=>{
        const place = ALL.find(x=>x.id===rec.id);
        const el = document.createElement('div');
        el.className = 'tl-item';
        el.innerHTML = `<b>${esc(place?.name||rec.id)}</b> — ${esc(place?.loc||'')}
          <div class="muted" style="font-size:12px">Date: ${fmtFull(rec.ts)}</div>`;
        timeline.appendChild(el);
      });
    }
  }

  // ---- Buttons ----
  btnPrint?.addEventListener('click', ()=>window.print());

  btnExport?.addEventListener('click', ()=>{
    const data = JSON.stringify(store, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'turkestan-passport.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  btnImport?.addEventListener('click', ()=>{
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = ()=>{
      const f = inp.files?.[0]; if(!f) return;
      const r = new FileReader();
      r.onload = ()=>{
        try{
          const obj = JSON.parse(String(r.result||''));
          if (!obj || typeof obj!=='object') throw 0;
          store = { visited: (obj.visited||{}), profile: (obj.profile||{}) };
          writeJSON(KEY, store);
          if (nameEl)  nameEl.value  = store.profile?.name  || '';
          if (classEl) classEl.value = store.profile?.klass || '';
          render();
          alert('Import completed successfully.');
        }catch{ alert('File is corrupted or invalid format.'); }
      };
      r.readAsText(f);
    };
    inp.click();
  });

  btnReset?.addEventListener('click', ()=>{
    if (!confirm('Reset all progress? This will clear visited marks and profile.')) return;

    // clear unified + legacy keys
    try{
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_VIS);
      localStorage.removeItem(LEGACY_LOG);
    }catch{}

    store = { visited:{}, profile:{} };
    if (nameEl)  nameEl.value  = '';
    if (classEl) classEl.value = '';
    render();
    alert('Progress cleared.');
  });

  // ---- Helpers ----
  function fmtDate(ts){ try{ return new Date(ts).toLocaleDateString('en-US'); }catch{ return '—'; } }
  function fmtFull(ts){ try{ return new Date(ts).toLocaleString('en-US'); }catch{ return '—'; } }
  function esc(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  // expose total for other scripts (optional)
  window.PPL_TOTAL = TOTAL;
})();
