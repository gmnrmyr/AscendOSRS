// Flipping core — dados públicos da OSRS Wiki Realtime Prices API.
// É a MESMA fonte que o GE Tracker/Flipping Copilot revendem por US$5/mês:
//   /latest -> preço insta-buy (high) e insta-sell (low) + timestamps
//   /5m /1h -> preço médio E VOLUME por janela (filtro "flipa de verdade")
//   /mapping -> buy limit + members por item
//   /timeseries -> série histórica pro gráfico
// Margem líquida já desconta a GE tax de 2% na venda.

const BASE = 'https://prices.runescape.wiki/api/v1/osrs';

// Mesmo cache do priceEngine (o /mapping é um download de ~4MB; 1x por semana).
const MAPPING_KEY = 'osrs-price-mapping-v1';
const MAPPING_TTL = 1000 * 60 * 60 * 24 * 7;

// ---------------------------------------------------------------- GE tax 2%
// Regra do jogo (update de 2025): 2% sobre o preço de VENDA, arredonda pra
// baixo, teto de 5m por item; venda abaixo de 50gp não paga (floor -> 0).
// Bonds são isentos.
const TAX_EXEMPT = new Set([13190]); // Old school bond
const TAX_RATE = 0.02;
const TAX_CAP = 5_000_000;

export function geTax(sellPrice: number, itemId?: number): number {
  if (itemId != null && TAX_EXEMPT.has(itemId)) return 0;
  if (sellPrice < 50) return 0;
  return Math.min(Math.floor(sellPrice * TAX_RATE), TAX_CAP);
}

// ---------------------------------------------------------------- tipos
export interface FlipItem {
  id: number;
  name: string;
  members: boolean;
  limit: number;          // buy limit do GE (0 = desconhecido)
  high: number;           // insta-buy (você COMPRA colocando no low e vende no high)
  low: number;
  highTime: number;       // unix s — frescor do preço
  lowTime: number;
  margin: number;         // high - low, bruto
  marginPostTax: number;  // high - tax(high) - low — lucro real por unidade
  roi: number;            // marginPostTax / low (fração)
  vol1h: number;          // unidades negociadas na última hora (buy+sell)
  vol5m: number;
}

export interface TimeseriesPoint {
  timestamp: number;      // unix s
  avgHighPrice: number | null;
  avgLowPrice: number | null;
  highPriceVolume: number;
  lowPriceVolume: number;
}

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

// /mapping completo (id, name, members, limit...). Compartilha o cache do priceEngine.
interface MappingItem { id: number; name: string; members?: boolean; limit?: number; }

async function ensureMapping(): Promise<MappingItem[]> {
  let mapping = readCache<MappingItem[]>(MAPPING_KEY, MAPPING_TTL);
  if (!mapping) {
    mapping = await getJson(`${BASE}/mapping`);
    writeCache(MAPPING_KEY, mapping);
  }
  return mapping!;
}

// ---------------------------------------------------------------- snapshot de mercado
// /latest + /1h + /5m + mapping consolidados em FlipItem[]. Cache em memória de
// 60s — flipping quer preço mais fresco que o cache de 10min do priceEngine.
let snapshotMem: { at: number; items: FlipItem[] } | null = null;
const SNAPSHOT_TTL = 60 * 1000;

