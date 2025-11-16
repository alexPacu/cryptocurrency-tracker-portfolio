const KEY_PREFIX = 'portfolio.holdings.';

function getUserKey(userId) {
  return KEY_PREFIX + (userId || 'guest');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('auth.user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getHoldings(userId) {
  try {
    const data = localStorage.getItem(getUserKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setHoldings(userId, entries) {
  localStorage.setItem(getUserKey(userId), JSON.stringify(entries || []));
  window.dispatchEvent(new Event('portfolio:change'));
}

export function addHolding(userId, entry) {
  const list = getHoldings(userId);
  list.push({ ...entry, id: entry.id || String(Date.now()) + Math.random().toString(16).slice(2) });
  setHoldings(userId, list);
}

export function removeHolding(userId, entryId) {
  const list = getHoldings(userId).filter(e => e.id !== entryId);
  setHoldings(userId, list);
}

export function updateHolding(userId, entryId, patch) {
  const list = getHoldings(userId).map(e => (e.id === entryId ? { ...e, ...patch } : e));
  setHoldings(userId, list);
}
