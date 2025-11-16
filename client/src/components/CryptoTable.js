import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CryptoTable.css';
import { addCoinToWatchlist, removeCoinFromWatchlist, isCoinInWatchlist } from '../utils/watchlist';

const CryptoTable = ({ 
  coins, 
  loading, 
  currentPage, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalPages,
  hidePagination = false
}) => {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem('auth.token');
  const [sparks, setSparks] = useState({});
  const { currency } = useSettings();

  useEffect(() => {
    let cancelled = false;
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const load = async () => {
      const ids = (coins || [])
        .slice(0, 5)
        .filter(c => !c?.sparkline_in_7d?.price && !sparks[c.id])
        .map(c => c.id);

      for (const id of ids) {
        if (cancelled) break;
        try {
          const res = await fetch(`/api/coins/${encodeURIComponent(id)}/sparkline?currency=${encodeURIComponent(currency.toUpperCase())}&days=7`);
          const data = await res.json().catch(() => ({ prices: [] }));
          if (!cancelled) {
            setSparks(prev => ({ ...prev, [id]: Array.isArray(data.prices) ? data.prices : [] }));
          }
        } catch (e) {
          if (!cancelled) setSparks(prev => ({ ...prev, [id]: [] }));
        }
        await delay(500);
      }
    };
    if (coins && coins.length) load();
    return () => { cancelled = true; };
  }, [coins, sparks]);

  const buildSparkline = (coin, idx) => {
    const fetched = sparks[coin.id];
    if (idx < 5) {
      if (fetched && fetched.length > 0) return fetched;
      if (coin?.sparkline_in_7d?.price && Array.isArray(coin.sparkline_in_7d.price)) {
        return coin.sparkline_in_7d.price;
      }
    }
    const curr = Number(coin.current_price || 0);
    const pct7d = Number(coin.price_change_percentage_7d || 0);
    const pct24h = Number(coin.price_change_percentage_24h || 0);
    const pct1h = Number(coin.price_change_percentage_1h || 0);
    if (!curr) return null;
    const start = curr / (1 + (pct7d / 100));
    const points = 60;

    const seedFrom = (str) => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return h >>> 0;
    };
    let seed = seedFrom(String(coin.id || coin.symbol || 'coin'));
    const rand = () => {
      seed ^= seed << 13; seed >>>= 0;
      seed ^= seed >> 17; seed >>>= 0;
      seed ^= seed << 5;  seed >>>= 0;
      return (seed >>> 0) / 4294967296;
    };

    const vol = Math.min(0.03, 0.005 + (Math.abs(pct7d) * 0.001 + Math.abs(pct24h) * 0.002 + Math.abs(pct1h) * 0.003));
    const f1 = 0.6 + rand();
    const f2 = 1.1 + rand();
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;

    const series = new Array(points).fill(0).map((_, i) => {
      const t = i / (points - 1);
      const base = start + (curr - start) * t;
      const wobble = 1 + vol * (Math.sin(i * f1 + p1) * 0.6 + Math.sin(i * f2 + p2) * 0.4);
      const tailTilt = 1 + ((pct24h * 0.0015 + pct1h * 0.002) * Math.pow(t, 3));
      return base * wobble * tailTilt;
    });
    return series;
  };

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('watchlist:change', handler);
    return () => window.removeEventListener('watchlist:change', handler);
  }, []);

  const formatCurrency = (n, opts={}) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), ...opts }).format(n || 0);
    } catch {
      return `${currency.toUpperCase()} ${Number(n||0).toFixed(2)}`;
    }
  };
  const formatCompact = (n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), notation: 'compact', compactDisplay: 'short' }).format(n || 0);
    } catch {
      return formatCurrency(n);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="crypto-table-container">
      <div className="table-responsive">
        <table className="crypto-table">
          <thead>
            <tr>
              <th className="star-col"></th>
              <th>#</th>
              <th>Name</th>
              <th className="text-right">Price</th>
              <th className="text-right">1h %</th>
              <th className="text-right">24h %</th>
              <th className="text-right">7d %</th>
              <th className="text-right">Market Cap</th>
              <th className="text-right">24h Volume</th>
              <th className="text-right">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, idx) => {
              const isPositive1h = (coin.price_change_percentage_1h || 0) > 0;
              const isPositive24h = (coin.price_change_percentage_24h || 0) > 0;
              const isPositive7d = (coin.price_change_percentage_7d || 0) > 0;
              const inWatchlist = isCoinInWatchlist(coin.id);
              const series = buildSparkline(coin, idx);
              return (
                <tr key={coin.id} className="crypto-row">
                  <td className="star-col">
                    {inWatchlist ? (
                      <button
                        className="star-btn star-filled"
                        onClick={() => {
                          if (!loggedIn) { navigate('/login'); return; }
                          removeCoinFromWatchlist(coin.id);
                        }}
                        aria-label="Unstar"
                        title={loggedIn ? 'Remove from watchlist' : 'Login to manage watchlist'}
                      >
                        ★
                      </button>
                    ) : (
                      <button
                        className="star-btn star-empty"
                        onClick={() => {
                          if (!loggedIn) { navigate('/login'); return; }
                          addCoinToWatchlist(coin);
                        }}
                        aria-label="Star"
                        title={loggedIn ? 'Add to watchlist' : 'Login to manage watchlist'}
                      >
                        ☆
                      </button>
                    )}
                  </td>
                  <td>{coin.market_cap_rank}</td>
                  <td>
                    <div className="coin-info">
                      <Link to={`/coin/${coin.id}`}>
                        <img src={coin.image} alt={coin.name} />
                      </Link>
                      <div>
                        <div className="coin-name">
                          <Link to={`/coin/${coin.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {coin.name}
                          </Link>
                        </div>
                        <div className="coin-symbol">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    {typeof coin.current_price === 'number' ? formatCurrency(coin.current_price) : 'N/A'}
                  </td>
                  <td className={`pct-cell ${isPositive1h ? 'percentage-up' : 'percentage-down'}`}>
                    <div className="change-container">
                      <span className="trend-arrow">{isPositive1h ? '↑' : '↓'}</span>
                      {Math.abs(coin.price_change_percentage_1h ?? 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className={`pct-cell ${isPositive24h ? 'percentage-up' : 'percentage-down'}`}>
                    <div className="change-container">
                      <span className="trend-arrow">{isPositive24h ? '↑' : '↓'}</span>
                      {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className={`pct-cell ${isPositive7d ? 'percentage-up' : 'percentage-down'}`}>
                    <div className="change-container">
                      <span className="trend-arrow">{isPositive7d ? '↑' : '↓'}</span>
                      {Math.abs(coin.price_change_percentage_7d ?? 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className="text-right">
                    {typeof coin.market_cap === 'number' ? formatCompact(coin.market_cap) : 'N/A'}
                  </td>
                  <td className="text-right">
                    {typeof coin.total_volume === 'number' ? formatCompact(coin.total_volume) : 'N/A'}
                  </td>
                  <td className="text-right">
                    {series && (
                      <div className="sparkline">
                        <svg viewBox="0 0 100 30" width="100" height="30">
                          <polyline
                            points={series
                              .map((price, i) => {
                                const x = (i / (series.length - 1)) * 100;
                                const min = Math.min(...series);
                                const max = Math.max(...series);
                                const y = 30 - ((price - min) / (max - min || 1)) * 30;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke={isPositive7d ? 'var(--success)' : 'var(--error)'}
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!hidePagination && (
        <div className="table-footer">
          <div className="items-per-page">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="pagination">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="page-btn"
              title="First page"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="page-btn"
              title="Previous page"
            >
              ←
            </button>
            <span className="page-indicator">Page {currentPage} / {totalPages}</span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="page-btn"
              title="Next page"
            >
              →
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="page-btn"
              title="Last page"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoTable;