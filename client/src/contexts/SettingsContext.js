import React, { createContext, useContext, useEffect, useState } from 'react';

const KEY_PREFIX = 'settings.';
const SettingsContext = createContext(null);

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    portfolio: 'Portfolio',
    settings: 'Settings',
    login: 'Login',
    viewPortfolio: 'View Detailed Portfolio',
    noPortfolio: 'No coins in portfolio yet. Add coins from the Dashboard.',
    currencyLabel: 'Preferred fiat currency',
    themeLabel: 'Theme',
    languageLabel: 'Language',
    dark: 'Dark',
    light: 'Light'
  },
  hu: {
    dashboard: 'Főoldal',
    portfolio: 'Portfólió',
    settings: 'Beállítások',
    login: 'Bejelentkezés',
    viewPortfolio: 'Részletes portfólió megtekintése',
    noPortfolio: 'Nincs kriptó a portfólióban. Adj hozzá a főoldalról.',
    currencyLabel: 'Preferált fiat pénznem',
    themeLabel: 'Téma',
    languageLabel: 'Nyelv',
    dark: 'Sötét',
    light: 'Világos'
  }
};

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem(KEY_PREFIX + 'currency') || 'usd');
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY_PREFIX + 'theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem(KEY_PREFIX + 'language') || 'en');

  useEffect(() => {
    localStorage.setItem(KEY_PREFIX + 'currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(KEY_PREFIX + 'theme', theme);
    if (typeof document !== 'undefined') {
      if (theme === 'light') document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(KEY_PREFIX + 'language', language);
  }, [language]);

  const t = (key) => {
    return (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS.en[key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      currency,
      setCurrency,
      theme,
      setTheme,
      language,
      setLanguage,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};