import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// PWA service worker — register ONLY in production builds.
// In dev it must never run: it would cache Vite's dev modules (/@vite/client,
// /src/...) stale-while-revalidate and break hot reload & the preview.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      // relative path so it resolves correctly on subpath deploys (GH Pages)
      navigator.serviceWorker.register('sw.js').then((reg) => {
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
  } else {
    // dev: unregister any SW left over from a previous visit to avoid stale caching
    window.addEventListener('load', () => {
      navigator.serviceWorker.getRegistrations().then((regs) =>
        regs.forEach((r) => r.unregister())
      );
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
