let currentTileLayer = null;

const MapHelper = {
  initMap(elementId, lat, lng, zoom) {
    const map = L.map(elementId).setView([lat, lng], zoom);
    return map;
  },
  
  addTileLayer(map, type = 'street') {
    if (currentTileLayer) map.removeLayer(currentTileLayer);
    let url;
    if (type === 'street') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    currentTileLayer = L.tileLayer(url, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);
    return currentTileLayer;
  },
  
  switchTileLayer(map, type) {
    this.addTileLayer(map, type);
  },
  
  addMarker(map, lat, lng, popupContent) {
    const marker = L.marker([lat, lng]).addTo(map);
    if (popupContent) marker.bindPopup(popupContent);
    return marker;
  },
  
  onMapClick(map, callback) {
    map.on('click', (e) => {
      callback(e.latlng.lat, e.latlng.lng);
    });
  }
};

export default MapHelper;