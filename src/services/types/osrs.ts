
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

export interface ItemMapping {
  [key: string]: number;
}
