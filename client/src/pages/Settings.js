import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/pages.css';
import { useSettings } from '../contexts/SettingsContext';

export default function Settings() {
  const { currency, setCurrency, theme, setTheme, language, setLanguage, t } = useSettings();

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <h2>{t('settings')}</h2>
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <label>
            {t('currencyLabel')}:
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="huf">HUF</option>
            </select>
          </label>

          <label>
            {t('themeLabel')}:
            <select value={theme} onChange={e => setTheme(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="dark">{t('dark')}</option>
              <option value="light">{t('light')}</option>
            </select>
          </label>

          <label>
            {t('languageLabel')}:
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="en">English</option>
              <option value="hu">Magyar</option>
            </select>
          </label>

          <p style={{ marginTop: 8, color: '#999' }}>
            Settings are stored locally and applied immediately.
          </p>
        </div>
      </main>
    </div>
  );
}