// js/place-page.js
// Делает кнопку "Был здесь" кликабельной и сохраняет отметку в localStorage

document.addEventListener('DOMContentLoaded', () => {
  const PLACE = (window.PLACE || {});
  const btn = document.getElementById('mark');

  // Быстрая диагностика в консоли (поможет, если что-то не так)
  if (!btn) {
    console.warn('[place-page] Кнопка #mark не найдена на странице.');
    return;
  }
  if (!PLACE.id) {
    console.error('[place-page] window.PLACE.id отсутствует. Убедись, что скрипт с window.PLACE подключён ПЕРЕД этим файлом.');
    btn.disabled = true;
    return;
  }

  // Восстановление состояния: если уже отмечено — заблокируем кнопку
  try {
    const store = loadStore();
    if (store.visited && store.visited[PLACE.id]) {
      setVisited(btn);
    }
  } catch (_) {}

  // Клик по кнопке «Был здесь»
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const store = loadStore();
      store.visited = store.visited || {};
      // не перезаписываем дату, если уже есть
      if (!store.visited[PLACE.id]) {
        store.visited[PLACE.id] = Date.now();
        saveStore(store);
      }
      setVisited(btn);
      toast('Место добавлено в Паспорт!');
    } catch (err) {
      alert('Не удалось сохранить отметку. Проверьте разрешения браузера для localStorage.');
      console.error(err);
    }
  }, { passive: false });
});

// ===== helpers =====
function setVisited(btn){
  btn.textContent = 'Отмечено ✓';
  btn.disabled = true;
  btn.setAttribute('aria-pressed', 'true');
}

function loadStore(){
  try { return JSON.parse(localStorage.getItem('tg_passport_v1')) || {}; }
  catch { return {}; }
}
function saveStore(data){
  localStorage.setItem('tg_passport_v1', JSON.stringify(data));
}

function toast(msg){
  // очень простой тост без зависимостей
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; left:50%; bottom:24px; transform:translateX(-50%);
    background:rgba(14,165,233,.95); color:#05201a; padding:10px 14px; border-radius:12px;
    font:600 14px/1.2 system-ui,Segoe UI,Roboto,Arial; z-index:9999; box-shadow:0 10px 30px rgba(0,0,0,.25)
  `;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.transition='opacity .3s'; t.style.opacity='0'; }, 1400);
  setTimeout(()=> t.remove(), 1800);
}
