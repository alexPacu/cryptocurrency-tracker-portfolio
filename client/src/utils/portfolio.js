const KEY = 'portfolio.coins';

/**
 * Returns an array of coin objects saved in the portfolio.
 */
export function getPortfolioCoins() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Save an array of coin objects to portfolio.
 */
export function setPortfolioCoins(coins) {
  localStorage.setItem(KEY, JSON.stringify(coins || []));
  // notify other tabs/components
  window.dispatchEvent(new Event('portfolio:change'));
}

/**
 * Add a coin object (from /api/coins result) to portfolio (no duplicates).
 */
export function addCoinToPortfolio(coin) {
  if (!coin || !coin.id) return;
  const current = getPortfolioCoins();
  if (!current.find(c => c.id === coin.id)) {
    current.push(coin);
    setPortfolioCoins(current);
  }
}

/**
 * Remove coin by id from portfolio.
 */
export function removeCoinFromPortfolio(id) {
  if (!id) return;
  const current = getPortfolioCoins().filter(c => c.id !== id);
  setPortfolioCoins(current);
}

/**
 * Return true if a coin id is in portfolio.
 */
export function isCoinInPortfolio(id) {
  return getPortfolioCoins().some(c => c.id === id);
}