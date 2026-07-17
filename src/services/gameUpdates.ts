// Game updates do OSRS sintetizados (F3 do roadmap): o server parseia o news
// RSS oficial e serve /api/game-updates (cache 10 min lá). Aqui: fetch com
// falha SILENCIOSA (offline → lista vazia, o card some e nada quebra) +
// heurística de quais updates podem mexer com preços no GE.

export interface GameUpdate {
  date: string;         // YYYY-MM-DD
  title: string;
  summary: string;      // 1 linha, direto do feed
  category: string;     // "Game Updates", "Community", "Behind The Scenes"...
  link: string;
  priceImpact: boolean; // pode mexer no GE (heurística por palavra-chave)
}

// O que historicamente move preço: conteúdo novo entrando no jogo (item/boss/
// raid/quest cria demanda ou derruba drop antigo), mudança de drop/loot/reward
// e mexida direta no GE/economia. É um FAROL, não um veredito — falso positivo
// é aceitável, o badge só chama atenção pro flipper olhar.
const PRICE_WORDS =
  /grand exchange|\bge\b|drop|loot|reward|new item|\bitems?\b|boss|raid|slayer|quest|\bskills?\b|\blaunch(es|ed)?\b|release|tradeable|econom|wilderness|nerf|buff/i;

export function flagPriceImpact(title: string, summary: string): boolean {
  return PRICE_WORDS.test(`${title} ${summary}`);
}

const CACHE_MS = 10 * 60 * 1000; // espelha o cache do server
let cache: { at: number; data: GameUpdate[] } | null = null;

export async function fetchGameUpdates(): Promise<GameUpdate[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  try {
    const r = await fetch('/api/game-updates');
    if (!r.ok) return cache?.data ?? [];
    const j = await r.json();
    const list: GameUpdate[] = (Array.isArray(j?.updates) ? j.updates : [])
      .map((u: Record<string, string>) => ({
        date: u.date || '',
        title: u.title || '',
        summary: u.summary || '',
        category: u.category || '',
        link: u.link || '',
        priceImpact: flagPriceImpact(u.title || '', u.summary || ''),
      }))
      .filter((u: GameUpdate) => u.title && u.link);
    cache = { at: Date.now(), data: list };
    return list;
  } catch {
    return cache?.data ?? []; // offline: silêncio
  }
}
