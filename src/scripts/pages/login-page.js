import AuthModel from '../models/auth-model.js';

export default class LoginPage {
  async render() {
    return `
      <div class="container" style="max-width:400px; margin:0 auto;">
        <h1>Login</h1>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit">Masuk</button>
          <div id="login-error" class="error-message"></div>
        </form>
      </div>
    `;
  }
  
  async afterRender() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        await AuthModel.login(email, password);
        window.dispatchEvent(new Event('auth-change'));
        window.location.hash = '#/';
      } catch (err) {
        document.getElementById('login-error').innerText = err.message;
      }
    });
  }
}