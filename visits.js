(function () {
  'use strict';
  if (!['eunbitdam.com', 'www.eunbitdam.com'].includes(location.hostname)) return;
  const footer = document.querySelector('footer');
  if (!footer || document.getElementById('eunbitdamVisitCounter')) return;
  const endpoint = 'https://jkyavwcdzkityyqsazel.supabase.co/rest/v1/rpc/';
  const apiKey = 'sb_publishable_dNe8kUYYQfh6m6umLmCgtQ_vrb1YfZK';
  const style = document.createElement('style');
  style.textContent = `
    #eunbitdamVisitCounter{box-sizing:border-box;flex-basis:100%;grid-column:1/-1;width:100%;padding:24px 0 8px;border-top:1px solid #ded1c3;color:inherit}
    #eunbitdamVisitCounter h2{font:inherit;font-size:1rem;font-weight:600;margin:0 0 16px}
    #eunbitdamVisitCounter .visitGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;max-width:760px;margin:0;padding:0}
    #eunbitdamVisitCounter .visitGrid div{min-width:0}
    #eunbitdamVisitCounter dt{font-size:.875rem;margin-bottom:8px}
    #eunbitdamVisitCounter dd{margin:0;font-size:1.6rem;font-weight:600;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
    #eunbitdamVisitCounter p{font-size:.875rem;line-height:1.7;margin:16px 0 0;max-width:760px}
    @media(max-width:540px){#eunbitdamVisitCounter .visitGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}}
  `;
  document.head.appendChild(style);
  const box = document.createElement('section');
  box.id = 'eunbitdamVisitCounter';
  box.setAttribute('aria-label', '은빛담 방문자 통계');
  box.innerHTML = '<h2>은빛담을 찾아주신 분들</h2><dl class="visitGrid">' +
    [['today', '오늘'], ['month', '이번 달'], ['year', '올해'], ['total', '전체 누적']]
      .map(([key, label]) => '<div><dt>' + label + '</dt><dd data-visits="' + key + '">—</dd></div>').join('') +
    '</dl><p id="visitCounterNote" role="status">방문자 통계를 불러오는 중입니다.</p>';
  footer.appendChild(box);
  const note = box.querySelector('#visitCounterNote');
  let busy = false;

  async function rpc(name, payload) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 10000);
    try {
      const response = await fetch(endpoint + name, {
        method: 'POST', headers: { apikey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: abort.signal, cache: 'no-store'
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } finally { clearTimeout(timer); }
  }

  function browserId() {
    const key = 'eunbitdam-visitor-id-v1';
    for (const storageName of ['localStorage', 'sessionStorage']) {
      try {
        const storage = window[storageName];
        let id = storage.getItem(key);
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '')) {
          id = crypto.randomUUID(); storage.setItem(key, id);
        }
        return id;
      } catch (_) { /* 저장을 차단한 브라우저는 다음 저장 방식으로 시도 */ }
    }
    return null;
  }

  async function refresh() {
    if (busy) return;
    busy = true;
    try {
      const id = browserId();
      const bot = /bot|crawler|spider|headless/i.test(navigator.userAgent) || navigator.webdriver;
      let recorded = !id || bot;
      if (id && !bot) {
        try { await rpc('eunbitdam_record_visit', { p_visitor_id: id }); recorded = true; } catch (_) {}
      }
      const stats = await rpc('eunbitdam_visit_stats', {});
      if (!stats || !/^\d{4}-\d{2}-\d{2}$/.test(stats.as_of || '') ||
          !['today', 'month', 'year', 'total'].every(key => Number.isSafeInteger(stats[key]) && stats[key] >= 0)) throw new Error('Invalid statistics');
      box.querySelectorAll('[data-visits]').forEach(el => { el.textContent = stats[el.dataset.visits].toLocaleString('ko-KR') + '명'; });
      const started = /^\d{4}-\d{2}-\d{2}$/.test(stats.started_on || '') ? stats.started_on + '부터 집계 · ' : '';
      note.textContent = started + '한국 시간 기준. 같은 브라우저는 각 기간에 한 번만 집계합니다. 기기 변경·저장정보 삭제 시 별도 방문자로 집계됩니다.' +
        (recorded ? '' : ' 현재 방문 기록은 일시적으로 지연되고 있습니다.');
    } catch (_) {
      box.querySelectorAll('[data-visits]').forEach(el => { el.textContent = '—'; });
      note.textContent = '방문자 통계를 현재 표시할 수 없습니다. 연결이 준비되면 숫자가 표시됩니다.';
    } finally { busy = false; }
  }
  refresh();
  // 장시간 열어 둔 페이지도 날짜가 바뀌면 새 한국 날짜로 집계합니다.
  setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 300000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
})();
