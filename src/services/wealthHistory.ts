// Histórico de riqueza total (soma de todos os bancos ao longo do tempo).
// Local-first: os snapshots viajam junto com o dashboard no /api/data (disco no Mac),
// então sobrevivem a limpar cache do browser e são compartilhados entre origins (LAN).
// 1 ponto por dia (upsert por data) — o último valor do dia sobrescreve o anterior.

import type { Character, BankItem } from '@/hooks/useAppData';

// Foto compacta dos itens: nome -> [qtd, preço unitário].
// Valor do item = qtd * unit (derivado, não guardado, pra economizar espaço).
export type ItemSnap = Record<string, [number, number]>;

// Foto por conta: nome da conta -> foto de itens daquela conta.
export type ItemsByChar = Record<string, ItemSnap>;

export interface WealthSnapshot {
  date: string;   // YYYY-MM-DD (chave de dedup por dia)
  ts: string;     // ISO do momento em que foi carimbado
  total: number;  // riqueza somada de todas as contas (gp)
  byChar: Record<string, number>; // riqueza por conta (gp)
  items?: ItemSnap; // legado: foto agregada entre contas (snapshots antigos)
  itemsByChar?: ItemsByChar; // foto por conta; só nos recentes (ver ITEM_DETAIL_KEEP)
}

// Quantos snapshots recentes guardam o detalhe por item. Os mais antigos viram
// só total+byChar (o `items` é apagado) pra segurar o crescimento do arquivo.
export const ITEM_DETAIL_KEEP = 90;

// Mesma conta do BankOverview: floor(qty) * preço unitário.
// Coins entram como item de estimatedPrice=1 e platinum como 1000, então isso
// já inclui o ouro. Só considera contas que ainda existem (ignora lixo órfão).
export function computeWealth(
  characters: Character[],
  bankData: Record<string, BankItem[]>,
): { total: number; byChar: Record<string, number> } {
  const byChar: Record<string, number> = {};
  let total = 0;
  for (const c of characters) {
    const items = bankData[c.name] || [];
    const v = items.reduce((s, it) => s + Math.floor(it.quantity || 0) * (it.estimatedPrice || 0), 0);
    if (v > 0) {
      byChar[c.name] = v;
      total += v;
    }
  }
  return { total, byChar };
}

// Foto item-a-item POR CONTA. Dentro da conta, homônimos somam qtd (preço
// unitário é de mercado — pego o maior por segurança).
// Ignora item sem qtd ou sem preço (lixo que não afeta riqueza).
export function computeItemsByChar(
  characters: Character[],
  bankData: Record<string, BankItem[]>,
): ItemsByChar {
  const out: ItemsByChar = {};
  for (const c of characters) {
    const items = bankData[c.name] || [];
    const snap: ItemSnap = {};
    for (const it of items) {
      const qty = Math.floor(it.quantity || 0);
      const unit = it.estimatedPrice || 0;
      if (qty <= 0 || unit <= 0) continue;
      const cur = snap[it.name];
      if (cur) { cur[0] += qty; cur[1] = Math.max(cur[1], unit); }
      else snap[it.name] = [qty, unit];
    }
    if (Object.keys(snap).length) out[c.name] = snap;
  }
  return out;
}

// Agrega uma ItemsByChar numa foto única (soma qtd entre contas).
function aggregateChars(byChar: ItemsByChar): ItemSnap {
  const agg: ItemSnap = {};
  for (const snap of Object.values(byChar)) {
    for (const [name, [qty, unit]] of Object.entries(snap)) {
      const cur = agg[name];
      if (cur) { cur[0] += qty; cur[1] = Math.max(cur[1], unit); }
      else agg[name] = [qty, unit];
    }
  }
  return agg;
}

// Foto de itens de um snapshot, tanto faz o formato: novo (itemsByChar) é
// agregado on-the-fly; antigo devolve o `items` legado direto.
export function snapshotItems(s: WealthSnapshot): ItemSnap | undefined {
  if (s.itemsByChar) return aggregateChars(s.itemsByChar);
  return s.items;
}

