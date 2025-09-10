// Паспорт путешественника
const Passport = {
  key: 'passport.visited',
  load(){ try { return JSON.parse(localStorage.getItem(this.key)||'{}'); } catch(_) { return {}; } },
  save(v){ localStorage.setItem(this.key, JSON.stringify(v)); },
  mark(id){ const v=this.load(); v[id]=Date.now(); this.save(v); },
  unmark(id){ const v=this.load(); delete v[id]; this.save(v); },
  has(id){ return !!this.load()[id]; }
};

// Заглушка-картина если нет фото
function coverArt(title, a=200, b=320){
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop stop-color='hsl(${a},80%,55%)'/><stop offset='1' stop-color='hsl(${b},80%,50%)'/></linearGradient></defs>
    <rect fill='url(#g)' width='1200' height='800'/>
    <text x='50%' y='54%' text-anchor='middle' font-size='70' font-family='Inter,Segoe UI,Arial'
      fill='rgba(255,255,255,.92)' style='paint-order:stroke;stroke:#000;stroke-width:8'>${title.replace(/&/g,'&amp;')}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}

function updateVisitedBadge(total){
  const el = document.getElementById('visited-badge');
  if (!el) return;
  const was = Object.keys(Passport.load()).length;
  el.textContent = `Посещено: ${was} из ${total}`;
}
