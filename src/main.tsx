import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useSettings } from '@/stores/settings';
import { initAppData } from '@/lib/db';

useSettings.getState().init();
initAppData();

// Detect touch device for CSS hover fallback
if (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches) {
  document.documentElement.classList.add('touch');
}

// Ensure read-only mode is off by default
document.documentElement.removeAttribute('data-readonly');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
