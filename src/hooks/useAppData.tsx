
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
          
          // Only update if cloud has data (not empty defaults)
          if (cloudData.characters.length > 0 || cloudData.moneyMethods.length > 0 || cloudData.purchaseGoals.length > 0) {
            setCharacters(cloudData.characters);
            setMoneyMethods(cloudData.moneyMethods);
            setPurchaseGoals(cloudData.purchaseGoals);
            setBankData(cloudData.bankData);
            setHoursPerDay(cloudData.hoursPerDay);
            console.log('Cloud data loaded successfully');
          } else {
            console.log('No cloud data found, keeping current data');
          }
          
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
