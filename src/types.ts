
export interface OSRSItem {
  pageId: number;
  title: string;
  imageUrl: string | null;
  extract: string | null;
}

export interface MoneyMakingGuide {
  id: string;
  name: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  requirements: string;
  notes: string;
  profit?: number;
  difficulty?: string;
  description?: string;
  membership?: boolean;
}

export interface PlayerStats {
  combat_level: number;
  total_level: number;
  account_type: string;
  username?: string;
}
