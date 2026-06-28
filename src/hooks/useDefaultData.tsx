
interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
  isActive: boolean;
  platTokens?: number;
}

interface MoneyMethod {
  id: string;
  name: string;
  character: string;
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  requirements: string;
  notes: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
}

interface PurchaseGoal {
  id: string;
  name: string;
  currentPrice: number;
  targetPrice?: number;
  quantity: number;
  priority: 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-';
  category: 'gear' | 'consumables' | 'materials' | 'other';
  notes: string;
  imageUrl?: string;
}

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

export const getDefaultCharacters = (): Character[] => [
  {
    id: "1",
    name: "Lazy Priest",
    type: "main" as const,
    combatLevel: 3,
    totalLevel: 32,
    bank: 0,
    notes: "Main — bank importado do RuneLite Data Exporter",
    isActive: true,
    platTokens: 0
  },
  {
    id: "2",
    name: "CafeEcigarro",
    type: "alt" as const,
    combatLevel: 3,
    totalLevel: 32,
    bank: 0,
    notes: "Alt",
    isActive: true,
    platTokens: 0
  },
  {
    id: "3",
    name: "Lazy Wyverns",
    type: "alt" as const,
    combatLevel: 3,
    totalLevel: 32,
    bank: 0,
    notes: "Alt",
    isActive: true,
    platTokens: 0
  },
  {
    id: "4",
    name: "Lazy Jr",
    type: "alt" as const,
    combatLevel: 3,
    totalLevel: 32,
    bank: 0,
    notes: "Alt",
    isActive: true,
    platTokens: 0
  }
];

export const getDefaultMoneyMethods = (): MoneyMethod[] => [];

export const getDefaultPurchaseGoals = (): PurchaseGoal[] => [
  // S+ Tier - Ultimate Goals
  {
    id: "1",
    name: "Twisted Bow",
    currentPrice: 1200000000,
    targetPrice: 1100000000,
    quantity: 1,
    priority: "S+" as const,
    category: "gear" as const,
    notes: "Essential for high-level PvM",
    imageUrl: ""
  },
  {
    id: "2", 
    name: "Scythe of Vitur",
    currentPrice: 800000000,
    targetPrice: 750000000,
    quantity: 1,
    priority: "S+" as const,
    category: "gear" as const,
    notes: "For Theatre of Blood",
    imageUrl: ""
  },
  
  // S Tier - High Priority
  {
    id: "3",
    name: "Avernic Defender",
    currentPrice: 150000000,
    targetPrice: 140000000,
    quantity: 1,
    priority: "S" as const,
    category: "gear" as const,
    notes: "Best in slot melee defender",
    imageUrl: ""
  },
  {
    id: "4",
    name: "Dragon Hunter Crossbow",
    currentPrice: 120000000,
    targetPrice: 110000000,
    quantity: 1,
    priority: "S" as const,
    category: "gear" as const,
    notes: "Essential for dragon slayer tasks",
    imageUrl: ""
  },
  
  // A+ Tier - Very High Priority
  {
    id: "5",
    name: "Primordial Boots",
    currentPrice: 32000000,
    targetPrice: 30000000,
    quantity: 1,
    priority: "A+" as const,
    category: "gear" as const,
    notes: "Best in slot melee boots",
    imageUrl: ""
  },
  {
    id: "6",
    name: "Pegasian Boots",
    currentPrice: 38000000,
    targetPrice: 35000000,
    quantity: 1,
    priority: "A+" as const,
    category: "gear" as const,
    notes: "Best in slot ranged boots",
    imageUrl: ""
  },
  {
    id: "7",
    name: "Prayer Scroll (Rigour)",
    currentPrice: 45000000,
    targetPrice: 42000000,
    quantity: 1,
    priority: "A+" as const,
    category: "other" as const,
    notes: "Essential prayer for ranged combat",
    imageUrl: ""
  },
  
  // A Tier - High Priority
  {
    id: "8",
    name: "Dragon Claws",
    currentPrice: 150000000,
    targetPrice: 140000000,
    quantity: 1,
    priority: "A" as const,
    category: "gear" as const,
    notes: "PvP and some PvM content",
    imageUrl: ""
  },
  {
    id: "9",
    name: "Bandos Chestplate",
    currentPrice: 25000000,
    targetPrice: 23000000,
    quantity: 1,
    priority: "A" as const,
    category: "gear" as const,
    notes: "Best in slot melee body",
    imageUrl: ""
  },
  {
    id: "10",
    name: "Bandos Tassets",
    currentPrice: 28000000,
    targetPrice: 26000000,
    quantity: 1,
    priority: "A" as const,
    category: "gear" as const,
    notes: "Best in slot melee legs",
    imageUrl: ""
  },
  {
    id: "11",
    name: "Armadyl Chestplate",
    currentPrice: 35000000,
    targetPrice: 32000000,
    quantity: 1,
    priority: "A" as const,
    category: "gear" as const,
    notes: "Best in slot ranged body",
    imageUrl: ""
  },
  {
    id: "12",
    name: "Prayer Scroll (Augury)",
    currentPrice: 25000000,
    targetPrice: 23000000,
    quantity: 1,
    priority: "A" as const,
    category: "other" as const,
    notes: "Essential prayer for magic combat",
    imageUrl: ""
  },
  
  // A- Tier - Medium-High Priority
  {
    id: "13",
    name: "Eternal Boots",
    currentPrice: 5000000,
    targetPrice: 4800000,
    quantity: 1,
    priority: "A-" as const,
    category: "gear" as const,
    notes: "Best in slot magic boots",
    imageUrl: ""
  },
  {
    id: "14",
    name: "Abyssal Whip",
    currentPrice: 3000000,
    targetPrice: 2800000,
    quantity: 1,
    priority: "A-" as const,
    category: "gear" as const,
    notes: "Good melee weapon",
    imageUrl: ""
  },
  
  // B+ Tier - Medium Priority
  {
    id: "15",
    name: "Old School Bond",
    currentPrice: 5000000,
    targetPrice: 4800000,
    quantity: 1,
    priority: "B+" as const,
    category: "other" as const,
    notes: "For membership",
    imageUrl: ""
  },
  {
    id: "16",
    name: "Barrows Gloves",
    currentPrice: 130000,
    targetPrice: 130000,
    quantity: 1,
    priority: "B+" as const,
    category: "gear" as const,
    notes: "Best in slot gloves (quest reward)",
    imageUrl: ""
  }
];

// Banco começa vazio — os dados reais vêm do import do RuneLite Data Exporter.
// (antes tinha itens de exemplo fake que se misturavam ao bank real e poluíam o overview)
export const getDefaultBankData = (): Record<string, BankItem[]> => ({});
