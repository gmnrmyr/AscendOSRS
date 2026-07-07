// Gera src/data/itemMappings.json portando o ItemMapping do RuneLite.
//
// O RuneLite precifica itens UNTRADEABLES (id fora do GE) mapeando pro(s)
// equivalente(s) tradeable(s) — ex: Sanguinesti staff -> uncharged,
// Ferocious gloves -> Hydra leather, Archers ring (i) -> Archers ring.
// Essa tabela vive em ItemMapping.java + item_variations.json e usa as
// constantes do gameval ItemID.java. Este script baixa as 3 fontes do
// GitHub do RuneLite, resolve tudo pra ids numéricos e emite:
//
//   { "<untradeableId>": [[tradeableId, qty], ...], ... }
//
// Rodar de novo quando o RuneLite atualizar a tabela:
//   node scripts/generate-item-mappings.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAW = 'https://raw.githubusercontent.com/runelite/runelite/master';
const SOURCES = {
  mapping: `${RAW}/runelite-client/src/main/java/net/runelite/client/game/ItemMapping.java`,
  variations: `${RAW}/runelite-client/src/main/resources/item_variations.json`,
  itemIds: `${RAW}/runelite-api/src/main/java/net/runelite/api/gameval/ItemID.java`,
};

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

console.log('Baixando fontes do RuneLite...');
const [mappingJava, variationsJson, itemIdJava] = await Promise.all(
  Object.values(SOURCES).map(get)
);

// 1. ItemID.java -> { CONST: id }
//    CUIDADO: o arquivo tem classes aninhadas Cert (ids noted) e Placeholder
//    com os MESMOS nomes de constantes — só a classe principal vale aqui.
const certStart = itemIdJava.indexOf('public static final class Cert');
const placeholderStart = itemIdJava.indexOf('public static final class Placeholder');
const mainBody = itemIdJava.slice(0, certStart);
const certBody = itemIdJava.slice(certStart, placeholderStart);
const constToId = new Map();
for (const m of mainBody.matchAll(/public static final int (\w+) = (\d+);/g)) {
  constToId.set(m[1], Number(m[2]));
}
console.log(`ItemID: ${constToId.size} constantes (classe principal)`);

// 1b. Classe Cert -> mapa noted -> unnoted (Cert.X é o id noted do item X)
const notedToBase = {};
for (const m of certBody.matchAll(/public static final int (\w+) = (\d+);/g)) {
  const base = constToId.get(m[1]);
  if (base != null) notedToBase[Number(m[2])] = base;
}
console.log(`Cert: ${Object.keys(notedToBase).length} pares noted->unnoted`);

// 2. item_variations.json -> map(id)=base, variations(base)=grupo inteiro
const variations = JSON.parse(variationsJson);
const toBase = new Map();      // variação -> base (1º do grupo)
const groupOf = new Map();     // base -> grupo inteiro (incluindo o base)
for (const group of Object.values(variations)) {
  const base = group[0];
  groupOf.set(base, group);
  for (const id of group.slice(1)) toBase.set(id, base);
}
console.log(`Variations: ${groupOf.size} grupos`);

// 3. ItemMapping.java -> entradas do enum
//    Formas do construtor:
//      (tradeable, ...untradeables)
//      (tradeable, qtyL, ...untradeables)
//      (tradeable, includeVariations, qtyL, ...untradeables)
const enumBody = mappingJava.slice(
  mappingJava.indexOf('public enum ItemMapping'),
  mappingJava.indexOf('@VisibleForTesting')
);
const entries = [];
for (const m of enumBody.matchAll(/ITEM_\w+\(([^)]+)\)/g)) {
  const tokens = m[1].split(',').map((t) => t.trim());
  let i = 0;
  const resolve = (tok) => {
    const name = tok.replace(/^ItemID\./, '');
    if (!constToId.has(name)) throw new Error(`constante desconhecida: ${tok}`);
    return constToId.get(name);
  };
  const tradeable = resolve(tokens[i++]);
  let includeVariations = false;
  let qty = 1;
  if (tokens[i] === 'true' || tokens[i] === 'false') {
    includeVariations = tokens[i++] === 'true';
  }
  if (/^\d+L$/.test(tokens[i])) {
    qty = Number(tokens[i++].slice(0, -1));
  }
  const untradeables = tokens.slice(i).map(resolve);
  entries.push({ tradeable, includeVariations, qty, untradeables });
}
console.log(`ItemMapping: ${entries.length} entradas do enum`);

// 4. Replica o static{} do ItemMapping.java: multimap untradeableId -> mappings
const out = {}; // id -> [[tradeable, qty], ...]
const put = (id, tradeable, qty) => {
  (out[id] ??= []).push([tradeable, qty]);
};
for (const e of entries) {
  for (const itemId of e.untradeables) {
    if (e.includeVariations) {
      const base = toBase.get(itemId) ?? itemId;
      const group = groupOf.get(base) ?? [itemId];
      for (const variation of group) {
        if (variation !== e.tradeable) put(variation, e.tradeable, e.qty);
      }
    } else {
      put(itemId, e.tradeable, e.qty);
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../src/data');
fs.mkdirSync(dataDir, { recursive: true });

const write = (file, data, label) => {
  const p = path.join(dataDir, file);
  fs.writeFileSync(p, JSON.stringify(data));
  const kb = (fs.statSync(p).size / 1024).toFixed(1);
  console.log(`OK: ${label} -> ${p} (${kb} KB)`);
};
write('itemMappings.json', out, `${Object.keys(out).length} ids untradeable mapeados`);
write('notedItems.json', notedToBase, `${Object.keys(notedToBase).length} pares noted->unnoted`);
