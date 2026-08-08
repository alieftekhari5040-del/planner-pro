import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// PWA service worker registration + update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            // a new version is installed while the app is in use
            window.dispatchEvent(new CustomEvent('app-update'));
          }
        });
      });
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
