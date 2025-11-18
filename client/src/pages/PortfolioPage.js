import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/PortfolioSummary';
import '../styles/pages.css';
import '../styles/Dashboard.css';
import '../styles/CryptoTable.css';
import { getCurrentUser, getHoldings, addHolding, removeHolding } from '../utils/portfolioStore';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';

export default function PortfolioPage() {
  const { currency } = useSettings();
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?._id || user?.username || 'guest';

  const [entries, setEntries] = useState(() => getHoldings(userId));
  const [coinData, setCoinData] = useState({});
  const [sparks, setSparks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [totalSpent, setTotalSpent] = useState('');

  const isLoggedIn = !!localStorage.getItem('auth.token');

  useEffect(() => {
    const onChange = () => setEntries(getHoldings(userId));
    window.addEventListener('portfolio:change', onChange);
    return () => window.removeEventListener('portfolio:change', onChange);
  }, [userId]);

  const fmtCurrency = useCallback((n, opts = {}) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), ...opts }).format(n || 0);
    } catch {
      return `${currency.toUpperCase()} ${Number(n || 0).toFixed(2)}`;
    }
  }, [currency]);

  const fmtCompact = useCallback((n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), notation: 'compact', compactDisplay: 'short' }).format(n || 0);
    } catch {
      return fmtCurrency(n);
    }
  }, [currency, fmtCurrency]);

  const fetchCoinData = useCallback(async (coinId) => {
    try {
      const res = await fetch(`/api/coins/${encodeURIComponent(coinId)}?currency=${encodeURIComponent(currency)}`);
      const data = await res.json();
      
      const listRes = await fetch(`/api/coins?page=1&per_page=250&currency=${encodeURIComponent(currency)}`);
      const listData = await listRes.json();
      const coinInfo = listData.find(c => c.id === coinId);
      
      setCoinData(prev => ({ 
        ...prev, 
        [coinId]: {
          current_price: data?.market_data?.current_price?.[currency.toLowerCase()] ?? data?.current_price ?? 0,
          price_change_percentage_1h: coinInfo?.price_change_percentage_1h ?? 0,
          price_change_percentage_24h: coinInfo?.price_change_percentage_24h ?? 0,
          price_change_percentage_7d: coinInfo?.price_change_percentage_7d ?? 0,
          market_cap: coinInfo?.market_cap ?? 0,
          total_volume: coinInfo?.total_volume ?? 0,
          image: coinInfo?.image || data?.image?.small || data?.image?.large
        }
      }));
    } catch (err) {
      console.error('Error fetching coin data:', err);
      setCoinData(prev => ({ ...prev, [coinId]: null }));
    }
  }, [currency]);

  const fetchSparkline = useCallback(async (coinId) => {
    if (sparks[coinId]) return;
    try {
      const res = await fetch(`/api/coins/${encodeURIComponent(coinId)}/sparkline?currency=${encodeURIComponent(currency.toUpperCase())}&days=7`);
      const data = await res.json().catch(() => ({ prices: [] }));
      setSparks(prev => ({ ...prev, [coinId]: Array.isArray(data.prices) ? data.prices : [] }));
    } catch (e) {
      setSparks(prev => ({ ...prev, [coinId]: [] }));
    }
  }, [sparks, currency]);

  useEffect(() => {
    const uniqIds = Array.from(new Set(entries.map(e => e.coinId)));
    uniqIds.forEach(id => {
      if (!(id in coinData)) fetchCoinData(id);
      if (!(id in sparks)) fetchSparkline(id);
    });
  }, [entries, coinData, sparks, fetchCoinData, fetchSparkline]);

  const totalValue = entries.reduce((sum, e) => {
    const cp = coinData[e.coinId]?.current_price || 0;
    return sum + (Number(e.amount) || 0) * cp;
  }, 0);

  const openModal = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowModal(true);
    setSearch(''); setResults([]); setSelected(null); setTotalSpent('');
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!search || search.trim().length < 2) { 
        setResults([]); 
        return; 
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (active) setResults(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (err) {
        console.error('Search error:', err);
        if (active) setResults([]);
      }
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const spent = Number(totalSpent);
    if (!(spent > 0)) return;

    try {
      const res = await fetch(`/api/coins/${encodeURIComponent(selected.id)}?currency=${encodeURIComponent(currency)}`);
      const data = await res.json();
      const currentPrice = data?.market_data?.current_price?.[currency.toLowerCase()] ?? data?.current_price;
      
      if (!currentPrice || currentPrice <= 0) {
        alert('Unable to fetch current price for this coin. Please try again.');
        return;
      }

      const amount = spent / currentPrice;

      addHolding(userId, {
        coinId: selected.id,
        symbol: selected.symbol || '',
        name: selected.name || selected.id,
        image: selected.thumb || '',
        amount: amount,
        buyPrice: currentPrice,
        buyCurrency: currency.toUpperCase(),
        addedAt: new Date().toISOString()
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error fetching price:', error);
      alert('Failed to fetch current price. Please try again.');
    }
  };

  const removeEntry = (id) => removeHolding(userId, id);

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Portfolio</h2>
          <button className="btn btn-primary" onClick={openModal}>+ Add Crypto</button>
        </div>

        <SummaryCard mode="portfolio" />

        <div className="card" style={{ marginTop: 16 }}>
          {entries.length === 0 ? (
            <p>No holdings yet. Click "+ Add Crypto" to add your first asset.</p>
          ) : (
            <div className="table-responsive">
              <table className="crypto-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th className="text-right">Holdings</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">1h %</th>
                    <th className="text-right">24h %</th>
                    <th className="text-right">7d %</th>
                    <th className="text-right">Market Cap</th>
                    <th className="text-right">24h Volume</th>
                    <th className="text-right">Value</th>
                    <th className="text-right">P/L</th>
                    <th className="text-right">Last 7 Days</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => {
                    const data = coinData[e.coinId];
                    const cp = data?.current_price || 0;
                    const value = (Number(e.amount) || 0) * cp;
                    const totalBuyCost = (e.buyPrice || 0) * (Number(e.amount) || 0);
                    const pl = value - totalBuyCost;
                    const plPct = totalBuyCost > 0 ? ((pl / totalBuyCost) * 100) : 0;
                    const isUp = pl >= 0;
                    
                    const pct1h = data?.price_change_percentage_1h || 0;
                    const pct24h = data?.price_change_percentage_24h || 0;
                    const pct7d = data?.price_change_percentage_7d || 0;
                    
                    const sparkData = sparks[e.coinId];
                    
                    return (
                      <tr key={e.id} className="crypto-row">
                        <td>{idx + 1}</td>
                        <td>
                          <div className="coin-info">
                            <Link to={`/coin/${e.coinId}`}>
                              <img src={data?.image || e.image} alt={e.name} width={24} height={24} />
                            </Link>
                            <div>
                              <div className="coin-name">
                                <Link to={`/coin/${e.coinId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                  {e.name}
                                </Link>
                              </div>
                              <div className="coin-symbol">{(e.symbol || '').toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">{Number(e.amount).toFixed(6)}</td>
                        <td className="text-right">{cp != null ? fmtCurrency(cp) : '—'}</td>
                        <td className={`pct-cell ${pct1h >= 0 ? 'percentage-up' : 'percentage-down'}`}>
                          <div className="change-container">
                            <span className="trend-arrow">{pct1h >= 0 ? '↑' : '↓'}</span>
                            {Math.abs(pct1h).toFixed(2)}%
                          </div>
                        </td>
                        <td className={`pct-cell ${pct24h >= 0 ? 'percentage-up' : 'percentage-down'}`}>
                          <div className="change-container">
                            <span className="trend-arrow">{pct24h >= 0 ? '↑' : '↓'}</span>
                            {Math.abs(pct24h).toFixed(2)}%
                          </div>
                        </td>
                        <td className={`pct-cell ${pct7d >= 0 ? 'percentage-up' : 'percentage-down'}`}>
                          <div className="change-container">
                            <span className="trend-arrow">{pct7d >= 0 ? '↑' : '↓'}</span>
                            {Math.abs(pct7d).toFixed(2)}%
                          </div>
                        </td>
                        <td className="text-right">
                          {data?.market_cap ? fmtCompact(data.market_cap) : '—'}
                        </td>
                        <td className="text-right">
                          {data?.total_volume ? fmtCompact(data.total_volume) : '—'}
                        </td>
                        <td className="text-right" style={{ fontWeight: 600 }}>{fmtCurrency(value)}</td>
                        <td className={`text-right ${isUp ? 'percentage-up' : 'percentage-down'}`}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span>{pl != null ? fmtCurrency(pl) : '—'}</span>
                            <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)
                            </small>
                          </div>
                        </td>
                        <td className="text-right">
                          {sparkData && sparkData.length > 0 && (
                            <div className="sparkline">
                              <svg viewBox="0 0 100 30" width="100" height="30">
                                <polyline
                                  points={sparkData
                                    .map((price, i) => {
                                      const x = (i / (sparkData.length - 1)) * 100;
                                      const min = Math.min(...sparkData);
                                      const max = Math.max(...sparkData);
                                      const y = 30 - ((price - min) / (max - min || 1)) * 30;
                                      return `${x},${y}`;
                                    })
                                    .join(' ')}
                                  fill="none"
                                  stroke={pct7d >= 0 ? 'var(--success)' : 'var(--error)'}
                                  strokeWidth="1"
                                />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="text-right">
                          <button className="btn btn-ghost" style={{padding: '4px 8px', fontSize: 12}} onClick={() => removeEntry(e.id)}>Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'right', fontWeight: 600 }}>Total Portfolio Value</td>
                    <td className="text-right" style={{ fontWeight: 600 }}>{fmtCurrency(totalValue)}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowModal(false)}>
            <div className="card" style={{ width: 420, padding: 16 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>Add Crypto</h3>
              <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, position: 'relative' }}>
                  Coin
                  <input
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      if (!e.target.value.trim()) setSelected(null);
                    }}
                    placeholder="Search by name or symbol"
                    autoComplete="off"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                  />
                  {results.length > 0 && (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 6, maxHeight: 200, overflow: 'auto', background: 'var(--surface)', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                      {results.map(r => (
                        <div 
                          key={r.id} 
                          style={{ 
                            padding: '10px 12px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 10,
                            borderBottom: '1px solid var(--border)'
                          }} 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelected(r); 
                            setSearch(r.name); 
                            setResults([]); 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {r.thumb && <img src={r.thumb} alt={r.name} width={24} height={24} style={{ borderRadius: '50%' }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{r.name}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{(r.symbol || '').toUpperCase()}</div>
                          </div>
                          {r.market_cap_rank && (
                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>#{r.market_cap_rank}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  Total Spent ({currency.toUpperCase()})
                  <input type="number" step="any" min="0" value={totalSpent} onChange={e => setTotalSpent(e.target.value)} required placeholder="e.g., 100" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!selected || !(Number(totalSpent) > 0)}>Add to Portfolio</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
