// Radar de mercado dos GOALS — variação do dia + alvo de compra "esperto".
// Fonte: /timeseries?timestep=1h da OSRS Wiki (~15 dias de histórico por item).
//
// - changePct: preço agora vs ~24h atrás (mid entre avgHigh/avgLow)
// - smartTarget: percentil 25 dos preços LOW dos últimos 7 dias, arredondado
//   pra "número de oferta". É um preço que o item VISITA de verdade toda
//   semana — melhor que o preço do momento, sem ser fundo-de-poço inatingível.
//
// Cache 1h no localStorage (por item) — abrir a aba Goals não martela a API.

const BASE = 'https://prices.runescape.wiki/api/v1/osrs';
const CACHE_KEY = 'osrs-goal-market-v1';
const TTL = 60 * 60 * 1000;
const CONCURRENCY = 3;

export interface GoalMarket {
  changePct: number | null;   // % nas últimas 24h (positivo = subiu)
  smartTarget: number | null; // alvo de compra sugerido (gp)
}

interface CacheEntry extends GoalMarket { at: number }

function readCacheAll(): Record<string, CacheEntry> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}

function writeCacheAll(all: Record<string, CacheEntry>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(all)); } catch { /* quota */ }
}

// Arredonda pra baixo em 3 algarismos significativos — vira um preço de oferta
// (1.273.456.789 -> 1.270.000.000).
function niceOffer(n: number): number {
  if (n < 1000) return Math.max(1, Math.floor(n));
  const mag = 10 ** (Math.floor(Math.log10(n)) - 2);
  return Math.floor(n / mag) * mag;
}

interface TsPoint { timestamp: number; avgHighPrice: number | null; avgLowPrice: number | null }

function mid(p: TsPoint): number | null {
  if (p.avgHighPrice != null && p.avgLowPrice != null) return (p.avgHighPrice + p.avgLowPrice) / 2;
  return p.avgHighPrice ?? p.avgLowPrice;
}

async function fetchOne(id: number): Promise<GoalMarket> {
  const res = await fetch(`${BASE}/timeseries?timestep=1h&id=${id}`);
  if (!res.ok) throw new Error(`timeseries ${id} -> HTTP ${res.status}`);
  const pts = ((await res.json()).data || []) as TsPoint[];
  const priced = pts.filter((p) => (mid(p) ?? 0) > 0);
  if (priced.length === 0) return { changePct: null, smartTarget: null };

  const last = priced[priced.length - 1];
  const lastMid = mid(last)!;

  // ponto mais próximo de 24h antes do último — variação "do dia"
  const target = last.timestamp - 24 * 3600;
  let ref = priced[0];
  for (const p of priced) {
    if (Math.abs(p.timestamp - target) < Math.abs(ref.timestamp - target)) ref = p;
  }
  const refMid = mid(ref)!;
  // sem histórico suficiente (ref é o próprio último ponto) -> sem variação
  const changePct = ref === last ? null : ((lastMid - refMid) / refMid) * 100;

  // lows dos últimos 7 dias -> percentil 25 = alvo que o mercado visita
  const cut = last.timestamp - 7 * 24 * 3600;
  const lows = priced
    .filter((p) => p.timestamp >= cut)
    .map((p) => p.avgLowPrice ?? p.avgHighPrice!)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  // exige um mínimo de pontos pro percentil dizer alguma coisa
  const smartTarget = lows.length >= 8 ? niceOffer(lows[Math.floor(lows.length * 0.25)]) : null;

  return { changePct, smartTarget };
}

// Busca o mercado de vários itens (cache 1h; falha de um item vira nulls, nunca explode).
export async function fetchGoalMarket(ids: number[]): Promise<Map<number, GoalMarket>> {
  const uniq = [...new Set(ids.filter((id) => id > 0))];
  const cache = readCacheAll();
  const out = new Map<number, GoalMarket>();
  const missing: number[] = [];

  for (const id of uniq) {
    const hit = cache[String(id)];
    if (hit && Date.now() - hit.at < TTL) out.set(id, { changePct: hit.changePct, smartTarget: hit.smartTarget });
    else missing.push(id);
  }

  // fila com concorrência limitada — educado com a API da Wiki
  let i = 0;
  const worker = async () => {
    while (i < missing.length) {
      const id = missing[i++];
      try {
        const m = await fetchOne(id);
        out.set(id, m);
        cache[String(id)] = { ...m, at: Date.now() };
      } catch {
        out.set(id, { changePct: null, smartTarget: null });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, missing.length) }, worker));
  if (missing.length > 0) writeCacheAll(cache);

  return out;
}
