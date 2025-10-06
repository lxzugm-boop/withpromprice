
// Search
function applyFilter(query) {
  const q = (query || '').trim().toLowerCase();
  const rows = document.querySelectorAll('table.price tbody tr');
  rows.forEach(tr => {
    if (tr.classList.contains('subcat')) { tr.style.display = ''; return; }
    if (!q) { tr.style.display = ''; return; }
    const text = tr.innerText.toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
}
document.addEventListener('input', e => {
  if (e.target && e.target.id === 'q') applyFilter(e.target.value);
});
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) { const inp = document.getElementById('q'); if (inp) { inp.value = q; applyFilter(q); } }
});

// Discount
function recalcDiscount(pct) {
  document.querySelectorAll('table.price tbody tr').forEach(tr => {
    const cell = tr.querySelector('td.price');
    if (!cell) return;
    let base;
    if (cell.dataset.original) base = parseFloat(cell.dataset.original);
    else {
      const num = (cell.textContent || '').replace(/[^\d]/g, '');
      base = parseFloat(num || '0'); cell.dataset.original = base;
    }
    if (!isFinite(base)) return;
    const disc = Math.round(base * (1 - pct/100));
    cell.textContent = disc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  });
}
document.addEventListener('click', e => {
  if (e.target && e.target.id === 'applyDiscount') {
    const pct = parseFloat((document.getElementById('discount')||{}).value) || 0;
    recalcDiscount(pct);
  }
  if (e.target && e.target.id === 'resetDiscount') {
    document.querySelectorAll('td.price[data-original]').forEach(c => {
      const base = parseInt(c.dataset.original);
      c.textContent = base.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      delete c.dataset.original;
    });
    const inp = document.getElementById('discount'); if (inp) inp.value='';
  }
});

// Zoom
(function initZoom(){
  const ov = document.createElement('div');
  ov.className = 'zoom-overlay'; ov.style.display='none'; ov.innerHTML = '<img/>';
  document.body.appendChild(ov);
  ov.addEventListener('click', ()=> ov.style.display='none');
  document.addEventListener('click', e => {
    const img = e.target.closest('td.imgcell img');
    if (img) { ov.querySelector('img').src = img.src; ov.style.display='flex'; }
  });
})();

// Sync ?q=
(function syncQuery(){
  const input = document.getElementById('q');
  document.querySelectorAll('a.btn.price[href]').forEach(a => {
    a.addEventListener('click', ev => {
      if (input && input.value) {
        ev.preventDefault();
        const url = new URL(a.href, location.href);
        url.searchParams.set('q', input.value.trim());
        location.href = url.toString();
      }
    });
  });
})();

// Auto CBR (USD & CNY) into header and optional block
window.addEventListener('DOMContentLoaded', () => {
  fetch('https://www.cbr-xml-daily.ru/daily_json.js')
    .then(r => r.json())
    .then(data => {
      const date = new Date(data.Date).toLocaleDateString('ru-RU');
      const usd = data.Valute.USD?.Value?.toFixed(2);
      const cny = data.Valute.CNY?.Value?.toFixed(2);
      const kd = document.querySelector('.kursy-inline .kurs-date');
      const ku = document.querySelector('.kursy-inline .kurs-usd');
      const kc = document.querySelector('.kursy-inline .kurs-cny');
      if (kd) kd.textContent = `Курс ЦБ: ${date}`;
      if (ku) ku.textContent = `USD: ${usd} ₽`;
      if (kc) kc.textContent = `CNY: ${cny} ₽`;
      const block = document.querySelector('.kursy');
      if (block) block.innerHTML = `<h3>Курс ЦБ на ${date}</h3><ul><li>USD: ${usd} ₽</li><li>CNY: ${cny} ₽</li></ul>`;
    })
    .catch(() => {
      const kd = document.querySelector('.kursy-inline .kurs-date');
      if (kd) kd.textContent = 'Курс ЦБ: недоступен';
    });
});
