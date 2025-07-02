
import { useState, useEffect } from 'react';
import { useDataPersistence } from './useDataPersistence';
import { useAuth } from './useAuth';
import { 
  getDefaultCharacters, 
  getDefaultMoneyMethods, 
  getDefaultPurchaseGoals, 
  getDefaultBankData 
} from './useDefaultData';

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
  isActive?: boolean;
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

export function useAppData() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>(getDefaultCharacters());
  const [moneyMethods, setMoneyMethods] = useState<MoneyMethod[]>(getDefaultMoneyMethods());
  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>(getDefaultPurchaseGoals());
  const [bankData, setBankData] = useState<Record<string, BankItem[]>>(getDefaultBankData());
  const [hoursPerDay, setHoursPerDay] = useState(10);
  const [hasLoadedCloudData, setHasLoadedCloudData] = useState(false);

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

  // Auto-load from cloud when user logs in
  useEffect(() => {
    if (user && !hasLoadedCloudData) {
      const loadCloudData = async () => {
        try {
          console.log('Auto-loading cloud data for authenticated user...');
          const { CloudDataService } = await import('@/services/cloudDataService');
          const cloudData = await CloudDataService.loadUserData();

          // Strictly REPLACE all state with cloud data (no merging, no patching, no duplication)
          setCharacters(Array.isArray(cloudData.characters) ? cloudData.characters : []);
          setMoneyMethods(Array.isArray(cloudData.moneyMethods) ? cloudData.moneyMethods : []);
          setPurchaseGoals(Array.isArray(cloudData.purchaseGoals) ? cloudData.purchaseGoals : []);
          setBankData(cloudData.bankData && typeof cloudData.bankData === 'object' ? cloudData.bankData : {});
          setHoursPerDay(typeof cloudData.hoursPerDay === 'number' ? cloudData.hoursPerDay : 10);
          console.log('Cloud data loaded and state replaced.');
          setHasLoadedCloudData(true);
        } catch (error) {
          console.error('Auto-load from cloud failed:', error);
          setHasLoadedCloudData(true); // Still mark as attempted to avoid infinite retries
        }
      };
      loadCloudData();
    }
  }, [user, hasLoadedCloudData]);

  // Use persistence hook for auto-saving
  useDataPersistence({
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay
  });

  const setAllData = (data: {
    characters: Character[];
    moneyMethods: MoneyMethod[];
    purchaseGoals: PurchaseGoal[];
    bankData: Record<string, BankItem[]>;
    hoursPerDay: number;
  }) => {
    // Strictly replace all state with provided data (no merging, no patching)
    setCharacters(Array.isArray(data.characters) ? data.characters : []);
    setMoneyMethods(Array.isArray(data.moneyMethods) ? data.moneyMethods : []);
    setPurchaseGoals(Array.isArray(data.purchaseGoals) ? data.purchaseGoals : []);
    setBankData(data.bankData && typeof data.bankData === 'object' ? data.bankData : {});
    setHoursPerDay(typeof data.hoursPerDay === 'number' ? data.hoursPerDay : 10);
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
