
export interface OSRSItem {
  pageId: number;
  title: string;
  imageUrl: string | null;
  extract: string | null;
  id?: number;
  name?: string;
  current_price?: number;
  today_trend?: string;
  icon?: string;
}

export interface MoneyMakingGuide {
  id: string;
  name: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  requirements: string | string[];
  notes: string;
  profit?: number;
  difficulty?: string | number;
  description?: string;
  membership?: boolean | 'f2p' | 'p2p';
}

export interface PlayerStats {
  combat_level: number;
  total_level: number;
  account_type: string;
  username?: string;
}