// YYYY-MM-DD em horário local a partir de um Date.
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Insere/atualiza o snapshot do dia. Retorna um NOVO array (não muta o original).
// - Se já existe ponto para hoje: sobrescreve com o valor atual.
// - Não grava zero num histórico vazio (evita poluir com "0" antes de ter dados).
export function upsertSnapshot(
  history: WealthSnapshot[],
  characters: Character[],
  bankData: Record<string, BankItem[]>,
  now: Date = new Date(),
): WealthSnapshot[] {
  const { total, byChar } = computeWealth(characters, bankData);
  const hist = Array.isArray(history) ? history : [];
  if (total <= 0 && hist.length === 0) return hist; // ainda sem dados: não cria ponto zero

  const date = dayKey(now);
  const itemsByChar = computeItemsByChar(characters, bankData);
  const snap: WealthSnapshot = { date, ts: now.toISOString(), total, byChar, itemsByChar };
  const rest = hist.filter((s) => s.date !== date);
  const next = [...rest, snap].sort((a, b) => a.date.localeCompare(b.date));
  // Thinning: mantém o detalhe por item só nos últimos ITEM_DETAIL_KEEP snapshots.
  const cut = next.length - ITEM_DETAIL_KEEP;
  for (let i = 0; i < cut; i++) { delete next[i].items; delete next[i].itemsByChar; }
  return next;
}

// ---- Diff entre dois snapshots: "o que mudou" ----

export interface ItemMover {
  name: string;
  prevValue: number; currValue: number; deltaValue: number; deltaPct: number;
  prevQty: number; currQty: number; prevUnit: number; currUnit: number;
  reason: 'price' | 'qty' | 'both' | 'new' | 'gone';
}

// Diff de duas fotos de itens: maiores movimentos por valor absoluto, com a
// causa: preço (mercado), qtd (comprou/vendeu), ambos, novo ou saiu.
function diffSnaps(a: ItemSnap, b: ItemSnap): ItemMover[] {
  const names = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: ItemMover[] = [];
  for (const name of names) {
    const [pQty, pUnit] = a[name] || [0, 0];
    const [cQty, cUnit] = b[name] || [0, 0];
    const prevValue = pQty * pUnit, currValue = cQty * cUnit;
    const deltaValue = currValue - prevValue;
    if (deltaValue === 0) continue;
    const qtyChanged = cQty !== pQty, unitChanged = cUnit !== pUnit;
    let reason: ItemMover['reason'];
    if (pQty === 0) reason = 'new';
    else if (cQty === 0) reason = 'gone';
    else if (qtyChanged && unitChanged) reason = 'both';
    else if (unitChanged) reason = 'price';
    else reason = 'qty';
    const deltaPct = prevValue > 0 ? (deltaValue / prevValue) * 100 : 100;
    out.push({ name, prevValue, currValue, deltaValue, deltaPct, prevQty: pQty, currQty: cQty, prevUnit: pUnit, currUnit: cUnit, reason });
  }
  return out.sort((x, y) => Math.abs(y.deltaValue) - Math.abs(x.deltaValue));
}

// Diff agregado entre contas (visão antiga). Funciona com qualquer mistura de
// formato (snapshot legado `items` × novo `itemsByChar`).
export function diffItems(prev: WealthSnapshot, curr: WealthSnapshot): ItemMover[] {
  const a = snapshotItems(prev), b = snapshotItems(curr);
  if (!a || !b) return [];
  return diffSnaps(a, b);
}

export interface CharItemMovers { char: string; delta: number; movers: ItemMover[]; }

// Diff item-a-item DENTRO de cada conta. Só quando os dois snapshots têm o
// detalhe por conta (senão devolve null — o caller cai pro diff agregado).
// Contas ordenadas pelo tamanho do movimento; conta sem movimento não aparece.
export function diffItemsByChar(prev: WealthSnapshot, curr: WealthSnapshot): CharItemMovers[] | null {
  const a = prev.itemsByChar, b = curr.itemsByChar;
  if (!a || !b) return null;
  const chars = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: CharItemMovers[] = [];
  for (const char of chars) {
    const movers = diffSnaps(a[char] || {}, b[char] || {});
    if (!movers.length) continue;
    const delta = movers.reduce((s, m) => s + m.deltaValue, 0);
    out.push({ char, delta, movers });
  }
  return out.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

export interface CharMover { name: string; prev: number; curr: number; delta: number; deltaPct: number; }

// Fallback nível conta (sempre disponível: byChar existe em todo snapshot).
export function diffChars(prev: WealthSnapshot, curr: WealthSnapshot): CharMover[] {
  const names = new Set([...Object.keys(prev.byChar || {}), ...Object.keys(curr.byChar || {})]);
  const out: CharMover[] = [];
  for (const name of names) {
    const p = prev.byChar?.[name] || 0, c = curr.byChar?.[name] || 0;
    const delta = c - p;
    if (delta === 0) continue;
    out.push({ name, prev: p, curr: c, delta, deltaPct: p > 0 ? (delta / p) * 100 : 100 });
  }
  return out.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}
