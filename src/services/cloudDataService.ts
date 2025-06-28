
import { supabase } from '@/integrations/supabase/client';

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
  itemId?: number;
}

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

// Utility function to normalize bank item categories
const normalizeBankCategory = (category: string): 'stackable' | 'gear' | 'materials' | 'other' => {
  if (!category || typeof category !== 'string') return 'other';
  
  const normalized = category.toLowerCase().trim();
  
  // Map various category names to valid database categories
  if (normalized === 'stackable' || normalized === 'consumables' || normalized === 'consumable') return 'stackable';
  if (normalized === 'gear' || normalized === 'equipment' || normalized === 'weapon' || normalized === 'armor' || normalized === 'armour') return 'gear';
  if (normalized === 'materials' || normalized === 'material' || normalized === 'resource' || normalized === 'resources') return 'materials';
  
  return 'other';
};

export class CloudDataService {
  static async saveUserData(
    characters: Character[],
    moneyMethods: MoneyMethod[],
    purchaseGoals: PurchaseGoal[],
    bankData: Record<string, BankItem[]>,
    hoursPerDay: number
  ) {
    try {
      console.log('Starting cloud save via edge function...');
      
      // Normalize and validate bank data categories
      const normalizedBankData: Record<string, BankItem[]> = {};
      
      Object.entries(bankData).forEach(([character, items]) => {
        normalizedBankData[character] = items.map(item => ({
          ...item,
          category: normalizeBankCategory(item.category),
          quantity: Math.max(0, Number(item.quantity) || 0),
          estimatedPrice: Math.max(0, Number(item.estimatedPrice) || 0)
        }));
      });

      // Validate and clean data before sending
      const cleanedData = {
        characters: characters.map(char => ({
          ...char,
          combatLevel: Math.max(3, Math.min(126, Number(char.combatLevel) || 3)),
          totalLevel: Math.max(32, Math.min(2277, Number(char.totalLevel) || 32)),
          bank: Math.max(0, Number(char.bank) || 0),
          platTokens: Math.max(0, Number(char.platTokens) || 0),
          type: ['main', 'alt', 'ironman', 'hardcore', 'ultimate'].includes(char.type) ? char.type : 'main'
        })),
        moneyMethods: moneyMethods.map(method => ({
          ...method,
          gpHour: Math.max(0, Number(method.gpHour) || 0),
          clickIntensity: Math.max(1, Math.min(5, Number(method.clickIntensity) || 1)),
          category: ['combat', 'skilling', 'bossing', 'other'].includes(method.category) ? method.category : 'other'
        })),
        purchaseGoals: purchaseGoals.map(goal => ({
          ...goal,
          currentPrice: Math.max(0, Number(goal.currentPrice) || 0),
          targetPrice: goal.targetPrice ? Math.max(0, Number(goal.targetPrice)) : undefined,
          quantity: Math.max(1, Number(goal.quantity) || 1),
          priority: ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(goal.priority) ? goal.priority : 'A',
          category: ['gear', 'consumables', 'materials', 'other'].includes(goal.category) ? goal.category : 'other'
        })),
        bankData: normalizedBankData,
        hoursPerDay: Math.max(1, Math.min(24, Number(hoursPerDay) || 10))
      };

      const { data, error } = await supabase.functions.invoke('cloud-data', {
        body: {
          action: 'save',
          ...cleanedData
        }
      });

      if (error) {
        console.error('Cloud save error details:', error);
        throw new Error(`Cloud save failed: ${error.message || 'Unknown error'}`);
      }

      console.log('Cloud save completed successfully');
      return data;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      throw error;
    }
  }

  static async loadUserData() {
    try {
      console.log('Loading cloud data via edge function...');
      
      const { data, error } = await supabase.functions.invoke('cloud-data', {
        body: { action: 'load' }
      });

      if (error) {
        console.error('Cloud load error details:', error);
        throw new Error(`Cloud load failed: ${error.message || 'Unknown error'}`);
      }

      console.log('Cloud data loaded successfully');
      return data || {
        characters: [],
        moneyMethods: [],
        purchaseGoals: [],
        bankData: {},
        hoursPerDay: 10
      };
    } catch (error) {
      console.error('Error loading from cloud:', error);
      throw error;
    }
  }
}
