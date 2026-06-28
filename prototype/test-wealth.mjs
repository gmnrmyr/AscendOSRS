import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildPriceMap, valueBank, fmt } from './price-engine.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const load = (f) => JSON.parse(readFileSync(join(__dir, 'fixtures', f), 'utf8'));

const chars = [
  { name: 'Char 1', bank: load('char1_bank.json') },
  { name: 'Char 2', bank: load('char2_bank.json') },
];

console.log('Buscando preços ao vivo da OSRS Wiki...');
const { priceById, mappingCount, liveCount } = await buildPriceMap();
console.log(`Mapping: ${mappingCount} itens | Preços ao vivo: ${liveCount}\n`);

let grand = 0;
for (const c of chars) {
  const { total, unpriced, lines } = valueBank(c.bank, priceById);
  grand += total;
  console.log(`=== ${c.name} — ${fmt(total)} gp (${total.toLocaleString()}) ===`);
  console.log(`  ${c.bank.length} itens | ${unpriced.length} sem preço de GE (untradeable)`);
  console.log('  Top 8 por valor:');
  for (const l of lines.slice(0, 8)) {
    console.log(`   - ${l.name.replace(' (Members)', '').padEnd(34)} ${String(l.quantity).padStart(10)} x ${fmt(l.unit).padStart(8)} = ${fmt(l.value)}`);
  }
  console.log('');
}

console.log('================================================');
console.log(`PATRIMÔNIO TOTAL (${chars.length} chars): ${fmt(grand)} gp  =  ${grand.toLocaleString()} gp`);
console.log('================================================');
