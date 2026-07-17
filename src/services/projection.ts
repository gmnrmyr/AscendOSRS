// Projeção "expected vs reality": quanto a riqueza DEVERIA crescer por dia se
// os métodos ativos rodassem nas horas planejadas. Método ativo segue a mesma
// convenção do Summary (m.isActive === true). Horas: da conta do método
// (character.hoursPerDay) com fallback pra global.

import type { Character, MoneyMethod } from '@/hooks/useAppData';

export interface ProjectionRate {
  gpDay: number;  // ganho esperado por dia somando todas as contas (gp)
  gpHour: number; // soma dos gp/h dos métodos ativos (converte ganho real em horas de farm)
  byChar: Record<string, number>; // ganho esperado por dia, por conta
}

export function projectionRate(
  characters: Character[],
  methods: MoneyMethod[],
  globalHours: number,
): ProjectionRate {
  const byChar: Record<string, number> = {};
  let gpDay = 0;
  let gpHour = 0;
  for (const m of methods || []) {
    if (m?.isActive !== true) continue;
    const gph = m.gpHour || 0;
    if (gph <= 0) continue;
    const charName = m.character && m.character !== 'none' ? m.character : '';
    const char = charName ? characters.find((c) => c.name === charName) : undefined;
    const hours = char?.hoursPerDay ?? globalHours;
    const day = gph * hours;
    gpHour += gph;
    gpDay += day;
    const key = charName || 'Sem conta';
    byChar[key] = (byChar[key] || 0) + day;
  }
  return { gpDay, gpHour, byChar };
}

// Dias (com fração) entre duas datas YYYY-MM-DD.
export function daysBetween(a: string, b: string): number {
  return (Date.parse(b) - Date.parse(a)) / 86_400_000;
}

// ---- Bonds: cronograma de renovação por conta ----

export const BOND_ID = 13190;   // Old school bond (GE, tradeable)
export const BOND_DAYS = 14;    // 1 bond = 14 dias de members

// YYYY-MM-DD deslocado n dias (aritmética em UTC, coerente com daysBetween).
export function addDays(iso: string, n: number): string {
  const d = new Date(Date.parse(iso) + n * 86_400_000);
  return d.toISOString().slice(0, 10);
}

// YYYY-MM-DD de hoje em horário LOCAL (mesma convenção do wealthHistory).
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface BondPurchase { date: string; char: string; }

// Compras de bond necessárias no intervalo [from, until], por conta com
// bondExpiresAt (= conta members que renova com bond). Bond já vencido
// antes de `from` gera compra imediata em `from` (a conta está sem members).
// Ordenado por data.
export function bondSchedule(
  characters: Character[],
  from: string,
  until: string,
): BondPurchase[] {
  const out: BondPurchase[] = [];
  for (const c of characters) {
    if (!c.bondExpiresAt) continue;
    let next = c.bondExpiresAt < from ? from : c.bondExpiresAt;
    while (next <= until) {
      out.push({ date: next, char: c.name });
      next = addDays(next, BOND_DAYS);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.char.localeCompare(b.char));
}
