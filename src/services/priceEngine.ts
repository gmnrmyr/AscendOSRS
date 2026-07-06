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
let nameToIdMem: Map<string, number> | null = null; // nome normalizado -> id (resolução de goals por nome)

const normName = (s: string) => (s || '').trim().toLowerCase().replace(/\s*\(members\)\s*$/i, '');

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
  const nameToId = new Map<string, number>();
  for (const it of mapping) {
    nameById.set(it.id, it.name);
    const key = normName(it.name);
    if (!nameToId.has(key)) nameToId.set(key, it.id); // 1º id ganha (item base)
  }

  const priceById = new Map<number, number>();
  for (const id of Object.keys(latest)) priceById.set(Number(id), unitPrice(Number(id), latest));
  priceById.set(COINS_ID, 1);
  priceById.set(PLAT_TOKEN_ID, 1000);

  priceMapMem = priceById;
  nameMapMem = nameById;
  nameToIdMem = nameToId;
  return { priceById, nameById };
}

// Preço unitário de um id, usando o que estiver em memória (após ensurePrices).
export function priceOf(id: number): number {
  if (id === COINS_ID) return 1;
  if (id === PLAT_TOKEN_ID) return 1000;
  return priceMapMem?.get(id) ?? 0;
}

// Variantes que a Wiki /latest NÃO precifica (ID untradeable), mas que valem o
// item-base tradeable — igual o tracker do RuneLite. Dado um nome, devolve os
// nomes-base candidatos a tentar (barrows degradado, anel imbued, charged→uncharged).
function variantBaseNames(name: string): string[] {
  const n = name || '';
  const out: string[] = [];
  // Barrows degradados: "Dharok's helm 100" -> "Dharok's helm"
  if (/^(Dharok's|Guthan's|Karil's|Ahrim's|Torag's|Verac's)\b/i.test(n) && /\s+\d+$/.test(n)) {
    out.push(n.replace(/\s+\d+$/, ''));
  }
  // Anéis imbued: "Berserker ring (i)" / "Ring of suffering (ri)" -> base tradeable
  if (/\s\(ri\)$/i.test(n)) out.push(n.replace(/\s*\(ri\)$/i, ''));
  if (/\s\(i\)$/i.test(n)) out.push(n.replace(/\s*\(i\)$/i, ''));
  // Ornament kit "(or)" -> item-base (Tormented bracelet (or), Occult necklace (or)...)
  if (/\s\(or\)$/i.test(n)) out.push(n.replace(/\s*\(or\)$/i, ''));
  // Enchanted+imbued "(ei)" -> "(e)" e depois o cru (Salve amulet(ei))
  if (/\(ei\)$/i.test(n)) { out.push(n.replace(/\s*\(ei\)$/i, ' (e)')); out.push(n.replace(/\s*\(ei\)$/i, '')); }
  // Sufixo "(untradeable)" -> o tradeable homônimo (Old school bond (untradeable))
  if (/\s\(untradeable\)$/i.test(n)) out.push(n.replace(/\s*\(untradeable\)$/i, ''));
  // Charged -> uncharged (Serpentine helm, tridents...): só casa se o base existir.
  out.push(`${n} (uncharged)`);
  return out;
}

// Preço unitário resolvendo variante -> item-base pelo nome quando o id não tem
// preço direto. Devolve também o nome-base usado (pra debug/telemetria).
export function priceOfVariant(id: number, name: string): { unit: number; via?: string } {
  const direct = priceOf(id);
  if (direct > 0) return { unit: direct };
  if (name && nameToIdMem) {
    for (const base of variantBaseNames(name)) {
      const bid = nameToIdMem.get(normName(base));
      if (bid != null) {
        const p = priceOf(bid);
        if (p > 0) return { unit: p, via: base };
      }
    }
  }
  return { unit: 0 };
}

// Resolve o id de um item pelo nome (exato -> começa-com -> contém). Pra goals sem id confiável.
export function idByName(name: string): number | null {
  if (!nameToIdMem) return null;
  const key = normName(name);
  if (nameToIdMem.has(key)) return nameToIdMem.get(key)!;
  let best: number | null = null;
  for (const [k, id] of nameToIdMem) {
    if (k.startsWith(key)) { if (best === null || id < best) best = id; }
  }
  if (best !== null) return best;
  for (const [k, id] of nameToIdMem) {
    if (k.includes(key)) { if (best === null || id < best) best = id; }
  }
  return best;
}

// URL da imagem (sprite) do item por id — Weirdgloop (mesma org da OSRS Wiki).
export function itemImageUrl(id: number): string {
  return `https://chisel.weirdgloop.org/static/img/osrs-sprite/${id}.png`;
}

export interface ExportItem { id: number; quantity: number; name: string; }
export interface ValuedItem extends ExportItem { unit: number; value: number; }

// Valoriza uma lista do Data Exporter ([{id,quantity,name}]) com preços ao vivo.
export async function valueExport(items: ExportItem[], force = false): Promise<{ valued: ValuedItem[]; total: number; unpricedCount: number }> {
  await ensurePrices(force);
  let total = 0;
  let unpricedCount = 0;
  const valued = items.map((it) => {
    const unit = priceOfVariant(it.id, it.name).unit;
    const value = unit * it.quantity;
    total += value;
    if (unit === 0 && it.id !== COINS_ID) unpricedCount++;
    return { ...it, unit, value };
  });
  return { valued, total, unpricedCount };
}
