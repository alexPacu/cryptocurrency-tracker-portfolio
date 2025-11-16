import { getCurrentUser } from './portfolioStore';

const GLOBAL_KEY = 'watchlist.coins';
const LEGACY_KEY = 'portfolio.coins';
const KEY_PREFIX = 'watchlist.coins.';

function getUserKey() {
  const user = getCurrentUser();
  if (!user) return null;
  const uid = user._id || user.username || 'unknown';
  return KEY_PREFIX + uid;
}

function migrateIfNeeded() {
  try {
    const perUserKey = getUserKey();
    if (!perUserKey) return;
    const existing = localStorage.getItem(perUserKey);
    if (!existing) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      const global = localStorage.getItem(GLOBAL_KEY);
      const src = global || legacy;
      if (src) localStorage.setItem(perUserKey, src);
    }
  } catch {}
}

export function getWatchlistCoins() {
  migrateIfNeeded();
  try {
    const key = getUserKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function setWatchlistCoins(coins) {
  const key = getUserKey();
  if (!key) return; 
  localStorage.setItem(key, JSON.stringify(coins || []));
  window.dispatchEvent(new Event('watchlist:change'));
}

export function addCoinToWatchlist(coin) {
  if (!coin || !coin.id) return;
  const key = getUserKey();
  if (!key) return;
  const current = getWatchlistCoins();
  if (!current.find(c => c.id === coin.id)) {
    current.push(coin);
    setWatchlistCoins(current);
  }
}

export function removeCoinFromWatchlist(id) {
  if (!id) return;
  const key = getUserKey();
  if (!key) return;
  const current = getWatchlistCoins().filter(c => c.id !== id);
  setWatchlistCoins(current);
}

export function isCoinInWatchlist(id) {
  return getWatchlistCoins().some(c => c.id === id);
}
