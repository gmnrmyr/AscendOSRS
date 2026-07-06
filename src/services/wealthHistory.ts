// Histórico de riqueza total (soma de todos os bancos ao longo do tempo).
// Local-first: os snapshots viajam junto com o dashboard no /api/data (disco no Mac),
// então sobrevivem a limpar cache do browser e são compartilhados entre origins (LAN).
// 1 ponto por dia (upsert por data) — o último valor do dia sobrescreve o anterior.

import type { Character, BankItem } from '@/hooks/useAppData';

export interface WealthSnapshot {
  date: string;   // YYYY-MM-DD (chave de dedup por dia)
  ts: string;     // ISO do momento em que foi carimbado
  total: number;  // riqueza somada de todas as contas (gp)
  byChar: Record<string, number>; // riqueza por conta (gp)
}

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
  const snap: WealthSnapshot = { date, ts: now.toISOString(), total, byChar };
  const rest = hist.filter((s) => s.date !== date);
  return [...rest, snap].sort((a, b) => a.date.localeCompare(b.date));
}
