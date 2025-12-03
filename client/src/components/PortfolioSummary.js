import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Dashboard.css';
import { getWatchlistCoins } from '../utils/watchlist';
import { getCurrentUser, getHoldings } from '../utils/portfolioStore';
import { useSettings } from '../contexts/SettingsContext';

export default function SummaryCard({ mode = 'watchlist' }) {
  const { currency } = useSettings();
  const user = useMemo(() => getCurrentUser(), []);
  const [entries, setEntries] = useState(() => (mode === 'portfolio' ? getHoldings(user?._id || user?.username) : []));
  const [prices, setPrices] = useState({});
  const [watchlistCoins, setWatchlistCoins] = useState(() => (mode === 'watchlist' ? getWatchlistCoins() : []));

  useEffect(() => {
    setPrices({});
  }, [currency]);

  useEffect(() => {
    if (mode === 'portfolio') {
      const load = () => setEntries(getHoldings(user?._id || user?.username));
      load();
      const onChange = () => load();
      window.addEventListener('portfolio:change', onChange);
      return () => window.removeEventListener('portfolio:change', onChange);
    } else {
      const load = () => setWatchlistCoins(getWatchlistCoins());
      load();
      const onChange = () => load();
      window.addEventListener('watchlist:change', onChange);
      return () => window.removeEventListener('watchlist:change', onChange);
    }
  }, [mode, user]);

  useEffect(() => {
    if (mode !== 'portfolio') return;
    if (!entries.length) return;

    (async () => {
      try {
        const res = await fetch(`/api/coins?page=1&per_page=250&currency=${encodeURIComponent(currency)}`);
        const list = await res.json();
        const ids = new Set(entries.map(e => e.coinId));
        const next = {};
        (Array.isArray(list) ? list : []).forEach(c => {
          if (ids.has(c.id)) next[c.id] = c.current_price || null;
        });
        setPrices(next);
      } catch {
        
      }
    })();
  }, [entries, currency, mode]);

  const totalValue = mode === 'portfolio'
    ? entries.reduce((sum, e) => sum + (Number(e.amount)||0) * (prices[e.coinId] || 0), 0)
    : watchlistCoins.reduce((sum, c) => sum + (c.current_price || 0), 0);

  const count = mode === 'portfolio' ? entries.length : watchlistCoins.length;

  const fmtCurrency = (n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(n || 0);
    } catch {
      return `${currency.toUpperCase()} ${Number(n||0).toFixed(2)}`;
    }
  };

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const name = cap(mode);

  return (
    <div className="portfolio-summary card">
      <h2>{name} Summary</h2>
      <div className="portfolio-stats">
        <div className="stat-item">
          <p className="stat-label">Total {name} Value</p>
          <p className="stat-value">{fmtCurrency(totalValue)}</p>
        </div>
        <div className="stat-item">
          <p className="stat-label">Coins in {name}</p>
          <p className="stat-value">{count}</p>
        </div>
      </div>
    </div>
  );
}