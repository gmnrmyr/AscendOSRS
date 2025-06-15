
export function getItemIcon(itemName: string): string {
  const cleanName = itemName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
  return `https://oldschool.runescape.wiki/images/${encodeURIComponent(cleanName)}_detail.png`;
}

export function generateFallbackIcon(itemName: string): string {
  // Alternative icon sources as fallbacks
  const alternatives = [
    `https://oldschool.runescape.wiki/images/${encodeURIComponent(itemName.replace(/\s+/g, '_'))}.png`,
    `https://oldschool.runescape.wiki/w/images/${encodeURIComponent(itemName.replace(/\s+/g, '_'))}_icon.png`
  ];
  
  return alternatives[0]; // Return first alternative for now
}
