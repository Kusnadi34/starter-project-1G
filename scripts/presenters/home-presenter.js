import StoryModel from '../models/story-model.js';
import MapHelper from '../utils/map-helper.js';
import { getAllStories, saveStory, clearStories, deleteStory } from '../utils/idb.js';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.map = null;
    this.markers = [];
    this.stories = [];
  }
  
  async loadStories(forceOnline = false) {
    try {
      let stories = [];
      if (forceOnline || navigator.onLine) {
        stories = await StoryModel.getAllStories(1, 50, 1);
        
        await clearStories();
        for (const s of stories) await saveStory(s);
      } else {
        stories = await getAllStories();
      }
      this.stories = stories;
      this.view.showStories(stories);
      this.initMap(stories);
    } catch (err) {
      console.error(err);
      const offlineStories = await getAllStories();
      if (offlineStories.length) {
        this.view.showStories(offlineStories);
        this.initMap(offlineStories);
        this.view.showError('Mode offline - data dari cache');
      } else {
        this.view.showError('Gagal ambil data. Coba online.');
      }
    }
  }
  
  initMap(stories) {
    if (!this.map) {
      this.map = MapHelper.initMap('map', -6.2, 106.8, 12);
      MapHelper.addTileLayer(this.map, 'street');
    } else {
      this.map.invalidateSize();
    }
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    stories.forEach(s => {
      if (s.lat && s.lon) {
        const m = MapHelper.addMarker(this.map, s.lat, s.lon, `
          <b>${s.name}</b><br>${s.description}<br>
          <img src="${s.photoUrl}" width="150" alt="preview">
          <button class="delete-story-btn" data-id="${s.id}">Hapus</button>
        `);
        this.markers.push(m);
        m.on('popupopen', () => {
          const btn = document.querySelector('.delete-story-btn');
          if (btn) btn.onclick = () => this.deleteStory(s.id);
        });
      }
    });
  }
  
  async syncOfflineStories() {
    if (!navigator.onLine) {
      this.view.showError('Tidak ada koneksi. Sync dibatalkan.');
      return false;
    }
    const unsynced = await getUnsyncedStories();
    if (unsynced.length === 0) {
      this.view.showError('Tidak ada data offline yang perlu disinkronkan.');
      return true;
    }
    this.view.showError(`Menyinkronkan ${unsynced.length} cerita...`);
    let successCount = 0;
    for (const story of unsynced) {
      try {
        const blob = story.photoFile;
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        await StoryModel.addStory(story.description, file, story.lat, story.lon);
        await markStorySynced(story.id);
        successCount++;
      } catch (err) {
        console.error('Gagal sync story', story.id, err);
      }
    }
    if (successCount > 0) {
      this.view.showError(`${successCount} cerita berhasil disinkronkan.`);
      await this.loadStories(true);
    } else {
      this.view.showError('Gagal sinkronisasi. Coba lagi nanti.');
    }
    return successCount > 0;
  }
  
  
  async deleteStory(id) {
    if (confirm('Hapus cerita ini?')) {
      await deleteStory(id);
      this.loadStories();
    }
  }
  
  flyToMarker(idx, lat, lon) {
    if (lat && lon && this.markers[idx]) {
      this.map.setView([lat, lon], 15);
      this.markers[idx].openPopup();
    }
  }
  
  switchLayer(type) {
    MapHelper.switchTileLayer(this.map, type);
  }
}