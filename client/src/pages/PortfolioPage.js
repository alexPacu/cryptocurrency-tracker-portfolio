import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/PortfolioSummary';
import '../styles/pages.css';
import '../styles/Dashboard.css';
import { getCurrentUser, getHoldings, addHolding, removeHolding } from '../utils/portfolioStore';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

export default function PortfolioPage() {
  const { currency } = useSettings();
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?._id || user?.username || 'guest';

  const [entries, setEntries] = useState(() => getHoldings(userId));
  const [prices, setPrices] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

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

  const fetchPrice = useCallback(async (coinId) => {
    try {
      const res = await fetch(`/api/coins/${encodeURIComponent(coinId)}?currency=${encodeURIComponent(currency)}`);
      const data = await res.json();
      const price = data?.market_data?.current_price?.[currency.toLowerCase()] ?? data?.current_price;
      setPrices(prev => ({ ...prev, [coinId]: typeof price === 'number' ? price : null }));
    } catch {
      setPrices(prev => ({ ...prev, [coinId]: null }));
    }
  }, [currency]);

  useEffect(() => {
    const uniqIds = Array.from(new Set(entries.map(e => e.coinId)));
    uniqIds.forEach(id => { if (!(id in prices)) fetchPrice(id); });
  }, [entries, prices, fetchPrice]);

  const totalValue = entries.reduce((sum, e) => sum + (Number(e.amount) || 0) * (prices[e.coinId] || 0), 0);

  const openModal = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowModal(true);
    setSearch(''); setResults([]); setSelected(null); setAmount(''); setBuyPrice('');
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!search || search.trim().length < 2) { setResults([]); return; }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        if (active) setResults(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch {
        if (active) setResults([]);
      }
    };
    const t = setTimeout(run, 250);
    return () => { active = false; clearTimeout(t); };
  }, [search]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    const amt = Number(amount);
    const bp = Number(buyPrice);
    if (!(amt > 0)) return;
    addHolding(userId, {
      coinId: selected.id,
      symbol: selected.symbol || '',
      name: selected.name || selected.id,
      amount: amt,
      buyPrice: bp > 0 ? bp : 0,
      buyCurrency: currency.toUpperCase(),
      addedAt: new Date().toISOString()
    });
    setShowModal(false);
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
                    <th>Coin</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right">Buy Price</th>
                    <th className="text-right">Current Price</th>
                    <th className="text-right">Value</th>
                    <th className="text-right">P/L</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => {
                    const cp = prices[e.coinId];
                    const value = (Number(e.amount) || 0) * (cp || 0);
                    const pl = cp != null ? ((cp - (e.buyPrice || 0)) * (Number(e.amount) || 0)) : null;
                    const isUp = pl != null && pl >= 0;
                    return (
                      <tr key={e.id}>
                        <td>{e.name} <small style={{ opacity: 0.7 }}>({(e.symbol || '').toUpperCase()})</small></td>
                        <td className="text-right">{Number(e.amount).toLocaleString()}</td>
                        <td className="text-right">{fmtCurrency(e.buyPrice || 0)}</td>
                        <td className="text-right">{cp != null ? fmtCurrency(cp) : '—'}</td>
                        <td className="text-right">{fmtCurrency(value)}</td>
                        <td className={`text-right ${isUp ? 'percentage-up' : 'percentage-down'}`}>{pl != null ? fmtCurrency(pl) : '—'}</td>
                        <td className="text-right">
                          <button className="btn btn-ghost" onClick={() => removeEntry(e.id)}>Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
                    <td className="text-right" style={{ fontWeight: 600 }}>{fmtCurrency(totalValue)}</td>
                    <td></td>
                    <td></td>
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
                <label style={{ display: 'grid', gap: 6 }}>
                  Coin
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or symbol" />
                  {results.length > 0 && (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 6, maxHeight: 160, overflow: 'auto' }}>
                      {results.map(r => (
                        <div key={r.id} style={{ padding: '6px 8px', cursor: 'pointer' }} onClick={() => { setSelected(r); setSearch(`${r.name} (${(r.symbol || '').toUpperCase()})`); setResults([]); }}>
                          {r.name} <small style={{ opacity: 0.7 }}>({(r.symbol || '').toUpperCase()})</small>
                        </div>
                      ))}
                    </div>
                  )}
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  Amount
                  <input type="number" step="any" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  Buy Price ({currency.toUpperCase()})
                  <input type="number" step="any" min="0" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!selected || !(Number(amount) > 0)}>Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
