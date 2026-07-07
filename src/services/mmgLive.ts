// Profit ao vivo dos money making methods — via /api/mmg (server parseia a
// página-índice "Money making guide" da OSRS Wiki, que é recalculada com
// preço de GE ao vivo).
//
// O matching nome-do-app -> guia da Wiki é DELIBERADAMENTE conservador:
// só casa se TODOS os tokens significativos do método do app aparecem no nome
// da guia, e exige pelo menos 2 tokens (1 token só, tipo "rune", é ambíguo
// demais — nesse caso o método mantém o gp/hr manual). Match errado seria
// pior que não ter match: corromperia silenciosamente o gp/hr do Gui.

export interface WikiMethod {
  slug: string;
  name: string;
  profit: number;
}

// Verbos/ruído das guias ("Killing brutal black dragons" -> {brutal, black, dragons})
const STOP_WORDS = new Set([
  'killing', 'making', 'crafting', 'smithing', 'cooking', 'fletching', 'mining',
  'tanning', 'casting', 'collecting', 'buying', 'claiming', 'creating', 'hunting',
  'catching', 'chopping', 'cutting', 'running', 'farming', 'filling', 'grinding',
  'charging', 'stringing', 'mixing', 'enchanting', 'opening', 'selling',
  'exchanging', 'completing', 'looting', 'pickpocketing', 'stealing',
  'the', 'a', 'an', 'of', 'at', 'in', 'and', 'with', 'from', 'items', 'item',
  'f2p', 'p2p', 'guide', 'method',
]);

// Parênteses NÃO são descartados: "(off-task)" vs "(on-task)" muda o profit —
// viram tokens normais e impedem match cruzado.
const tokenize = (s: string): Set<string> =>
  new Set(
    (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .map((t) => (t.endsWith('s') && t.length > 3 ? t.slice(0, -1) : t)) // plural simples
      .filter((t) => t && !STOP_WORDS.has(t))
  );

export async function fetchWikiMethods(): Promise<WikiMethod[]> {
  const res = await fetch('/api/mmg');
  if (!res.ok) throw new Error(`/api/mmg -> HTTP ${res.status}`);
  const j = await res.json();
  return Array.isArray(j?.methods) ? j.methods : [];
}

const setEquals = (a: Set<string>, b: Set<string>) => {
  if (a.size !== b.size) return false;
  for (const t of a) if (!b.has(t)) return false;
  return true;
};

export function matchWikiMethod(appMethodName: string, wiki: WikiMethod[]): WikiMethod | null {
  const want = tokenize(appMethodName);
  if (want.size === 0) return null;

  let best: WikiMethod | null = null;
  let bestExtra = Infinity;
  let variant: WikiMethod | null = null; // guias "Base (variante)" cujo base == nome do app

  for (const w of wiki) {
    const have = tokenize(w.name);
    let all = true;
    for (const t of want) if (!have.has(t)) { all = false; break; }

    if (all) {
      const extra = have.size - want.size; // menos sobra = guia mais específica pro nome
      // 1 token só ("rune") é ambíguo: aceito SOMENTE em match exato de conjunto (extra 0).
      if (want.size >= 2 || extra === 0) {
        if (extra < bestExtra || (extra === bestExtra && best && w.profit > best.profit)) {
          best = w;
          bestExtra = extra;
        }
        continue;
      }
    }

    // Variantes: "Killing Vorkath (Dragon hunter lance)" pra método "Vorkath".
    // Se a base da guia (sem o parêntese) é EXATAMENTE o nome do app, é variante
    // do mesmo método — assume best gear e fica com a de maior profit.
    const haveBase = tokenize(w.name.replace(/\(.*?\)/g, ' '));
    if (setEquals(want, haveBase) && (!variant || w.profit > variant.profit)) {
      variant = w;
    }
  }

  return best ?? variant;
}
