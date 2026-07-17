// Parse do news RSS oficial do OSRS (Jagex) -> lista compacta de updates.
// Módulo separado do server.js de propósito: dá pra testar em node isolado
// sem subir o express (a porta 3001 é do server vivo).

// Entidades comuns do feed (é RSS 2.0 simples, sem CDATA garantido).
function decodeXml(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// XML -> [{date: YYYY-MM-DD, title, summary, category, link}], mais novo
// primeiro (ordem do feed). Item sem título ou link é pulado. Lança se o
// layout mudar a ponto de zerar o parse (o caller decide servir cache velho).
export function parseNewsRss(xml) {
  const updates = [];
  for (const block of String(xml).split('<item>').slice(1)) {
    const pick = (tag) => (block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1] || '';
    const title = decodeXml(pick('title'));
    const link = pick('link').trim();
    if (!title || !link) continue;
    const pub = Date.parse(pick('pubDate'));
    updates.push({
      date: Number.isFinite(pub) ? new Date(pub).toISOString().slice(0, 10) : '',
      title,
      summary: decodeXml(pick('description')),
      category: decodeXml(pick('category')),
      link,
    });
  }
  if (updates.length === 0) throw new Error('news parse: 0 itens (layout do RSS mudou?)');
  return updates;
}
