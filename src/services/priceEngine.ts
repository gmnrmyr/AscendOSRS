// Motor de preço local-first — OSRS Wiki Realtime Prices API (grátis, sem API key).
//   /mapping -> id -> { name, ... }            (muda raramente; cache longo)
//   /latest  -> id -> { high, low, ... }       (preço GE ao vivo; cache curto)
// Substitui o código antigo quebrado (que usava wiki pageid no lugar do item id).
//
// Untradeables: port fiel do ItemManager.getItemPrice do RuneLite —
// itemMappings.json (gerado por scripts/generate-item-mappings.mjs a partir do
// ItemMapping.java) converte item untradeable no(s) equivalente(s) tradeable(s)
// (Sanguinesti staff -> uncharged, Ferocious gloves -> Hydra leather, anéis (i),
// barrows degradado, faceguard -> jaw + helm...). É o que faz o total bater com
// o Bank Value do RuneLite. notedItems.json (classe Cert do gameval ItemID.java)
// dá o mapa exato noted -> unnoted, sem heurística de nome.

import itemMappingsJson from '@/data/itemMappings.json';
import notedItemsJson from '@/data/notedItems.json';

// id untradeable -> [[id tradeable, qty], ...] (multimapa, valores somam)
// Os JSONs bundled são o snapshot de fallback; o server (/api/item-mappings)
// serve a versão viva e se auto-regenera quando envelhece (>7d) — itens novos
// do jogo passam a valer sem rebuild do app.
let ITEM_MAPPINGS: Record<string, [number, number][]> = itemMappingsJson as Record<string, [number, number][]>;
let NOTED_TO_BASE: Record<string, number> = notedItemsJson as Record<string, number>;

const LIVE_MAPPINGS_KEY = 'osrs-live-mappings-v1';
const LIVE_MAPPINGS_TTL = 1000 * 60 * 60 * 24; // 24h (o server já segura os 7d de regen)
let liveMappingsLoaded = false;

async function refreshMappingsFromServer(): Promise<void> {
  if (liveMappingsLoaded) return;
  liveMappingsLoaded = true;
  try {
    interface LiveMappings { itemMappings: typeof ITEM_MAPPINGS; notedItems: typeof NOTED_TO_BASE; }
    const cached = readCache<LiveMappings>(LIVE_MAPPINGS_KEY, LIVE_MAPPINGS_TTL);
    if (cached?.itemMappings && cached?.notedItems) {
      ITEM_MAPPINGS = cached.itemMappings;
      NOTED_TO_BASE = cached.notedItems;
      return;
    }
    const res = await fetch('/api/item-mappings');
    if (!res.ok) return; // fica no bundled
    const j: LiveMappings = await res.json();
    if (j.itemMappings && j.notedItems && Object.keys(j.itemMappings).length > 0) {
      ITEM_MAPPINGS = j.itemMappings;
      NOTED_TO_BASE = j.notedItems;
      writeCache(LIVE_MAPPINGS_KEY, j);
    }
  } catch { /* offline/sem server -> bundled continua valendo */ }
}

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
  await refreshMappingsFromServer(); // mappings de untradeable/noted frescos (1x por sessão, cache 24h)

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

// Preço unitário estilo RuneLite (ItemManager.getItemPriceWithSource):
//   coins=1, plat=1000; noted -> unnoted; untradeable mapeado -> soma dos
//   equivalentes tradeable (recursivo — ex: faceguard = basilisk jaw + helm).
// O parâmetro `name` fica só pra telemetria (`via` = de onde veio o preço).
export function priceOfVariant(id: number, name?: string): { unit: number; via?: string } {
  void name;
  return priceRuneLite(id, 0);
}

