import AuthModel from './auth-model.js';

class StoryModel {
  static async getAllStories(page = 1, size = 10, location = 1) {
    const token = AuthModel.getToken();
    const url = `https://story-api.dicoding.dev/v1/stories?page=${page}&size=${size}&location=${location}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Gagal mengambil cerita');
    const data = await response.json();
    return data.listStory;
  }
  
  static async addStory(description, photoFile, lat = null, lon = null) {
    const token = AuthModel.getToken();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    const url = token ? 
    'https://story-api.dicoding.dev/v1/stories' 
    : 'https://story-api.dicoding.dev/v1/stories/guest';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal menambah story');
    return data;
  }
}

export default StoryModel;