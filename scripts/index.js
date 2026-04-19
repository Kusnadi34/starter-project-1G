import '../styles/styles.css';

import App from './pages/app.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered:', reg);
    }).catch(err => console.log('SW failed:', err));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  window.addEventListener('load', () => {
    app.renderPage();
  });

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
