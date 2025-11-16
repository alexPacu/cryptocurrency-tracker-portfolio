import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import '../styles/pages.css';
import { useSettings } from '../contexts/SettingsContext';

export default function CoinDetails() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useSettings();

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

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        {loading && <p>Loading...</p>}
        {!loading && !coin && <p>Coin not found.</p>}
        {coin && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={coin.image?.large || coin.image?.small} alt={coin.name} width={48} height={48} />
              <h2>{coin.name} <small style={{ opacity: 0.7 }}>({coin.symbol?.toUpperCase()})</small></h2>
            </div>

            <p>
              Current price:{' '}
              {(() => {
                const code = currency.toLowerCase();
                const val = coin.market_data?.current_price?.[code];
                try {
                  return val != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(val) : 'N/A';
                } catch {
                  return val != null ? `${currency.toUpperCase()} ${Number(val).toFixed(2)}` : 'N/A';
                }
              })()}
            </p>

            {coin.market_data && (
              <ul>
                <li>
                  Market cap:{' '}
                  {(() => {
                    const code = currency.toLowerCase();
                    const val = coin.market_data.market_cap?.[code];
                    try {
                      return val != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), notation: 'compact', compactDisplay: 'short' }).format(val) : 'N/A';
                    } catch {
                      return val != null ? `${currency.toUpperCase()} ${Number(val).toFixed(2)}` : 'N/A';
                    }
                  })()}
                </li>
                <li>24h change: {coin.market_data.price_change_percentage_24h?.toFixed(2)}%</li>
              </ul>
            )}

            {coin.description?.en && (
              <section style={{ marginTop: 12 }}>
                <h3>Description</h3>
                <div className="coin-description" dangerouslySetInnerHTML={{ __html: coin.description.en }} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}