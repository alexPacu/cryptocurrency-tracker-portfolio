import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import CryptoTable from '../components/CryptoTable';
import '../styles/Dashboard.css';
import { useSettings } from '../contexts/SettingsContext';

export default function Dashboard() {
  const { currency } = useSettings();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) setLoading(true); else setRefreshing(true);
      const ts = Date.now();
      const response = await fetch(`/api/coins?page=1&per_page=250&currency=${encodeURIComponent(currency)}&_ts=${ts}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCoins(data);
      setLastUpdated(new Date());
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch cryptocurrency data');
    } finally {
      if (hasLoadedRef.current) setLoading(false);
      setRefreshing(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let active = true;
    const doSearch = async () => {
      const term = searchTerm.trim();
      if (term.length < 2) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        if (active) setSearchResults(Array.isArray(data) ? data.slice(0, 15) : []);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    };
    const t = setTimeout(doSearch, 300);
    return () => { active = false; clearTimeout(t); };
  }, [searchTerm]);

  useEffect(() => {
    const base = 5000;
    const jitter = Math.floor(Math.random() * 1000);
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        fetchData();
      }
    }, base + jitter);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const total24hVolume = coins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
  const btcDominance = coins[0] ? ((coins[0].market_cap / (totalMarketCap || 1)) * 100).toFixed(1) : "0.0";
  const activeCryptos = coins.length;

  const fmtCurrency = (n, opts={}) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), ...opts }).format(n || 0);
    } catch {
      return `${currency.toUpperCase()} ${Number(n||0).toFixed(2)}`;
    }
  };
  const fmtCompact = (n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), notation: 'compact', compactDisplay: 'short' }).format(n || 0);
    } catch {
      return fmtCurrency(n);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-main">
        <div className="stats-grid">
          <StatCard title="Market Cap" value={fmtCompact(totalMarketCap)} />
          <StatCard title="24h Volume" value={fmtCompact(total24hVolume)} />
          <StatCard title="BTC Dominance" value={`${btcDominance}%`} />
          <StatCard title="Active Cryptos" value={activeCryptos.toLocaleString()} />
        </div>

        

        <div className="content-grid">
          <div className="main-content">
            <div className="card">
              <div className="card-header">
                <h2>Live Cryptocurrency Prices ({currency.toUpperCase()})</h2>
                <div className="header-search">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or symbol"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchLoading && (
                    <span style={{ position: 'absolute', right: 8, top: 10, fontSize: 12, color: 'var(--muted)' }}>Searching…</span>
                  )}
                  {(searchResults.length > 0) && (
                    <div className="search-dropdown">
                      {searchResults.map(r => (
                        <div
                          key={r.id}
                          className="search-result-row"
                          onClick={() => { window.location.href = `/coin/${r.id}`; }}
                        >
                          <div className="search-result-left">
                            <img src={r.thumb || r.image || ''} alt={(r.symbol||r.name||'').toString()} />
                            <span className="search-result-name">
                              {r.name} <small style={{ opacity: 0.7 }}>({(r.symbol||'').toUpperCase()})</small>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(searchTerm.trim().length >= 2 && searchResults.length === 0 && !searchLoading) && (
                    <div className="search-dropdown" style={{ padding: 8, color: 'var(--text-secondary)' }}>No matches.</div>
                  )}
                </div>
                <div className="header-actions">
                  {lastUpdated && (
                    <span style={{ color: 'var(--muted)', fontSize: 12, marginRight: 8 }}>
                      Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <div className="header-pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      title="First page"
                    >
                      «
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      title="Previous page"
                    >
                      ←
                    </button>
                    <span className="page-indicator">Page {currentPage} / {Math.ceil(Math.max(1, (coins?.length||0)) / itemsPerPage)}</span>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(Math.min(Math.ceil(Math.max(1, (coins?.length||0)) / itemsPerPage), currentPage + 1))}
                      disabled={currentPage === Math.ceil(Math.max(1, (coins?.length||0)) / itemsPerPage)}
                      title="Next page"
                    >
                      →
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(Math.ceil(Math.max(1, (coins?.length||0)) / itemsPerPage))}
                      disabled={currentPage === Math.ceil(Math.max(1, (coins?.length||0)) / itemsPerPage)}
                      title="Last page"
                    >
                      »
                    </button>
                  </div>
                  <button 
                    className="btn btn-ghost"
                    onClick={fetchData}
                    disabled={loading || refreshing}
                  >
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>
              {/* Search moved into header; dropdown overlays content */}
              <CryptoTable 
                coins={coins} 
                loading={loading} 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalPages={Math.ceil(Math.max(1, (coins?.length||0)) / itemsPerPage)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}