export async function fetchMarketSnapshot(force = false): Promise<{ items: FlipItem[]; fetchedAt: number }> {
  if (!force && snapshotMem && Date.now() - snapshotMem.at < SNAPSHOT_TTL) {
    return { items: snapshotMem.items, fetchedAt: snapshotMem.at };
  }

  const [mapping, latest, h1, m5] = await Promise.all([
    ensureMapping(),
    getJson(`${BASE}/latest`).then((r) => r.data as Record<string, { high: number | null; low: number | null; highTime: number | null; lowTime: number | null }>),
    getJson(`${BASE}/1h`).then((r) => r.data as Record<string, { highPriceVolume: number; lowPriceVolume: number }>),
    getJson(`${BASE}/5m`).then((r) => r.data as Record<string, { highPriceVolume: number; lowPriceVolume: number }>),
  ]);

  const items: FlipItem[] = [];
  for (const m of mapping) {
    const p = latest[String(m.id)];
    if (!p || !p.high || !p.low) continue; // sem os dois lados não tem flip
    const v1 = h1[String(m.id)];
    const v5 = m5[String(m.id)];
    const margin = p.high - p.low;
    const marginPostTax = p.high - geTax(p.high, m.id) - p.low;
    items.push({
      id: m.id,
      name: m.name,
      members: m.members ?? false,
      limit: m.limit ?? 0,
      high: p.high,
      low: p.low,
      highTime: p.highTime ?? 0,
      lowTime: p.lowTime ?? 0,
      margin,
      marginPostTax,
      roi: p.low > 0 ? marginPostTax / p.low : 0,
      vol1h: (v1?.highPriceVolume ?? 0) + (v1?.lowPriceVolume ?? 0),
      vol5m: (v5?.highPriceVolume ?? 0) + (v5?.lowPriceVolume ?? 0),
    });
  }

  snapshotMem = { at: Date.now(), items };
  return { items, fetchedAt: snapshotMem.at };
}

// ---------------------------------------------------------------- sugestões
export interface SuggestOptions {
  budget: number;         // gp disponível (gold líquido do save)
  f2pOnly?: boolean;      // true = esconde itens members
  minVol1h: number;       // volume mínimo/h pra "flipar de verdade"
  maxStaleMin: number;    // preço mais velho que isso (min) = fora
  search?: string;
}

export interface FlipSuggestion extends FlipItem {
  qtyAffordable: number;  // min(limit, o que o budget compra)
  potential: number;      // marginPostTax × min(qtyAffordable, vol1h) — lucro realista por ciclo
}

export function suggestFlips(items: FlipItem[], opts: SuggestOptions): FlipSuggestion[] {
  const nowS = Date.now() / 1000;
  const maxAge = opts.maxStaleMin * 60;
  const q = (opts.search || '').trim().toLowerCase();

  const out: FlipSuggestion[] = [];
  for (const it of items) {
    if (q && !it.name.toLowerCase().includes(q)) continue;
    if (!q) {
      // filtros de "flipa de verdade" só valem na sugestão automática;
      // busca por nome mostra o item mesmo parado (o Gui quer VER o item)
      if (opts.f2pOnly && it.members) continue;
      if (it.marginPostTax <= 0) continue;
      if (it.vol1h < opts.minVol1h) continue;
      if (nowS - it.highTime > maxAge || nowS - it.lowTime > maxAge) continue;
      if (it.low > opts.budget) continue; // não compra nem 1
    }
    const byBudget = it.low > 0 ? Math.floor(opts.budget / it.low) : 0;
    const qtyAffordable = Math.max(0, Math.min(it.limit || Infinity, byBudget));
    // O rank é lucro × o que dá pra girar DE VERDADE: limite do GE, budget e
    // velocidade do mercado (vol/h). Sem o cap de volume, item sem limit
    // conhecido vira "potencial infinito" só porque o budget compra milhões.
    const qtyRealistic = Math.min(qtyAffordable, it.vol1h);
    out.push({
      ...it,
      qtyAffordable: Number.isFinite(qtyAffordable) ? qtyAffordable : byBudget,
      potential: it.marginPostTax * qtyRealistic,
    });
  }
  out.sort((a, b) => b.potential - a.potential);
  return out;
}

// ---------------------------------------------------------------- timeseries
// 6h..1y: realtime API da Wiki (/timeseries, high+low+volume, máx 365 pontos por step).
// all: API da Weirdgloop (exchange/history — a mesma dos gráficos da própria Wiki),
//      preço-guia diário do GE desde ~2015; um preço só (sem high/low), volume onde há.
export type ChartRange = '6h' | '24h' | '7d' | '30d' | '1y' | 'all';

export interface ChartSeries {
  kind: 'highlow' | 'single';
  points: TimeseriesPoint[]; // no 'single', o preço vai em avgHighPrice e avgLowPrice=null
}