function priceRuneLite(id: number, depth: number): { unit: number; via?: string } {
  if (id === COINS_ID) return { unit: 1 };
  if (id === PLAT_TOKEN_ID) return { unit: 1000 };
  if (depth > 5) return { unit: 0 }; // guarda contra ciclo no mapping

  const base = NOTED_TO_BASE[String(id)];
  if (base != null) return priceRuneLite(base, depth + 1);

  const mapped = ITEM_MAPPINGS[String(id)];
  if (mapped) {
    let unit = 0;
    const vias: string[] = [];
    for (const [tradeableId, qty] of mapped) {
      const p = priceRuneLite(tradeableId, depth + 1);
      unit += p.unit * qty;
      const viaName = nameMapMem?.get(tradeableId);
      if (viaName) vias.push(qty > 1 ? `${qty}x ${viaName}` : viaName);
    }
    return { unit, via: vias.join(' + ') || undefined };
  }

  return { unit: priceOf(id) };
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

// URL da imagem pela Wiki por NOME — fallback pra itens sem id resolvível
// (untradeables/conquistas: Infernal cape, Fighter torso, Dizana's quiver...).
// Padrão da Wiki: sentence case estrito (só a 1ª letra maiúscula, resto minúsculo,
// vale até pra "Bow of faerdhinen"), espaços viram "_". Case errado = 404.
export function itemImageUrlByName(name: string): string {
  const n = name.trim().replace(/\s+/g, ' ');
  if (!n) return '';
  const file = (n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).replace(/ /g, '_');
  return `https://oldschool.runescape.wiki/images/${encodeURIComponent(file)}.png`;
}

export interface ExportItem { id: number; quantity: number; name: string; }
export interface ValuedItem extends ExportItem { unit: number; value: number; }

// Prepara os itens do "export all" pra RIQUEZA TOTAL (banco + inventário + equip + seed vault).
//
// Modelo: cada stack física conta uma vez, pelo valor da forma UNNOTED (base).
//   - noted (id da classe Cert) -> normaliza pro id base via notedItems.json e SOMA na
//     mesma stack. Ex: 2363 unnoted no banco (x1) + 2364 noted no inventário (x19000)
//     -> runite bar base x19001. Isso é o que faz bater o Bank Value do RuneLite quando
//     você está smithando/tradando barras (elas ficam notadas no inventário/GE).
//   - untradeable com equivalente (Sangui staff, anéis (i)...) NÃO é normalizado aqui;
//     mantém o id próprio e é precificado pelo ITEM_MAPPINGS no priceRuneLite.
//   - id fora da wiki e sem mapping: último recurso resolve o id base pelo NOME.
//
// Nada é descartado (versão antiga jogava fora a stack inteira quando via a forma noted,
// comendo até as barras que estavam de verdade no banco). Agrupa por id base e SOMA —
// stacks distintas (banco + inventário) são riqueza distinta e contam ambas.
function consolidateForTotal(items: ExportItem[]): ExportItem[] {
  const byId = new Map<number, ExportItem>();
  for (const it of items) {
    // noted -> base (mesma riqueza, forma unnoted). Untradeables ficam no próprio id.
    const baseId = NOTED_TO_BASE[String(it.id)] ?? it.id;
    // se o id base já é precificável (wiki ou mapping de untradeable), ele manda;
    // senão tenta resolver pelo nome como último recurso.
    const idIsKnown = priceMapMem?.has(baseId) || ITEM_MAPPINGS[String(baseId)] != null;
    const finalId = idIsKnown ? baseId : nameToIdMem?.get(normName(it.name)) ?? baseId;
    const existing = byId.get(finalId);
    if (existing) {
      existing.quantity += it.quantity; // banco + inventário da mesma coisa -> soma
    } else {
      byId.set(finalId, { id: finalId, name: it.name, quantity: it.quantity });
    }
  }
  return [...byId.values()];
}

// Valoriza uma lista do Data Exporter ([{id,quantity,name}]) com preços ao vivo.
export async function valueExport(rawItems: ExportItem[], force = false): Promise<{ valued: ValuedItem[]; total: number; unpricedCount: number }> {
  await ensurePrices(force);
  const items = consolidateForTotal(rawItems); // noted -> id base, soma stacks (riqueza total)
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
