import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for robust background/sleep-mode notifications immediately
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((reg) => {
      console.log('Service Worker successfully registered with scope: ', reg.scope);
      // Ensure the service worker updates as fast as possible
      reg.update();
    })
    .catch((err) => {
      console.warn('Service Worker registration failed: ', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

