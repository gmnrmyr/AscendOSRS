// Histórico de preço dos GOALS — série diária do custo total dos objetivos.
// Fonte: /timeseries?timestep=24h da OSRS Wiki (~365 pontos por item).
//
// Nada é gravado no save: é derivado de mercado + goals atuais, on demand.
// Cache 12h no localStorage (por item), concorrência limitada — mesmo padrão
// educado do goalMarket.
//
// costAt(date): soma de preço(dia) × qtd por goal. Sem ponto naquele dia usa o
// último conhecido antes (ou o primeiro, se o dia antecede o histórico); item
// sem histórico nenhum cai pro currentPrice de hoje (linha reta, mas honesta).
// Conquistas (buyable === false) entram pelo suppliesCost, constante.

import type { PurchaseGoal } from '@/hooks/useAppData';

const BASE = 'https://prices.runescape.wiki/api/v1/osrs';
const CACHE_KEY = 'osrs-goal-history-v1';
const TTL = 12 * 60 * 60 * 1000;
const CONCURRENCY = 3;

// Série compacta de um item: [dia YYYY-MM-DD, preço mid] ordenada por dia.
type DayPoint = [string, number];

interface CacheEntry { at: number; points: DayPoint[] }

function readCacheAll(): Record<string, CacheEntry> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}

function writeCacheAll(all: Record<string, CacheEntry>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(all)); } catch { /* quota */ }
}

// YYYY-MM-DD em UTC — os buckets de 24h da Wiki são carimbados em UTC.
function dayOf(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

interface TsPoint { timestamp: number; avgHighPrice: number | null; avgLowPrice: number | null }

async function fetchOne(id: number): Promise<DayPoint[]> {
  const res = await fetch(`${BASE}/timeseries?timestep=24h&id=${id}`);
  if (!res.ok) throw new Error(`timeseries 24h ${id} -> HTTP ${res.status}`);
  const pts = ((await res.json()).data || []) as TsPoint[];
  const out: DayPoint[] = [];
  for (const p of pts) {
    const mid = p.avgHighPrice != null && p.avgLowPrice != null
      ? (p.avgHighPrice + p.avgLowPrice) / 2
      : (p.avgHighPrice ?? p.avgLowPrice);
    if (mid && mid > 0) out.push([dayOf(p.timestamp), Math.round(mid)]);
  }
  return out;
}

// Último ponto com dia <= date (busca binária); antes do histórico = 1º ponto.
function priceAt(points: DayPoint[], date: string): number | null {
  if (!points.length) return null;
  if (date < points[0][0]) return points[0][1];
  let lo = 0, hi = points.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (points[mid][0] <= date) lo = mid; else hi = mid - 1;
  }
  return points[lo][1];
}

export interface GoalCostHistory {
  // Custo total dos goals na data (YYYY-MM-DD). Determinístico após o fetch.
  costAt: (date: string) => number;
  itemsWithHistory: number; // quantos goals têm série de mercado de verdade
  itemsTotal: number;       // quantos goals entram na conta (custo > 0)
}

// Monta o histórico de custo dos goals atuais. Falha de um item vira fallback
// pro preço de hoje — nunca explode.
export async function fetchGoalHistory(goals: PurchaseGoal[]): Promise<GoalCostHistory> {
  // Só quem entra no "gold needed": compráveis com preço + conquistas com supplies.
  const counted = goals.filter((g) =>
    g.buyable === false ? (g.suppliesCost || 0) > 0 : (g.currentPrice || g.targetPrice || 0) > 0,
  );
  const tradeable = counted.filter((g) => g.buyable !== false && g.itemId && g.itemId > 0);
  const ids = [...new Set(tradeable.map((g) => g.itemId!))];

  const cache = readCacheAll();
  const series = new Map<number, DayPoint[]>();
  const missing: number[] = [];
  for (const id of ids) {
    const hit = cache[String(id)];
    if (hit && Date.now() - hit.at < TTL) series.set(id, hit.points);
    else missing.push(id);
  }

  let i = 0;
  const worker = async () => {
    while (i < missing.length) {
      const id = missing[i++];
      try {
        const points = await fetchOne(id);
        series.set(id, points);
        cache[String(id)] = { at: Date.now(), points };
      } catch {
        series.set(id, []);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, missing.length) }, worker));
  if (missing.length > 0) writeCacheAll(cache);

  // Parte constante (conquistas + itens sem série) + parte que varia com o mercado.
  let fixed = 0;
  const variable: { points: DayPoint[]; qty: number }[] = [];
  let itemsWithHistory = 0;
  for (const g of counted) {
    const qty = g.quantity || 1;
    if (g.buyable === false) { fixed += (g.suppliesCost || 0) * qty; continue; }
    const points = g.itemId ? series.get(g.itemId) : undefined;
    if (points && points.length) { variable.push({ points, qty }); itemsWithHistory++; }
    else fixed += (g.currentPrice || g.targetPrice || 0) * qty;
  }

  const memo = new Map<string, number>();
  const costAt = (date: string): number => {
    const hit = memo.get(date);
    if (hit != null) return hit;
    let total = fixed;
    for (const v of variable) total += (priceAt(v.points, date) || 0) * v.qty;
    memo.set(date, total);
    return total;
  };

  return { costAt, itemsWithHistory, itemsTotal: counted.length };
}
