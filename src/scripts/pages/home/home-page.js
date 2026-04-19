import HomePresenter from '../presenters/home-presenter.js';

export default class HomePage {
  constructor() {
    this.presenter = null;
  }
  
  async render() {
    return `
      <div class="container">
        <h1>Cerita Lokal</h1>
        <div id="map" style="height:400px"></div>
        <div class="layer-control" style="margin-block:10px">
          <button id="toggle-satelit">Mode Satelit</button>
          <button id="toggle-street">Mode Jalan</button>
          <button id="sync-btn">Sinkronisasi</button>
        </div>
        <h2>Daftar Cerita</h2>
        <div id="story-list" class="story-list">Memuat...</div>
      </div>
    `;
  }
  
  async afterRender() {
    this.presenter = new HomePresenter(this);
    await this.presenter.loadStories();
    let current = 'street';
    const btnSat = document.getElementById('toggle-satelit');
    const btnStr = document.getElementById('toggle-street');
    if (btnSat) btnSat.onclick = () => {
      if (current === 'street') {
        this.presenter.switchLayer('satellite');
        current = 'satellite';
      }
    };
    if (btnStr) btnStr.onclick = () => {
      if (current === 'satellite') {
        this.presenter.switchLayer('street');
        current = 'street';
      }
    };
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) syncBtn.onclick = () => this.presenter.loadStories(true);
  }
  
  showStories(stories) {
    const container = document.getElementById('story-list');
    if (!container) return;
    if (!stories.length) {
      container.innerHTML = '<p>Belum ada cerita.</p>';
      return;
    }
    container.innerHTML = stories.map((s, i) => `
      <div class="story-card" data-idx="${i}" data-lat="${s.lat || ''}" data-lon="${s.lon || ''}">
        <img src="${s.photoUrl}" alt="Foto ${s.name}" loading="lazy">
        <div class="content">
          <strong>${s.name}</strong>
          <p>${(s.description || '').slice(0,100)}</p>
          <small>${new Date(s.createdAt).toLocaleDateString('id-ID')}</small>
          <button class="delete-local" data-id="${s.id}">Hapus</button>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.story-card').forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-local')) return;
        const lat = parseFloat(card.dataset.lat);
        const lon = parseFloat(card.dataset.lon);
        this.presenter.flyToMarker(idx, lat, lon);
      });
      const delBtn = card.querySelector('.delete-local');
      if (delBtn) delBtn.onclick = (e) => {
        e.stopPropagation();
        this.presenter.deleteStory(delBtn.dataset.id);
      };
    });
  }
  
  showError(msg) {
    const container = document.getElementById('story-list');
    if (container) container.innerHTML = `<p>${msg}</p>`;
  }
}