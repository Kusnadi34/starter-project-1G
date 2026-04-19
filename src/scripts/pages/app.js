import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import AuthModel from '../models/auth-model.js';

class App {
  #content;
  #drawerButton;
  #navigationDrawer;
  
  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this._setupDrawer();
    this._updateAuthNav();
    window.addEventListener('auth-change', () => this._updateAuthNav());
  }
  
  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const expanded = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', expanded);
    });
    document.body.addEventListener('click', (e) => {
      if (!this.#navigationDrawer.contains(e.target) && !this.#drawerButton.contains(e.target)) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  _updateAuthNav() {
    const navList = document.getElementById('nav-list');
    if (!navList) return;
    const oldAuthItems = navList.querySelectorAll('.auth-item');
    oldAuthItems.forEach(item => item.remove());
    
    const token = AuthModel.getToken();
    if (token) {
      const addStoryLi = document.createElement('li');
      addStoryLi.className = 'auth-item';
      const addStoryLink = document.createElement('a');
      addStoryLink.href = '#/add-story';
      addStoryLink.textContent = 'Tambah Cerita';
      addStoryLi.appendChild(addStoryLink);
      navList.appendChild(addStoryLi);
      
      const logoutLi = document.createElement('li');
      logoutLi.className = 'auth-item';
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.id = 'logout-btn';
      logoutLink.textContent = 'Logout';
      logoutLi.appendChild(logoutLink);
      navList.appendChild(logoutLi);
      
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          AuthModel.logout();
          window.dispatchEvent(new Event('auth-change'));
          window.location.hash = '#/login';
        });
      }
    } else {
      const loginLi = document.createElement('li');
      loginLi.className = 'auth-item';
      const loginLink = document.createElement('a');
      loginLink.href = '#/login';
      loginLink.textContent = 'Login';
      loginLi.appendChild(loginLink);
      navList.appendChild(loginLi);
      
      const registerLi = document.createElement('li');
      registerLi.className = 'auth-item';
      const registerLink = document.createElement('a');
      registerLink.href = '#/register';
      registerLink.textContent = 'Daftar';
      registerLi.appendChild(registerLink);
      navList.appendChild(registerLi);
    }
  }
  
  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];
    if (!page) {
      this.#content.innerHTML = '<div class="container"><h1>404 - Halaman tidak ditemukan</h1></div>';
      return;
    }
    
    this.#content.style.transition = 'opacity 0.15s';
    this.#content.style.opacity = '0';
    setTimeout(async () => {
      const protectedRoutes = ['/add-story', '/home'];
      if (protectedRoutes.includes(url) && !AuthModel.getToken()) {
        window.location.hash = '#/login';
        return;
      }
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#content.style.opacity = '1';
    }, 150);
  }
}

export default App;