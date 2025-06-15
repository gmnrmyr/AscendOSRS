
export interface OSRSItem {
  id: number;
  name: string;
  examine?: string;
  members?: boolean;
  lowalch?: number;
  highalch?: number;
  limit?: number;
  value?: number;
  icon?: string;
  current_price?: number;
  today_trend?: 'positive' | 'negative' | 'neutral';
}

export interface OSRSPriceData {
  high: number;
  highTime: number;
  low: number;
  lowTime: number;
}

export interface OSRSSearchResult {
  id: string | number;
  name: string;
  subtitle?: string;
  icon?: string;
  value?: number;
  category?: string;
  current_price?: number;
  today_trend?: 'positive' | 'negative' | 'neutral';
}

export interface OSRSMoneyMakingMethod {
  id: string;
  name: string;
  category: string;
  gpPerHour: number;
  requirements: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

export interface MoneyMakingGuide {
  name: string;
  profit: number;
  difficulty: number;
  requirements: string[];
  description: string;
  category: string;
  membership: 'f2p' | 'p2p';
}

export interface PlayerStats {
  name: string;
  combat_level: number;
  total_level: number;
  account_type: 'regular' | 'ironman' | 'hardcore' | 'ultimate';
}

export interface ItemMapping {
  [key: string]: number;
}
