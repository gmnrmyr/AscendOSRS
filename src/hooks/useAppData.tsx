
import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";

interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
  isActive: boolean;
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

const getDefaultCharacters = (): Character[] => [
  {
    id: "1",
    name: "Lazy Priest",
    type: "main" as const,
    combatLevel: 126,
    totalLevel: 2100,
    bank: 500000000,
    notes: "Main account for high-level PvM content",
    isActive: true
  },
  {
    id: "2", 
    name: "High Priest",
    type: "alt" as const,
    combatLevel: 100,
    totalLevel: 1500,
    bank: 50000000,
    notes: "Alt for money making and skilling",
    isActive: true
  }
];

const getDefaultMoneyMethods = (): MoneyMethod[] => [
  {
    id: "1",
    name: "Brutal Black Dragons",
    character: "Lazy Priest",
    gpHour: 1000000,
    clickIntensity: 3 as const,
    requirements: "Tbow, high range level",
    notes: "Very consistent money maker",
    category: "combat" as const
  },
  {
    id: "2",
    name: "Rune Dragons", 
    character: "Lazy Priest",
    gpHour: 1200000,
    clickIntensity: 4 as const,
    requirements: "High stats, good gear",
    notes: "Higher intensity but better gp/hr",
    category: "combat" as const
  },
  {
    id: "3",
    name: "Cannonballs",
    character: "High Priest", 
    gpHour: 150000,
    clickIntensity: 1 as const,
    requirements: "Dwarf Cannon quest, 35 smithing",
    notes: "Very AFK money making",
    category: "skilling" as const
  },
  {
    id: "4",
    name: "Gargoyles",
    character: "Lazy Priest",
    gpHour: 567000, 
    clickIntensity: 3 as const,
    requirements: "High slayer, good gear",
    notes: "Good slayer task money",
    category: "combat" as const
  }
];

const getDefaultPurchaseGoals = (): PurchaseGoal[] => [
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
    priority: "S" as const,
    category: "gear" as const,
    notes: "For Theatre of Blood",
    imageUrl: ""
  },
  {
    id: "3",
    name: "Dragon Claws",
    currentPrice: 150000000,
    targetPrice: 140000000,
    quantity: 1,
    priority: "A" as const,
    category: "gear" as const,
    notes: "PvP and some PvM content",
    imageUrl: ""
  }
];

const getDefaultBankData = (): Record<string, BankItem[]> => ({
  "Lazy Priest": [
    {
      id: "1",
      name: "Coins",
      quantity: 500000000,
      estimatedPrice: 1,
      category: "stackable" as const,
      character: "Lazy Priest"
    },
    {
      id: "2",
      name: "Prayer Potions(4)",
      quantity: 1000,
      estimatedPrice: 12000,
      category: "stackable" as const,
      character: "Lazy Priest"
    },
    {
      id: "3",
      name: "Super Combat Potions(4)",
      quantity: 500,
      estimatedPrice: 15000,
      category: "stackable" as const,
      character: "Lazy Priest"
    },
    {
      id: "4",
      name: "Bandos Chestplate",
      quantity: 1,
      estimatedPrice: 25000000,
      category: "gear" as const,
      character: "Lazy Priest"
    }
  ],
  "High Priest": [
    {
      id: "5",
      name: "Coins", 
      quantity: 50000000,
      estimatedPrice: 1,
      category: "stackable" as const,
      character: "High Priest"
    },
    {
      id: "6",
      name: "Steel Bars",
      quantity: 10000,
      estimatedPrice: 500,
      category: "materials" as const,
      character: "High Priest"
    },
    {
      id: "7",
      name: "Cannonballs",
      quantity: 50000,
      estimatedPrice: 180,
      category: "stackable" as const,
      character: "High Priest"
    }
  ]
});

export function useAppData() {
  const [characters, setCharacters] = useState<Character[]>(getDefaultCharacters());
  const [moneyMethods, setMoneyMethods] = useState<MoneyMethod[]>(getDefaultMoneyMethods());
  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>(getDefaultPurchaseGoals());
  const [bankData, setBankData] = useState<Record<string, BankItem[]>>(getDefaultBankData());
  const [hoursPerDay, setHoursPerDay] = useState(10);

  const { user } = useAuth();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('osrs-dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.characters) setCharacters(parsed.characters);
        if (parsed.moneyMethods) setMoneyMethods(parsed.moneyMethods);
        if (parsed.purchaseGoals) setPurchaseGoals(parsed.purchaseGoals);
        if (parsed.bankData) setBankData(parsed.bankData);
        if (parsed.hoursPerDay) setHoursPerDay(parsed.hoursPerDay);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      characters,
      moneyMethods,
      purchaseGoals,
      bankData,
      hoursPerDay
    };
    localStorage.setItem('osrs-dashboard-data', JSON.stringify(dataToSave));
  }, [characters, moneyMethods, purchaseGoals, bankData, hoursPerDay]);

  // Auto-save to cloud for authenticated users (debounced)
  useEffect(() => {
    if (!user) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        console.log('Auto-saving to cloud...');
        const { CloudDataService } = await import('@/services/cloudDataService');
        await CloudDataService.saveUserData(
          characters,
          moneyMethods,
          purchaseGoals,
          bankData,
          hoursPerDay
        );
        console.log('Auto-save to cloud completed');
      } catch (error) {
        console.error('Auto-save to cloud failed:', error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [user, characters, moneyMethods, purchaseGoals, bankData, hoursPerDay]);

  const setAllData = (data: {
    characters: Character[];
    moneyMethods: MoneyMethod[];
    purchaseGoals: PurchaseGoal[];
    bankData: Record<string, BankItem[]>;
    hoursPerDay: number;
  }) => {
    setCharacters(data.characters);
    setMoneyMethods(data.moneyMethods);
    setPurchaseGoals(data.purchaseGoals);
    setBankData(data.bankData);
    setHoursPerDay(data.hoursPerDay);
  };

  return {
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    setCharacters,
    setMoneyMethods,
    setPurchaseGoals,
    setBankData,
    setHoursPerDay,
    setAllData
  };
}

export type { Character, MoneyMethod, PurchaseGoal, BankItem };
