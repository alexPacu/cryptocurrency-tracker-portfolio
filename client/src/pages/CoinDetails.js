import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import '../styles/pages.css';
import '../styles/CoinDetails.css';
import { useSettings } from '../contexts/SettingsContext';
import { addCoinToWatchlist, removeCoinFromWatchlist, isCoinInWatchlist } from '../utils/watchlist';
import { getCurrentUser, getHoldings, addHolding } from '../utils/portfolioStore';

export default function CoinDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalSpent, setTotalSpent] = useState('');
  const { currency } = useSettings();

  const isLoggedIn = !!localStorage.getItem('auth.token');
  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?._id || user?.username || 'guest';
  const holdings = useMemo(() => getHoldings(userId), [userId]);
  const inPortfolio = holdings.some(h => h.coinId === id);

  useEffect(() => {
    setInWatchlist(isCoinInWatchlist(id));
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/coins/${id}?currency=${encodeURIComponent(currency)}`);
        if (!res.ok) {
          throw new Error('Failed to load coin data');
        }
        const data = await res.json();
        if (mounted) setCoin(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load coin data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, currency]);

  useEffect(() => {
    let mounted = true;
    const loadChart = async () => {
      setChartLoading(true);
      try {
        const res = await fetch(`/api/coins/${id}/sparkline?currency=${encodeURIComponent(currency)}&days=${timeRange}`);
        const data = await res.json();
        if (mounted && data.prices) {
          setChartData(data.prices);
        }
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        if (mounted) setChartLoading(false);
      }
    };
    loadChart();
    return () => { mounted = false; };
  }, [id, currency, timeRange]);

  const handleWatchlistToggle = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (inWatchlist) {
      removeCoinFromWatchlist(id);
      setInWatchlist(false);
      toast.success('Removed from watchlist');
    } else {
      const coinData = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image?.small || coin.image?.large,
        current_price: coin.market_data?.current_price?.[currency.toLowerCase()] || 0,
        market_cap: coin.market_data?.market_cap?.[currency.toLowerCase()] || 0,
        price_change_percentage_24h: coin.market_data?.price_change_percentage_24h || 0
      };
      addCoinToWatchlist(coinData);
      setInWatchlist(true);
      toast.success('Added to watchlist');
    }
  };

  const handleAddToPortfolio = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const spent = Number(totalSpent);
    if (!(spent > 0)) return;

    const currentPrice = coin.market_data?.current_price?.[currency.toLowerCase()] || 0;
    if (!currentPrice || currentPrice <= 0) {
      toast.error('Unable to fetch current price');
      return;
    }

    const amount = spent / currentPrice;
    addHolding(userId, {
      coinId: coin.id,
      symbol: coin.symbol || '',
      name: coin.name || coin.id,
      image: coin.image?.small || coin.image?.large || '',
      amount: amount,
      buyPrice: currentPrice,
      buyCurrency: currency.toUpperCase(),
      addedAt: new Date().toISOString()
    });
    setShowAddModal(false);
    setTotalSpent('');
    toast.success('Added to portfolio');
  };

  const fmtCurrency = (n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(n || 0);
    } catch {
      return `${currency.toUpperCase()} ${Number(n || 0).toFixed(2)}`;
    }
  };

  const fmtCompact = (n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), notation: 'compact', compactDisplay: 'short' }).format(n || 0);
    } catch {
      return fmtCurrency(n);
    }
  };

  const priceChange = coin?.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;

  const renderChart = () => {
    if (chartLoading) {
      return <div className="chart-loading">Loading chart...</div>;
    }
    if (!chartData || chartData.length === 0) {
      return <div className="chart-loading">No chart data available</div>;
    }

    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;
    const width = 800;
    const height = 300;
    const padding = 40;

    const points = chartData.map((price, i) => {
      const x = padding + (i / (chartData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((price - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const firstPrice = chartData[0];
    const lastPrice = chartData[chartData.length - 1];
    const chartIsPositive = lastPrice >= firstPrice;

    const yLabels = [];
    for (let i = 0; i <= 4; i++) {
      const value = min + (range * i) / 4;
      const y = height - padding - (i / 4) * (height - padding * 2);
      yLabels.push({ value, y });
    }

    return (
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="price-chart">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={chartIsPositive ? 'var(--success)' : 'var(--error)'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={chartIsPositive ? 'var(--success)' : 'var(--error)'} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {yLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={label.y}
                x2={width - padding}
                y2={label.y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding - 5}
                y={label.y + 4}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize="10"
              >
                {fmtCompact(label.value)}
              </text>
            </g>
          ))}

          <polygon
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill="url(#chartGradient)"
          />

          <polyline
            points={points}
            fill="none"
            stroke={chartIsPositive ? 'var(--success)' : 'var(--error)'}
            strokeWidth="2"
          />

          <circle
            cx={padding}
            cy={height - padding - ((firstPrice - min) / range) * (height - padding * 2)}
            r="4"
            fill={chartIsPositive ? 'var(--success)' : 'var(--error)'}
          />
          <circle
            cx={width - padding}
            cy={height - padding - ((lastPrice - min) / range) * (height - padding * 2)}
            r="4"
            fill={chartIsPositive ? 'var(--success)' : 'var(--error)'}
          />
        </svg>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        {loading && <div className="loading">Loading...</div>}
        {!loading && !coin && <p>Coin not found.</p>}
        {coin && (
          <>
            <div className="coin-header card">
              <div className="coin-header-left">
                <img src={coin.image?.large || coin.image?.small} alt={coin.name} className="coin-logo" />
                <div className="coin-title">
                  <h1>{coin.name} <span className="coin-symbol-large">({coin.symbol?.toUpperCase()})</span></h1>
                  <div className="coin-price-container">
                    <span className="coin-price-large">{fmtCurrency(coin.market_data?.current_price?.[currency.toLowerCase()])}</span>
                    <span className={`price-change-badge ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="coin-header-actions">
                <button
                  className={`btn ${inWatchlist ? 'btn-watchlist-active' : 'btn-ghost'}`}
                  onClick={handleWatchlistToggle}
                >
                  {inWatchlist ? '★ In Watchlist' : '☆ Add to Watchlist'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!isLoggedIn) {
                      navigate('/login');
                      return;
                    }
                    setShowAddModal(true);
                  }}
                >
                  {inPortfolio ? '+ Add More' : '+ Add to Portfolio'}
                </button>
              </div>
            </div>

            <div className="card chart-card">
              <div className="chart-header">
                <h2>Price Chart ({currency.toUpperCase()})</h2>
                <div className="time-range-selector">
                  {['1', '7', '14', '30'].map((days) => (
                    <button
                      key={days}
                      className={`time-btn ${timeRange === days ? 'active' : ''}`}
                      onClick={() => setTimeRange(days)}
                    >
                      {days === '1' ? '24h' : `${days}d`}
                    </button>
                  ))}
                </div>
              </div>
              {renderChart()}
            </div>

            <div className="card stats-card">
              <h2>Market Statistics</h2>
              <div className="stats-grid-details">
                <div className="stat-item-detail">
                  <span className="stat-label">Market Cap</span>
                  <span className="stat-value">{fmtCompact(coin.market_data?.market_cap?.[currency.toLowerCase()])}</span>
                </div>
                <div className="stat-item-detail">
                  <span className="stat-label">All Time High</span>
                  <span className="stat-value">
                    {coin.market_data?.ath?.[currency.toLowerCase()] 
                      ? fmtCurrency(coin.market_data.ath[currency.toLowerCase()])
                      : 'N/A'}
                  </span>
                  {coin.market_data?.ath_date?.[currency.toLowerCase()] && (
                    <span className="stat-date">
                      {new Date(coin.market_data.ath_date[currency.toLowerCase()]).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {coin.description?.en && (
              <div className="card">
                <h2>About {coin.name}</h2>
                <div className="coin-description" dangerouslySetInnerHTML={{ __html: coin.description.en.split('. ').slice(0, 3).join('. ') + '.' }} />
              </div>
            )}

            {inPortfolio && (
              <div className="card holdings-card">
                <h2>Your Holdings</h2>
                <div className="holdings-list">
                  {holdings.filter(h => h.coinId === id).map(h => {
                    const currentPrice = coin.market_data?.current_price?.[currency.toLowerCase()] || 0;
                    const value = h.amount * currentPrice;
                    const cost = h.amount * h.buyPrice;
                    const pl = value - cost;
                    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                    return (
                      <div key={h.id} className="holding-item">
                        <div className="holding-info">
                          <span className="holding-amount">{h.amount.toFixed(6)} {coin.symbol?.toUpperCase()}</span>
                          <span className="holding-value">{fmtCurrency(value)}</span>
                        </div>
                        <div className={`holding-pl ${pl >= 0 ? 'percentage-up' : 'percentage-down'}`}>
                          {pl >= 0 ? '+' : ''}{fmtCurrency(pl)} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="card modal-content" onClick={e => e.stopPropagation()}>
              <h3>Add {coin?.name} to Portfolio</h3>
              <form onSubmit={handleAddToPortfolio} style={{ display: 'grid', gap: 12 }}>
                <div className="modal-coin-info">
                  <img src={coin?.image?.small} alt={coin?.name} width={32} height={32} />
                  <span>{coin?.name} ({coin?.symbol?.toUpperCase()})</span>
                </div>
                <div className="modal-price-info">
                  Current Price: {fmtCurrency(coin?.market_data?.current_price?.[currency.toLowerCase()])}
                </div>
                <label style={{ display: 'grid', gap: 6 }}>
                  Total Amount to Invest ({currency.toUpperCase()})
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={totalSpent}
                    onChange={e => setTotalSpent(e.target.value)}
                    required
                    placeholder="e.g., 100"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                  />
                </label>
                {totalSpent && Number(totalSpent) > 0 && coin?.market_data?.current_price?.[currency.toLowerCase()] && (
                  <div className="modal-calculation">
                    You will get: {(Number(totalSpent) / coin.market_data.current_price[currency.toLowerCase()]).toFixed(6)} {coin.symbol?.toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!(Number(totalSpent) > 0)}>Add to Portfolio</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}