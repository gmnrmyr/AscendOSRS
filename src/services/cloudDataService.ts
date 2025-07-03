
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
  itemId?: number;
}

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: string;
  character: string;
}

// Safe number conversion that handles NaN, null, undefined, and invalid values
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

// Map frontend categories to database-safe categories - MUST match database constraint
const mapBankItemCategory = (category: string): string => {
  if (!category || typeof category !== 'string') return 'other';
  
  const normalized = category.toLowerCase().trim();
  
  // ONLY these 4 categories are valid in database: stackable, gear, materials, other
  const categoryMappings: Record<string, string> = {
    // All consumable-type items -> stackable
    'consumables': 'stackable',
    'consumable': 'stackable',
    'stackable': 'stackable',
    'food': 'stackable',
    'potion': 'stackable',
    'potions': 'stackable',
    'coins': 'stackable',
    'coin': 'stackable',
    'token': 'stackable',
    'tokens': 'stackable',
    'rune': 'stackable',
    'runes': 'stackable',
    'bolt': 'stackable',
    'bolts': 'stackable',
    'arrow': 'stackable',
    'arrows': 'stackable',
    'teleport': 'stackable',
    'scroll': 'stackable',
    'scrolls': 'stackable',
    
    // All equipment-type items -> gear
    'gear': 'gear',
    'weapon': 'gear',
    'weapons': 'gear',
    'armor': 'gear',
    'armour': 'gear',
    'equipment': 'gear',
    'helmet': 'gear',
    'helm': 'gear',
    'shield': 'gear',
    'gloves': 'gear',
    'boots': 'gear',
    'ring': 'gear',
    'rings': 'gear',
    'amulet': 'gear',
    'necklace': 'gear',
    'bracelet': 'gear',
    'cape': 'gear',
    'cloak': 'gear',
    
    // All raw materials -> materials
    'materials': 'materials',
    'material': 'materials',
    'resource': 'materials',
    'resources': 'materials',
    'log': 'materials',
    'logs': 'materials',
    'ore': 'materials',
    'ores': 'materials',
    'bar': 'materials',
    'bars': 'materials',
    'gem': 'materials',
    'gems': 'materials',
    'herb': 'materials',
    'herbs': 'materials',
    'seed': 'materials',
    'seeds': 'materials',
    'essence': 'materials',
    
    // Everything else -> other
    'other': 'other',
    'misc': 'other',
    'miscellaneous': 'other',
    'quest': 'other',
    'key': 'other',
    'keys': 'other',
    'book': 'other',
    'books': 'other'
  };
  
  return categoryMappings[normalized] || 'other';
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
      // Save ALL fields for every entity, preserving all user data
      const cleanedData = {
        characters: characters.map(char => ({
          ...char,
          combatLevel: typeof char.combatLevel === 'number' ? char.combatLevel : 3,
          totalLevel: typeof char.totalLevel === 'number' ? char.totalLevel : 32,
          bank: typeof char.bank === 'number' ? char.bank : 0,
          platTokens: typeof char.platTokens === 'number' ? char.platTokens : 0,
          type: char.type || 'main',
          name: String(char.name || 'Unnamed Character'),
          notes: String(char.notes || ''),
          isActive: typeof char.isActive === 'boolean' ? char.isActive : true
        })),
        moneyMethods: moneyMethods.map(method => {
          // Always include isActive, even if false
          const isActive = typeof method.isActive === 'boolean' ? method.isActive : true;
          const methodForSave = {
            ...method,
            gpHour: typeof method.gpHour === 'number' ? method.gpHour : 0,
            clickIntensity: typeof method.clickIntensity === 'number' ? method.clickIntensity : 1,
            category: method.category || 'other',
            name: String(method.name || 'Unnamed Method'),
            character: String(method.character || 'Unknown'),
            requirements: String(method.requirements || ''),
            notes: String(method.notes || ''),
            isActive: isActive // always present
          };
          // Debug log for troubleshooting
          console.log('[Cloud Save] Method for save:', JSON.stringify(methodForSave));
          return methodForSave;
        }),
        purchaseGoals: purchaseGoals.map(goal => ({
          ...goal,
          currentPrice: typeof goal.currentPrice === 'number' ? goal.currentPrice : 0,
          targetPrice: typeof goal.targetPrice === 'number' ? goal.targetPrice : undefined,
          quantity: typeof goal.quantity === 'number' ? goal.quantity : 1,
          priority: goal.priority || 'A',
          category: goal.category || 'other',
          name: String(goal.name || 'Unnamed Goal'),
          notes: String(goal.notes || ''),
          imageUrl: String(goal.imageUrl || '')
        })),
        bankData: Object.fromEntries(
          Object.entries(bankData).map(([character, items]) => [
            character,
            items
              .filter(item => item && typeof item === 'object' && item.name && String(item.name).trim())
              .map(item => ({
                ...item,
                category: item.category || 'other',
                quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                estimatedPrice: typeof item.estimatedPrice === 'number' ? item.estimatedPrice : 0,
                name: String(item.name).trim()
              }))
          ])
        ),
        hoursPerDay: typeof hoursPerDay === 'number' ? hoursPerDay : 10
      };

      console.log('Sending cleaned data to edge function:', {
        charactersCount: cleanedData.characters.length,
        methodsCount: cleanedData.moneyMethods.length,
        goalsCount: cleanedData.purchaseGoals.length,
        bankItemsCount: Object.values(cleanedData.bankData).flat().length,
        hoursPerDay: cleanedData.hoursPerDay
      });
      
      // Debug: Log the actual character data being sent
      console.log('Character data being sent:', JSON.stringify(cleanedData.characters, null, 2));
      console.log('Money methods being sent:', JSON.stringify(cleanedData.moneyMethods, null, 2));

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

      console.log('Cloud save completed successfully:', data);
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

      // Defensive: always return all fields, with correct types and defaults only if truly missing
      const safeData = {
        characters: (data?.characters || []).map((char: any) => ({
          ...char,
          combatLevel: typeof char.combatLevel === 'number' ? char.combatLevel : 3,
          totalLevel: typeof char.totalLevel === 'number' ? char.totalLevel : 32,
          bank: typeof char.bank === 'number' ? char.bank : 0,
          platTokens: typeof char.platTokens === 'number' ? char.platTokens : 0,
          type: char.type || 'main',
          name: String(char.name || 'Unnamed Character'),
          notes: String(char.notes || ''),
          isActive: typeof char.isActive === 'boolean' ? char.isActive : true
        })),
        moneyMethods: (data?.moneyMethods || []).map((method: any) => ({
          ...method,
          gpHour: typeof method.gpHour === 'number' ? method.gpHour : 0,
          clickIntensity: typeof method.clickIntensity === 'number' ? method.clickIntensity : 1,
          category: method.category || 'other',
          name: String(method.name || 'Unnamed Method'),
          character: String(method.character || 'Unknown'),
          requirements: String(method.requirements || ''),
          notes: String(method.notes || ''),
          isActive: typeof method.isActive === 'boolean' ? method.isActive : true
        })),
        purchaseGoals: (data?.purchaseGoals || []).map((goal: any) => ({
          ...goal,
          currentPrice: typeof goal.currentPrice === 'number' ? goal.currentPrice : 0,
          targetPrice: typeof goal.targetPrice === 'number' ? goal.targetPrice : undefined,
          quantity: typeof goal.quantity === 'number' ? goal.quantity : 1,
          priority: goal.priority || 'A',
          category: goal.category || 'other',
          name: String(goal.name || 'Unnamed Goal'),
          notes: String(goal.notes || ''),
          imageUrl: String(goal.imageUrl || '')
        })),
        bankData: data?.bankData && typeof data.bankData === 'object' ? data.bankData : {},
        hoursPerDay: typeof data?.hoursPerDay === 'number' ? data.hoursPerDay : 10
      };

      console.log('Cloud data loaded and validated:', safeData);
      console.log('Loaded characters:', JSON.stringify(safeData.characters, null, 2));
      console.log('Loaded money methods:', JSON.stringify(safeData.moneyMethods, null, 2));
      console.log('Loaded hoursPerDay:', safeData.hoursPerDay);
      return safeData;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      throw error;
    }
  }
}
