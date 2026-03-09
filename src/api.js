// src/api.js — Vercel backend client
const BASE  = import.meta.env.VITE_API_URL  || '';
const TOKEN = import.meta.env.VITE_EA_TOKEN || '';
const HDR   = { 'Content-Type': 'application/json', 'X-EA-Token': TOKEN };

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, { headers: HDR, ...opts });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const fetchInstances = () => apiFetch('/api/instances');
export const fetchStatus = (magic, symbol, withEq = false) =>
  apiFetch(`/api/status?magic=${magic}&symbol=${encodeURIComponent(symbol)}${withEq ? '&eq=1' : ''}`);
export const fetchHistory = (magic, symbol, limit = 50, page = 0) =>
  apiFetch(`/api/history?magic=${magic}&symbol=${encodeURIComponent(symbol)}&limit=${limit}&page=${page}`);
export const sendCommand = (magic, symbol, action, param = null, value = null) =>
  apiFetch('/api/command', { method: 'POST', body: JSON.stringify({ magic, symbol, action, param, value }) });
