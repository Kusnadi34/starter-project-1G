import AddStoryPresenter from '../presenters/add-story-presenter.js';

export default class AddStoryPage {
  constructor() {
    this.presenter = null;
    this.video = null;
    this.canvas = null;
    this.capturedBlob = null;
  }
  
  async render() {
    return `
      <div class="container">
        <h1>Tambah Cerita</h1>
        <div>
          <label>Notifikasi Push: </label>
          <button id="toggle-push" class="btn-secondary">Aktifkan Notifikasi</button>
        </div>
        <form id="story-form">
          <div class="form-group">
            <label for="desc">Deskripsi *</label>
            <textarea id="desc" rows="3" required></textarea>
            <div id="desc-error" class="error-message"></div>
          </div>
          <div class="form-group">
            <label>Foto (ambil dari kamera)</label>
            <video id="camera-preview" autoplay playsinline style="width:100%; max-width:400px; background:#000; border-radius:8px;"></video>
            <button type="button" id="start-cam" style="margin-top:5px;">📷 Buka Kamera</button>
            <button type="button" id="capture-btn" style="margin-top:5px; display:none;">📸 Ambil Foto</button>
            <canvas id="photo-canvas" style="display:none;"></canvas>
            <div id="photo-error" class="error-message"></div>
          </div>
          <div class="form-group">
            <label>Klik peta untuk lokasi (opsional)</label>
            <div id="map" style="height:300px; border-radius:8px;"></div>
            <p id="coord-info">Belum pilih lokasi</p>
          </div>
          <button type="submit" id="submit-btn">Kirim</button>
          <div id="status"></div>
        </form>
      </div>
    `;
  }
  
  async afterRender() {
    this.presenter = new AddStoryPresenter(this);
    this.presenter.initMap();
    this.video = document.getElementById('camera-preview');
    this.canvas = document.getElementById('photo-canvas');
    const startBtn = document.getElementById('start-cam');
    const captureBtn = document.getElementById('capture-btn');
    const togglePushBtn = document.getElementById('toggle-push');
    startBtn.onclick = async () => {
      const ok = await this.presenter.startCamera(this.video);
      if (ok) {
        startBtn.style.display = 'none';
        captureBtn.style.display = 'inline-block';
      } else {
        alert('Gagal akses kamera. Pastikan izin diberikan.');
      }
    };
    
    captureBtn.onclick = async () => {
      if (!this.video.srcObject) return;
      this.capturedBlob = await this.presenter.captureFrame(this.video, this.canvas);
      this.presenter.stopCamera();
      this.video.srcObject = null;
      captureBtn.style.display = 'none';
      startBtn.style.display = 'inline-block';
      startBtn.textContent = '📸 Ambil Ulang';
      alert('Foto tersimpan!');
    };
    togglePushBtn.onclick = async () => {
      const enabled = await this.presenter.togglePush();
      togglePushBtn.textContent = enabled ? 'Nonaktifkan Notifikasi' : 'Aktifkan Notifikasi';
    };
    const form = document.getElementById('story-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const desc = document.getElementById('desc').value.trim();
      let valid = true;
      if (!desc) {
        document.getElementById('desc-error').innerText = 'Deskripsi wajib';
        valid = false;
      } else {
        document.getElementById('desc-error').innerText = '';
      }
      if (!this.capturedBlob) {
        document.getElementById('photo-error').innerText = 'Ambil foto dulu';
        valid = false;
      } else {
        document.getElementById('photo-error').innerText = '';
      }
      if (!valid) return;
      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.innerText = 'Mengirim...';
      try {
        const result = await this.presenter.submit(desc, this.capturedBlob, !navigator.onLine);
        const statusDiv = document.getElementById('status');
        if (result.offline) {
          statusDiv.innerHTML = '<div class="success-message">📱 Disimpan offline. Akan disinkronkan saat online.</div>';
        } else {
          statusDiv.innerHTML = '<div class="success-message">✅ Berhasil! Mengalihkan...</div>';
        }
        form.reset();
        this.capturedBlob = null;
        this.presenter.reset();
        document.getElementById('coord-info').innerHTML = 'Belum pilih lokasi';
        setTimeout(() => window.location.hash = '#/', 1500);
      } catch (err) {
        document.getElementById('status').innerHTML = `<div class="error-message">❌ ${err.message}</div>`;
      } finally {
        btn.disabled = false;
        btn.innerText = 'Kirim';
      }
    };
  }
  
  showCoord(lat, lng) {
    const el = document.getElementById('coord-info');
    if (el) el.innerHTML = `📍 Lokasi: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}