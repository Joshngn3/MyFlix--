/* ===== Favorites (shared, global) ===== */
window.FAV_KEY = 'myflix:favorites';

window.getFavorites = () =>
  JSON.parse(localStorage.getItem(FAV_KEY) || '[]');

window.setFavorites = (arr) => {
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  // beri tahu semua halaman/tab
  window.dispatchEvent(new Event('favorites:changed'));
};

window.isFav = (item) =>
  getFavorites().some(f => f.img === item.img && f.title === item.title);

window.toggleFav = (item) => {
  const favs = getFavorites();
  const i = favs.findIndex(f => f.img === item.img && f.title === item.title);
  if (i === -1) favs.push(item); else favs.splice(i, 1);
  setFavorites(favs);
};

/* ====== RENDER: Trending rail (tanpa ranking) ====== */
function renderTrendingRail(items){
  const rail = document.getElementById('trendRail');
  if (!rail) return;

  rail.innerHTML = items.map(item => {
    const fav = isFav(item);
    return `
      <article class="poster-card" tabindex="0" data-title="${item.title}" data-img="${item.img}">
        <img src="${item.img}" alt="${item.title}">
        <div class="poster-overlay">
          <div>
            <div class="poster-title">${item.title}</div>
            <div class="poster-actions">
              <button class="btn btn-accent btn-sm"><i class="bi bi-play-fill"></i> Play</button>
              <button class="btn btn-${fav?'light':'outline-light'} btn-sm btn-fav"
                      data-title="${item.title}" data-img="${item.img}">
                <i class="bi ${fav?'bi-check-lg':'bi-plus-lg'}"></i>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Delegasi klik
  rail.onclick = (e) => {
    const favBtn = e.target.closest('.btn-fav');
    if (favBtn){
      toggleFav({ title: favBtn.dataset.title, img: favBtn.dataset.img });
      renderTrendingRail(items); // refresh tombol
      return;
    }
    const card = e.target.closest('.poster-card');
    if (card){
      const data = items.find(i => i.title === card.dataset.title && i.img === card.dataset.img);
      openTitleModal(data);
    }
  };

  // Tombol panah scroll
  const step = rail.clientWidth * 0.9;
  const prev = document.getElementById('trendPrev');
  const next = document.getElementById('trendNext');
  if (prev && next){
    prev.onclick = () => rail.scrollBy({left: -step, behavior:'smooth'});
    next.onclick = () => rail.scrollBy({left:  step, behavior:'smooth'});
  }
}

/* ====== MODAL ====== */
const bsModal = () => new bootstrap.Modal(document.getElementById('titleModal'));
function openTitleModal(item){
  if (!item) return;
  document.getElementById('mTitle').textContent = item.title;
  const mImg = document.getElementById('mImg');
  mImg.src = item.img; mImg.alt = item.title;

  const meta = [];
  if (item.year)   meta.push(<span class="badge text-bg-secondary">${item.year}</span>);
  if (item.rating) meta.push(<span class="badge text-bg-secondary">${item.rating}</span>);
  if (item.genres) item.genres.forEach(g => meta.push(<span class="badge text-bg-dark border">${g}</span>));
  document.getElementById('mMeta').innerHTML = meta.join(' ');

  document.getElementById('mDesc').textContent = item.desc || '';
  document.getElementById('mAdd').onclick = () => {
    toggleFav({title:item.title, img:item.img});
    // Tidak perlu re-render modal; cukup update rail bila ingin
    renderTrendingRail(trending);
  };

  bsModal().show();
}

/* ====== NAV ACTIVE ====== */
(function setActiveNav(){
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const map = { 'index.html': 'nav-home', 'movies.html': 'nav-movies', 'series.html': 'nav-series', 'mylist.html': 'nav-mylist' };
  const link = document.getElementById(map[path] || 'nav-home');
  if (link) link.classList.add('active');
})();