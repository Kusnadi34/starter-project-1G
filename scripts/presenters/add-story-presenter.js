import StoryModel from '../models/story-model.js';
import MapHelper from '../utils/map-helper.js';
import { saveStory } from '../utils/idb.js';
import { subscribePush, unsubscribePush } from '../utils/push.js';

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.map = null;
    this.selectedLat = null;
    this.selectedLon = null;
    this.marker = null;
    this.mediaStream = null;
    this.pushEnabled = false;
  }
  initMap() {
    this.map = MapHelper.initMap('map', -6.2, 106.8, 13);
    MapHelper.addTileLayer(this.map, 'street');
    this.map.on('click', (e) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLon = e.latlng.lng;
      this.view.showCoord(this.selectedLat, this.selectedLon);
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = MapHelper.addMarker(this.map, this.selectedLat, this.selectedLon, 'Cerita di sini');
    });
  }
  
  async startCamera(videoEl) {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = this.mediaStream;
      await videoEl.play();
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }
  captureFrame(videoEl, canvasEl) {
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    return new Promise(resolve => {
      canvasEl.toBlob(blob => resolve(blob), 'image/jpeg');
    });
  }
  
  async submit(desc, blob, isOffline = false) {
    if (!desc.trim()) throw new Error('Deskripsi wajib');
    if (!blob) throw new Error('Foto belum diambil');
    if (blob.size > 1_000_000) throw new Error('Ukuran foto max 1MB');
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    if (!navigator.onLine || isOffline) {
      
      const dummyStory = {
        id: Date.now(),
        description: desc,
        photoFile: blob,
        lat: this.selectedLat,
        lon: this.selectedLon,
        createdAt: new Date().toISOString(),
        sync: false
      };
      await saveStory(dummyStory);
      return { offline: true };
    } else {
      const result = await StoryModel.addStory(desc, file, this.selectedLat, this.selectedLon);
      if (this.pushEnabled) {
        await this.triggerPushNotification(desc);
      }
      return result;
    }
  }
  
  async triggerPushNotification(description) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.log('Push subscription aktif');
    }
  }
  
  async togglePush() {
    if (this.pushEnabled) {
      await unsubscribePush();
      this.pushEnabled = false;
    } else {
      await subscribePush();
      this.pushEnabled = true;
    }
    return this.pushEnabled;
  }
  
  reset() {
    this.selectedLat = null;
    this.selectedLon = null;
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }
}