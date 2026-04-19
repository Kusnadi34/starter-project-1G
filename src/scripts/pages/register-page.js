import AuthModel from '../models/auth-model.js';

export default class RegisterPage {
  async render() {
    return `
      <div class="container" style="max-width:400px; margin:0 auto;">
        <h1>Daftar Akun</h1>
        <form id="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password (min 12)</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit">Daftar</button>
          <div id="reg-error" class="error-message"></div>
        </form>
      </div>
    `;
  }
  
  async afterRender() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        await AuthModel.register(name, email, password);
        alert('Registrasi berhasil, silakan login');
        window.location.hash = '#/login';
      } catch (err) {
        document.getElementById('reg-error').innerText = err.message;
      }
    });
  }
}

