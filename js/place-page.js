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
    } catch (_) {
    }

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
    }, {passive: false});
});

// ===== helpers =====
function setVisited(btn) {
    btn.textContent = 'Отмечено ✓';
    btn.disabled = true;
    btn.setAttribute('aria-pressed', 'true');
}

function loadStore() {
    try {
        return JSON.parse(localStorage.getItem('tg_passport_v1')) || {};
    } catch {
        return {};
    }
}

function saveStore(data) {
    localStorage.setItem('tg_passport_v1', JSON.stringify(data));
}

function toast(msg) {
    // очень простой тост без зависимостей
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
    position:fixed; left:50%; bottom:24px; transform:translateX(-50%);
    background:rgba(14,165,233,.95); color:#05201a; padding:10px 14px; border-radius:12px;
    font:600 14px/1.2 system-ui,Segoe UI,Roboto,Arial; z-index:9999; box-shadow:0 10px 30px rgba(0,0,0,.25)
  `;
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.transition = 'opacity .3s';
        t.style.opacity = '0';
    }, 1400);
    setTimeout(() => t.remove(), 1800);
}

// js/place-page.js
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const P = window.PLACE || {};
        const $ = (s, r = document) => r.querySelector(s);

        // Год в футере
        const y = $('#y');
        if (y) y.textContent = new Date().getFullYear();

        // Заголовки
        const h1 = $('#title');
        const doc = $('#doc-title');
        h1 && (h1.textContent = P.name || 'Untitled');
        doc && (doc.textContent = (P.name ? P.name + ' — ' : '') + 'Turkestan Guide');

        // Локация / лид
        const loc = $('#loc');
        loc && (loc.textContent = P.loc || '');
        const lead = $('#lead');
        lead && (lead.textContent = P.lead || '');

        // Обложка
        const cover = document.querySelector('.place-hero');
        if (cover) {
            const src = P.img || ('../img/' + (P.id || 'placeholder') + '.webp');
            cover.src = src;
            cover.alt = P.name || '';
            cover.onerror = () => {
                cover.style.display = 'none';
            };
        }

        // Факты
        const facts = $('#facts');
        if (facts && Array.isArray(P.facts)) {
            facts.innerHTML = P.facts.map(t => `<li>✅ ${escapeHtml(t)}</li>`).join('');
        }

        // Квиз
        const quiz = $('#quiz');
        if (quiz && Array.isArray(P.questions)) {
            quiz.innerHTML = P.questions.map((q, i) => `
        <div class="q" data-i="${i}">
          <h4 style="margin:0 0 6px">${escapeHtml(q.q)}</h4>
          ${q.a.map((opt, idx) => `<label style="display:block;margin:6px 0">
            <input type="radio" name="q${i}" value="${idx}"> ${escapeHtml(opt)}
          </label>`).join('')}
          <div class="muted res" style="margin-top:6px"></div>
        </div>`).join('');

            const btn = $('#check');
            btn && btn.addEventListener('click', () => {
                quiz.querySelectorAll('.q').forEach(box => {
                    const i = +box.dataset.i;
                    const ok = (P.questions[i].ok | 0);
                    const picked = box.querySelector('input[type=radio]:checked');
                    const res = box.querySelector('.res');
                    if (!picked) {
                        res.textContent = 'Choose an option';
                        return;
                    }
                    res.textContent = (+picked.value === ok) ? 'Correct! 🎉' : 'Not quite. Try again.';
                });
            });
        }

        // Карта
        const map = $('#map');
        if (map) {
            map.href = `https://www.google.com/maps/search/?api=1&query=${
                encodeURIComponent((P.name || '') + ' ' + (P.loc || 'Turkestan region'))
            }`;
        }

        // Поделиться (по возможности)
        const share = $('#share');
        if (share) {
            share.addEventListener('click', async () => {
                const data = {title: P.name || 'Turkestan Guide', text: P.lead || '', url: location.href};
                if (navigator.share) {
                    try {
                        await navigator.share(data);
                    } catch {
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(location.href);
                        alert('Link copied');
                    } catch {
                    }
                }
            });
        }

        // Recon скрыт по умолчанию
        const recon = document.querySelector('.recon');
        if (recon) recon.style.display = 'none';

        // Хелпер
        function escapeHtml(s) {
            return String(s).replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[m]))
        }
    });

    // ===== Мостик "I was here" (visited + passport_log)
    (function () {
        const ID = (window.PLACE && window.PLACE.id) || null;
        const mark = document.getElementById('mark');
        if (!ID || !mark) return;

        const VIS_KEY = 'visited';      // { [id]: timestamp }
        const LOG_KEY = 'passport_log'; // [{ id, date }]

        const readJSON = (k, d) => {
            try {
                const s = localStorage.getItem(k);
                return s ? JSON.parse(s) : d;
            } catch {
                return d;
            }
        };
        const writeJSON = (k, v) => {
            try {
                localStorage.setItem(k, JSON.stringify(v));
            } catch {
            }
        };

        function isVisited(id) {
            const v = readJSON(VIS_KEY, {});
            return !!v[id];
        }

        function setVisited(id, on) {
            const v = readJSON(VIS_KEY, {});
            if (on) v[id] = Date.now(); else delete v[id];
            writeJSON(VIS_KEY, v);

            let log = readJSON(LOG_KEY, []);
            if (on) {
                if (!log.find(x => x.id === id)) log.push({id, date: Date.now()});
            } else {
                log = log.filter(x => x.id !== id);
            }
            writeJSON(LOG_KEY, log);
        }

        function syncUI() {
            const on = isVisited(ID);
            mark.dataset.on = on ? '1' : '';
            const base = (window.I18N && I18N.t) ? I18N.t('place.mark') : 'I was here';
            mark.textContent = on ? (base + ' ✓') : base;
        }

        mark.addEventListener('click', () => {
            const on = isVisited(ID);
            setVisited(ID, !on);
            syncUI();
            if (window.updateVisitedBadge) {
                try {
                    const total = Object.keys(readJSON(VIS_KEY, {})).length;
                    updateVisitedBadge(total);
                } catch {
                }
            }
        });
        syncUI();
    })();
})();
