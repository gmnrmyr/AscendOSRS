// AscendOSRS — motor de preço local-first (protótipo)
// Fonte: OSRS Wiki Realtime Prices API (grátis, sem API key, só exige User-Agent).
//   /mapping -> id -> { name, value(alch base), members, ... }  (cache longo, muda raramente)
//   /latest  -> id -> { high, low, highTime, lowTime }          (preço GE ao vivo)
// Regra de valor por item:
//   - Coins (995)            = 1 gp cada
//   - Platinum token (13204) = 1000 gp cada
//   - tradeável              = preço GE (média high/low quando ambos existem)
//   - untradeable / sem preço = 0 (riqueza líquida real)

const UA = 'AscendOSRS-local/1.0 (personal wealth tracker; github.com/gmnrmyr)';
const BASE = 'https://prices.runescape.wiki/api/v1/osrs';

const COINS_ID = 995;
const PLAT_TOKEN_ID = 13204;

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

// Constrói o mapa id -> preço (gp por unidade).
export async function buildPriceMap() {
  const [mapping, latest] = await Promise.all([
    getJson(`${BASE}/mapping`),
    getJson(`${BASE}/latest`),
  ]);

  const nameById = new Map();
  for (const it of mapping) nameById.set(it.id, it.name);

  const live = latest.data || {};
  const priceById = new Map();

  for (const [idStr, p] of Object.entries(live)) {
    const id = Number(idStr);
    let price = 0;
    if (p.high && p.low) price = Math.round((p.high + p.low) / 2);
    else price = p.high || p.low || 0;
    priceById.set(id, price);
  }

  // Especiais
  priceById.set(COINS_ID, 1);
  priceById.set(PLAT_TOKEN_ID, 1000);

  return { priceById, nameById, mappingCount: mapping.length, liveCount: Object.keys(live).length };
}

// Valoriza um banco (array do Data Exporter: [{id, quantity, name}]).
export function valueBank(bank, priceById) {
  let total = 0;
  const unpriced = [];
  const lines = [];

  for (const item of bank) {
    const unit = priceById.get(item.id) ?? 0;
    const value = unit * item.quantity;
    total += value;
    if (unit === 0 && item.id !== COINS_ID) {
      unpriced.push(item.name);
    }
    lines.push({ ...item, unit, value });
  }

  lines.sort((a, b) => b.value - a.value);
  return { total, unpriced, lines };
}

export function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}
