import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);