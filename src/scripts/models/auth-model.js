const STORAGE_KEY = 'storyapp_token';

class AuthModel {
  static saveToken(token) {
    localStorage.setItem(STORAGE_KEY, token);
  }
  
  static getToken() {
    return localStorage.getItem(STORAGE_KEY);
  }
  
  static logout() {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  static async register(name, email, password) {
    const response = await fetch('https://story-api.dicoding.dev/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registrasi gagal');
    return data;
  }
  
  static async login(email, password) {
    const response = await fetch('https://story-api.dicoding.dev/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login gagal');
    this.saveToken(data.loginResult.token);
    return data;
  }
}

export default AuthModel;