// timestep da API × quantos pontos do fim interessam pra cada range
const RANGE_CFG: Record<Exclude<ChartRange, 'all'>, { timestep: string; points: number }> = {
  '6h': { timestep: '5m', points: 72 },
  '24h': { timestep: '5m', points: 288 },
  '7d': { timestep: '1h', points: 168 },
  '30d': { timestep: '6h', points: 120 },
  '1y': { timestep: '24h', points: 365 },
};

const tsMem = new Map<string, Cached<TimeseriesPoint[]>>();
const TS_TTL = 5 * 60 * 1000;
const TS_ALL_TTL = 60 * 60 * 1000; // all-time é diário — 1h de cache sobra

async function fetchAllTime(itemId: number): Promise<TimeseriesPoint[]> {
  const j = await getJson(`https://api.weirdgloop.org/exchange/history/osrs/all?id=${itemId}`);
  const arr = (j?.[String(itemId)] ?? []) as { price: number; volume: number | null; timestamp: number }[];
  return arr.map((p) => ({
    timestamp: Math.floor(p.timestamp / 1000),
    avgHighPrice: p.price,
    avgLowPrice: null,
    highPriceVolume: p.volume ?? 0,
    lowPriceVolume: 0,
  }));
}

export async function fetchTimeseries(itemId: number, range: ChartRange): Promise<ChartSeries> {
  if (range === 'all') {
    const key = `${itemId}:all`;
    const hit = tsMem.get(key);
    const points = hit && Date.now() - hit.at < TS_ALL_TTL ? hit.data : await fetchAllTime(itemId);
    if (!hit || Date.now() - hit.at >= TS_ALL_TTL) tsMem.set(key, { at: Date.now(), data: points });
    return { kind: 'single', points };
  }
  const cfg = RANGE_CFG[range];
  const key = `${itemId}:${cfg.timestep}`;
  const hit = tsMem.get(key);
  const full = hit && Date.now() - hit.at < TS_TTL
    ? hit.data
    : ((await getJson(`${BASE}/timeseries?timestep=${cfg.timestep}&id=${itemId}`)).data as TimeseriesPoint[]);
  if (!hit || Date.now() - hit.at >= TS_TTL) tsMem.set(key, { at: Date.now(), data: full });
  return { kind: 'highlow', points: full.slice(-cfg.points) };
}

// ---------------------------------------------------------------- journal / favoritos (tipos do save)
export interface FlipFavorite {
  itemId: number;
  name: string;
  note?: string;
  addedAt: string; // ISO
}

export interface FlipJournalEntry {
  id: string;
  itemId: number;
  name: string;
  qty: number;
  buyPrice: number;        // por unidade
  sellPrice?: number;      // por unidade (definido ao fechar)
  boughtAt: string;        // ISO
  soldAt?: string;         // ISO
  status: 'open' | 'closed';
}

export interface FlippingData {
  favorites: FlipFavorite[];
  journal: FlipJournalEntry[];
}

export const emptyFlippingData = (): FlippingData => ({ favorites: [], journal: [] });

// Lucro realizado de um flip fechado (desconta tax de 2% na venda).
export function flipProfit(e: FlipJournalEntry): number {
  if (e.status !== 'closed' || e.sellPrice == null) return 0;
  return (e.sellPrice - geTax(e.sellPrice, e.itemId) - e.buyPrice) * e.qty;
}

// P&L realizado agrupado por dia (YYYY-MM-DD do soldAt), mais recente primeiro.
export function dailyPnL(journal: FlipJournalEntry[]): { date: string; profit: number; flips: number }[] {
  const byDay = new Map<string, { profit: number; flips: number }>();
  for (const e of journal) {
    if (e.status !== 'closed' || !e.soldAt) continue;
    const day = e.soldAt.slice(0, 10);
    const acc = byDay.get(day) ?? { profit: 0, flips: 0 };
    acc.profit += flipProfit(e);
    acc.flips++;
    byDay.set(day, acc);
  }
  return [...byDay.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
