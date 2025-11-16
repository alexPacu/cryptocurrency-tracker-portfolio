import React, { createContext, useContext, useEffect, useState } from 'react';

const KEY_PREFIX = 'settings.';
const SettingsContext = createContext(null);

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    watchlist: 'Watchlist',
    portfolio: 'Portfolio',
    settings: 'Settings',
    login: 'Login',
    viewWatchlist: 'View Watchlist',
    noWatchlist: 'No coins in your watchlist yet. Add from the Dashboard.',
    currencyLabel: 'Preferred fiat currency',
    themeLabel: 'Theme',
    dark: 'Dark',
    light: 'Light'
  },
  
};

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem(KEY_PREFIX + 'currency') || 'usd');
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY_PREFIX + 'theme') || 'dark');

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

  const t = (key) => {
    return TRANSLATIONS.en[key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      currency,
      setCurrency,
      theme,
      setTheme,
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