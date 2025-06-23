
export interface OSRSItem {
  id: number;
  name: string;
  icon: string;
  value: number;
  high: number;
  low: number;
  current_price?: number;
  today_trend?: string;
}

export interface MoneyMakingGuide {
  id: string;
  name: string;
  profit: number;
  skill: string;
  requirements: string[];
  description: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  membership: 'f2p' | 'p2p';
}

export interface PlayerStats {
  total: number;
  attack: number;
  defence: number;
  strength: number;
  hitpoints: number;
  ranged: number;
  prayer: number;
  magic: number;
  cooking: number;
  woodcutting: number;
  fletching: number;
  fishing: number;
  firemaking: number;
  crafting: number;
  smithing: number;
  mining: number;
  herblore: number;
  agility: number;
  thieving: number;
  slayer: number;
  farming: number;
  runecraft: number;
  hunter: number;
  construction: number;
  combat_level: number;
  total_level: number;
  account_type: 'regular' | 'ironman' | 'hardcore' | 'ultimate';
  name: string;
}

export interface BankItem {
  name: string;
  quantity: number;
  value: number;
}
