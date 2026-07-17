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
