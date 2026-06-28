// Motor de preço local-first — OSRS Wiki Realtime Prices API (grátis, sem API key).
//   /mapping -> id -> { name, ... }            (muda raramente; cache longo)
//   /latest  -> id -> { high, low, ... }       (preço GE ao vivo; cache curto)
// Substitui o código antigo quebrado (que usava wiki pageid no lugar do item id).

const BASE = 'https://prices.runescape.wiki/api/v1/osrs';

export const COINS_ID = 995;
export const PLAT_TOKEN_ID = 13204;

const MAPPING_KEY = 'osrs-price-mapping-v1';
const LATEST_KEY = 'osrs-price-latest-v1';
const MAPPING_TTL = 1000 * 60 * 60 * 24 * 7; // 7 dias
const LATEST_TTL = 1000 * 60 * 10;            // 10 min

interface Cached<T> { at: number; data: T; }

function readCache<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const c: Cached<T> = JSON.parse(raw);
    if (Date.now() - c.at > ttl) return null;
    return c.data;
  } catch { return null; }
}

function writeCache<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { /* quota */ }
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

type LatestData = Record<string, { high: number | null; low: number | null }>;
type MappingArr = Array<{ id: number; name: string }>;

let priceMapMem: Map<number, number> | null = null;
let nameMapMem: Map<number, string> | null = null;

// Preço unitário (gp) de um item, em gp. Coins=1, Plat token=1000, sem preço=0.
function unitPrice(id: number, latest: LatestData): number {
  if (id === COINS_ID) return 1;
  if (id === PLAT_TOKEN_ID) return 1000;
  const p = latest[String(id)];
  if (!p) return 0;
  if (p.high && p.low) return Math.round((p.high + p.low) / 2);
  return p.high || p.low || 0;
}

// Garante mapas id->preço e id->nome carregados (com cache). force = ignora cache de preço.
export async function ensurePrices(force = false): Promise<{ priceById: Map<number, number>; nameById: Map<number, string> }> {
  let mapping = readCache<MappingArr>(MAPPING_KEY, MAPPING_TTL);
  if (!mapping) {
    mapping = await getJson(`${BASE}/mapping`);
    writeCache(MAPPING_KEY, mapping);
  }

  let latest = force ? null : readCache<LatestData>(LATEST_KEY, LATEST_TTL);
  if (!latest) {
    const res = await getJson(`${BASE}/latest`);
    latest = res.data as LatestData;
    writeCache(LATEST_KEY, latest);
  }

  const nameById = new Map<number, string>();
  for (const it of mapping) nameById.set(it.id, it.name);

  const priceById = new Map<number, number>();
  for (const id of Object.keys(latest)) priceById.set(Number(id), unitPrice(Number(id), latest));
  priceById.set(COINS_ID, 1);
  priceById.set(PLAT_TOKEN_ID, 1000);

  priceMapMem = priceById;
  nameMapMem = nameById;
  return { priceById, nameById };
}

// Preço unitário de um id, usando o que estiver em memória (após ensurePrices).
export function priceOf(id: number): number {
  if (id === COINS_ID) return 1;
  if (id === PLAT_TOKEN_ID) return 1000;
  return priceMapMem?.get(id) ?? 0;
}

export interface ExportItem { id: number; quantity: number; name: string; }
export interface ValuedItem extends ExportItem { unit: number; value: number; }

// Valoriza uma lista do Data Exporter ([{id,quantity,name}]) com preços ao vivo.
export async function valueExport(items: ExportItem[], force = false): Promise<{ valued: ValuedItem[]; total: number; unpricedCount: number }> {
  await ensurePrices(force);
  let total = 0;
  let unpricedCount = 0;
  const valued = items.map((it) => {
    const unit = priceOf(it.id);
    const value = unit * it.quantity;
    total += value;
    if (unit === 0 && it.id !== COINS_ID) unpricedCount++;
    return { ...it, unit, value };
  });
  return { valued, total, unpricedCount };
}
