
import { ItemMapping } from '../types/osrs';

export const ITEM_ID_MAP: ItemMapping = {
  // Weapons
  'twisted bow': 20997,
  'scythe of vitur': 22325,
  'dragon claws': 13652,
  'armadyl crossbow': 11785,
  'dragon hunter crossbow': 21012,
  'blowpipe': 12926,
  'toxic blowpipe': 12926,
  'abyssal whip': 4151,
  'tentacle whip': 12006,
  'abyssal tentacle': 12006,
  
  // Armor
  'bandos chestplate': 11832,
  'bandos tassets': 11834,
  'armadyl chestplate': 11828,
  'armadyl chainskirt': 11830,
  'justiciar faceguard': 22326,
  'justiciar chestguard': 22327,
  'justiciar legguards': 22328,
  
  // Boots
  'primordial boots': 13239,
  'pegasian boots': 13237,
  'eternal boots': 13235,
  'guardian boots': 23037,
  
  // Shields/Defenders
  'avernic defender': 22322,
  'dragon defender': 12954,
  'dragonfire shield': 11284,
  'anti-dragon shield': 1540,
  
  // Rings/Amulets
  'berserker ring (i)': 11773,
  'archers ring (i)': 11771,
  'seers ring (i)': 11770,
  'warriors ring (i)': 11772,
  'amulet of fury': 6585,
  'amulet of torture': 19553,
  'necklace of anguish': 19547,
  'occult necklace': 12002,
  
  // Prayer scrolls
  'prayer scroll (rigour)': 21034,
  'prayer scroll (augury)': 21079,
  
  // Consumables
  'old school bond': 13190,
  'super combat potion(4)': 12695,
  'ranging potion(4)': 2444,
  'magic potion(4)': 3040,
  'stamina potion(4)': 12625,
  
  // Popular items
  'dragon bones': 536,
  'superior dragon bones': 22124,
  'big bones': 532,
  'zulrah scales': 12934,
  'coal': 453,
  'gold ore': 444,
  'yew logs': 1515,
  'magic logs': 1513,
  'rune ore': 451,
  'adamant ore': 449,
  'mithril ore': 447,
  'iron ore': 440,
  'tin ore': 438,
  'copper ore': 436,
  
  // Runes
  'nature rune': 561,
  'law rune': 563,
  'death rune': 560,
  'blood rune': 565,
  'soul rune': 566,
  'astral rune': 9075,
  'cosmic rune': 564,
  'chaos rune': 562,
  
  // Seeds
  'ranarr seed': 5295,
  'snapdragon seed': 5300,
  'torstol seed': 5304,
  'palm tree seed': 5289,
  'yew seed': 5315,
  'magic seed': 5316,
  
  // Herbs
  'ranarr weed': 207,
  'snapdragon': 3000,
  'torstol': 219,
  'dwarf weed': 217,
  'lantadyme': 2481,
  'cadantine': 215,
  
  // Ores/Bars
  'runite ore': 451,
  'runite bar': 2363,
  'adamantite ore': 449,
  'adamantite bar': 2361,
  'mithril ore': 447,
  'mithril bar': 2359,
  'steel bar': 2353,
  'iron bar': 2351,
  
  // Food
  'shark': 385,
  'monkfish': 7946,
  'karambwan': 3142,
  'manta ray': 391,
  'anglerfish': 13441,
  'dark crab': 11934,
  
  // Potions
  'prayer potion(4)': 2434,
  'super restore(4)': 3024,
  'antifire potion(4)': 2452,
  'extended antifire(4)': 21987,
  'saradomin brew(4)': 6685,
  
  // Gems
  'uncut diamond': 1617,
  'uncut ruby': 1619,
  'uncut emerald': 1621,
  'uncut sapphire': 1623,
  'diamond': 1601,
  'ruby': 1603,
  'emerald': 1605,
  'sapphire': 1607,
  
  // Noted versions (some commonly traded)
  'shark (noted)': 386,
  'monkfish (noted)': 7947,
  'prayer potion(4) (noted)': 2435,
  'super combat potion(4) (noted)': 12696
};

export function getItemIdByName(itemName: string): number | undefined {
  const cleanName = itemName.toLowerCase().trim();
  
  // Direct match
  if (ITEM_ID_MAP[cleanName]) {
    return ITEM_ID_MAP[cleanName];
  }
  
  // Partial match for similar names
  for (const [mappedName, id] of Object.entries(ITEM_ID_MAP)) {
    if (mappedName.includes(cleanName) || cleanName.includes(mappedName)) {
      console.log(`Found partial match: "${cleanName}" -> "${mappedName}" (${id})`);
      return id;
    }
  }
  
  console.log(`No item ID mapping found for: "${cleanName}"`);
  return undefined;
}
