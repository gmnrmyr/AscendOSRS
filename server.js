import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001; // Different port from Vite

app.use(express.json({ limit: '50mb' })); // bancos grandes (milhares de itens × vários chars)

// API endpoints
const DUMP_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const PRICES_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';

// Your app name and contact - PLEASE REPLACE THESE
const APP_NAME = 'AscendOSRS';
const CONTACT = 'your@email.com'; // Replace with your contact info

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': `${APP_NAME} (${CONTACT})`,
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

app.post('/api/refresh-items', async (req, res) => {
  try {
    // Fetch items and prices in parallel
    const [items, priceData] = await Promise.all([
      fetchWithRetry(DUMP_URL),
      fetchWithRetry(PRICES_URL).then(data => data.data || {})
    ]);

    // Map to desired format with prices
    const mapped = items.map((item) => {
      const prices = priceData[item.id] || {};
      return {
        id: item.id,
        name: item.name,
        examine: item.examine || '',
        members: item.members || false,
        tradeable: item.tradeable || false,
        tradeable_on_ge: item.tradeable_on_ge || false,
        stackable: item.stackable || false,
        noted: item.noted || false,
        noteable: item.noteable || false,
        linked_id_item: item.linked_id_item,
        linked_id_noted: item.linked_id_noted,
        linked_id_placeholder: item.linked_id_placeholder,
        placeholder: item.placeholder || false,
        buy_limit: item.buy_limit || 0,
        high_alch: item.highalch || 0,
        low_alch: item.lowalch || 0,
        value: item.value || 0,
        current_price: prices.high || prices.low || 0,
        high_price: prices.high || 0,
        low_price: prices.low || 0,
        last_updated: new Date().toISOString(),
      };
    });

    // Sort by name for consistency
    mapped.sort((a, b) => a.name.localeCompare(b.name));

    // Create metadata
    const metadata = {
      last_updated: new Date().toISOString(),
      total_items: mapped.length,
      items_with_prices: Object.keys(priceData).length,
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };

    // Write files
    const publicDir = path.join(__dirname, 'public');
    await Promise.all([
      fs.writeFile(
        path.join(publicDir, 'osrs_items.json'),
        JSON.stringify(mapped, null, 2)
      ),
      fs.writeFile(
        path.join(publicDir, 'osrs_items_metadata.json'),
        JSON.stringify(metadata, null, 2)
      )
    ]);

    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error refreshing items:', error);
    res.status(500).json({ error: 'Failed to refresh items' });
  }
});

// ============================================================
//  Persistência local (local-first): salva o dashboard num arquivo
//  em disco no Mac (data/dashboard.json). Funciona igual de qualquer
//  origin (localhost ou IP da LAN) porque o proxy /api roda no Mac.
//  É a fonte de verdade; o localStorage do browser vira só cache.
// ============================================================
const DATA_DIR = path.join(__dirname, 'data');
const SAVE_FILE = path.join(DATA_DIR, 'dashboard.json');

app.get('/api/data', async (req, res) => {
  try {
    const raw = await fs.readFile(SAVE_FILE, 'utf-8');
    res.status(200).json(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(200).json(null); // ainda não salvou nada
    console.error('Erro lendo save:', err);
    res.status(500).json({ error: 'Failed to read save' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const payload = { ...req.body, savedAt: new Date().toISOString() };
    // escreve atômico: tmp + rename, pra não corromper se cair no meio
    const tmp = SAVE_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(payload, null, 2));
    await fs.rename(tmp, SAVE_FILE);
    res.status(200).json({ ok: true, savedAt: payload.savedAt });
  } catch (err) {
    console.error('Erro salvando save:', err);
    res.status(500).json({ error: 'Failed to write save' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});