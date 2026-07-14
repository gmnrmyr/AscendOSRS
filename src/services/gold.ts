// Ouro "líquido" do save — regra ÚNICA usada por Goals e Summary, pra os
// toggles (Runite como gold / só conta principal) valerem no app inteiro.
//
// Coins + platinum tokens sempre contam. Runite bars são o caso especial:
// stack grande (>200 barras) é estoque de venda rápida e PODE contar como
// gold via toggle salvo nas settings (settings.runiteAsGold). Stack pequena
// nunca conta — é material de uso, não liquidez.
import { COINS_ID, PLAT_TOKEN_ID } from './priceEngine';

export const RUNITE_BAR_ID = 2363;
// A partir de quantas barras a stack vira "liquidez" (e o toggle aparece na UI).
export const RUNITE_GOLD_MIN_QTY = 200;

interface ItemLike {
  osrsId?: number;
  name?: string;
  quantity?: number;
  estimatedPrice?: number;
}

const isCoins = (it: ItemLike) =>
  it.osrsId === COINS_ID || (it.name || '').toLowerCase().includes('coin');
const isPlat = (it: ItemLike) =>
  it.osrsId === PLAT_TOKEN_ID || (it.name || '').toLowerCase().includes('platinum');
const isBigRunite = (it: ItemLike) =>
  (it.osrsId === RUNITE_BAR_ID || (it.name || '').toLowerCase() === 'runite bar') &&
  (it.quantity || 0) > RUNITE_GOLD_MIN_QTY;

// Gold líquido de UMA lista de itens (um banco).
export function goldOfItems(items: ItemLike[] | undefined, runiteAsGold: boolean): number {
  return (items || []).reduce((s, it) => {
    const q = it.quantity || 0;
    if (isCoins(it)) return s + q;
    if (isPlat(it)) return s + q * 1000;
    if (runiteAsGold && isBigRunite(it)) return s + q * (it.estimatedPrice || 0);
    return s;
  }, 0);
}

// Stacks de Runite grandes o bastante pra habilitar o toggle, por conta.
export function bigRuniteStacks(
  bankData: Record<string, ItemLike[]>,
): { char: string; qty: number; value: number }[] {
  const out: { char: string; qty: number; value: number }[] = [];
  for (const [char, items] of Object.entries(bankData || {})) {
    for (const it of items || []) {
      if (isBigRunite(it)) {
        out.push({ char, qty: it.quantity || 0, value: (it.quantity || 0) * (it.estimatedPrice || 0) });
      }
    }
  }
  return out.sort((a, b) => b.value - a.value);
}

// Conta principal = maior valor de banco (mesma detecção que a aba Goals usa).
export function mainAccount(bankData: Record<string, ItemLike[]>): string {
  let mainName = '';
  let mainVal = -1;
  for (const [name, items] of Object.entries(bankData || {})) {
    const bv = (items || []).reduce(
      (s, it) => s + Math.floor(it.quantity || 0) * (it.estimatedPrice || 0),
      0,
    );
    if (bv > mainVal) { mainVal = bv; mainName = name; }
  }
  return mainName;
}

// Gold disponível respeitando os DOIS toggles — a função que todo mundo chama.
export function availableGold(
  bankData: Record<string, ItemLike[]>,
  settings: { runiteAsGold: boolean; goldMainOnly: boolean },
): number {
  if (settings.goldMainOnly) {
    const main = mainAccount(bankData);
    return goldOfItems(bankData?.[main], settings.runiteAsGold);
  }
  return Object.values(bankData || {}).reduce(
    (t, items) => t + goldOfItems(items, settings.runiteAsGold),
    0,
  );
}
