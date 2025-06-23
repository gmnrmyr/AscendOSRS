
// Popular OSRS items for quick search
export const popularItems = [
  { id: 995, name: "Coins", current_price: 1, icon: "https://oldschool.runescape.wiki/images/1/10/Coins_10000.png" },
  { id: 13190, name: "Platinum token", current_price: 1000, icon: "https://oldschool.runescape.wiki/images/0/05/Platinum_token.png" },
  { id: 2434, name: "Prayer potion(4)", current_price: 12000, icon: "https://oldschool.runescape.wiki/images/4/42/Prayer_potion%284%29.png" },
  { id: 12695, name: "Super combat potion(4)", current_price: 15000, icon: "https://oldschool.runescape.wiki/images/4/48/Super_combat_potion%284%29.png" },
  { id: 2444, name: "Ranging potion(4)", current_price: 8000, icon: "https://oldschool.runescape.wiki/images/6/6b/Ranging_potion%284%29.png" },
  { id: 3040, name: "Magic potion(4)", current_price: 1200, icon: "https://oldschool.runescape.wiki/images/1/14/Magic_potion%284%29.png" },
  { id: 139, name: "Tunas", current_price: 150, icon: "https://oldschool.runescape.wiki/images/0/0a/Tuna.png" },
  { id: 385, name: "Shark", current_price: 800, icon: "https://oldschool.runescape.wiki/images/b/ba/Shark.png" },
  { id: 4151, name: "Abyssal whip", current_price: 1800000, icon: "https://oldschool.runescape.wiki/images/4/44/Abyssal_whip.png" },
  { id: 11802, name: "Barrows gloves", current_price: 130000, icon: "https://oldschool.runescape.wiki/images/f/f4/Barrows_gloves.png" }
];

// Item name mappings for search
export const itemNameMappings: Record<string, string[]> = {
  "coins": ["gp", "gold", "money", "cash"],
  "platinum token": ["plat", "platinum", "plat token"],
  "prayer potion(4)": ["ppot", "prayer pot", "prayer"],
  "super combat potion(4)": ["super combat", "scb", "combat pot"],
  "ranging potion(4)": ["range pot", "ranging", "rpot"],
  "magic potion(4)": ["magic pot", "mpot", "magic"],
  "shark": ["food", "sharks"],
  "tuna": ["food", "tunas"],
  "abyssal whip": ["whip", "abby whip"],
  "barrows gloves": ["b gloves", "rfd gloves"]
};

// Price mappings for common items (fallback prices)
export const priceMapping: Record<string, number> = {
  "coins": 1,
  "platinum token": 1000,
  "prayer potion(4)": 12000,
  "super combat potion(4)": 15000,
  "ranging potion(4)": 8000,
  "magic potion(4)": 1200,
  "shark": 800,
  "tuna": 150,
  "abyssal whip": 1800000,
  "barrows gloves": 130000,
  "dragon dagger": 17000,
  "rune scimitar": 15000,
  "black mask": 900000,
  "dragon boots": 180000,
  "fighter torso": 0,
  "fire cape": 0,
  "dragon defender": 0,
  "rune pouch": 1200000
};

export const getItemPrice = (itemName: string): number => {
  const normalizedName = itemName.toLowerCase();
  
  // Direct match
  if (priceMapping[normalizedName]) {
    return priceMapping[normalizedName];
  }
  
  // Check mappings for alternative names
  for (const [mainName, alternatives] of Object.entries(itemNameMappings)) {
    if (alternatives.some(alt => normalizedName.includes(alt.toLowerCase()))) {
      return priceMapping[mainName] || 0;
    }
  }
  
  return 0;
};
