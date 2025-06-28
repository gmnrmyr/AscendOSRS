
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
      
      // Robust data cleaning with safe number conversion and STRICT category validation
      const cleanedData = {
        characters: characters.map(char => ({
          ...char,
          combatLevel: Math.max(3, Math.min(126, safeNumber(char.combatLevel) || 3)),
          totalLevel: Math.max(32, Math.min(2277, safeNumber(char.totalLevel) || 32)),
          bank: Math.max(0, safeNumber(char.bank) || 0),
          platTokens: Math.max(0, safeNumber(char.platTokens) || 0),
          type: ['main', 'alt', 'ironman', 'hardcore', 'ultimate'].includes(char.type) ? char.type : 'main',
          name: String(char.name || 'Unnamed Character'),
          notes: String(char.notes || '')
        })),
        moneyMethods: moneyMethods.map(method => ({
          ...method,
          gpHour: Math.max(0, safeNumber(method.gpHour) || 0),
          clickIntensity: Math.max(1, Math.min(5, safeNumber(method.clickIntensity) || 1)) as 1 | 2 | 3 | 4 | 5,
          category: ['combat', 'skilling', 'bossing', 'other'].includes(method.category) ? method.category : 'other',
          name: String(method.name || 'Unnamed Method'),
          character: String(method.character || 'Unknown'),
          requirements: String(method.requirements || ''),
          notes: String(method.notes || '')
        })),
        purchaseGoals: purchaseGoals.map(goal => ({
          ...goal,
          currentPrice: Math.max(0, safeNumber(goal.currentPrice) || 0),
          targetPrice: goal.targetPrice ? Math.max(0, safeNumber(goal.targetPrice)) : undefined,
          quantity: Math.max(1, safeNumber(goal.quantity) || 1),
          priority: ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(goal.priority) ? goal.priority : 'A',
          category: ['gear', 'consumables', 'materials', 'other'].includes(goal.category) ? goal.category : 'other',
          name: String(goal.name || 'Unnamed Goal'),
          notes: String(goal.notes || ''),
          imageUrl: String(goal.imageUrl || '')
        })),
        bankData: Object.fromEntries(
          Object.entries(bankData).map(([character, items]) => [
            character,
            items
              .filter(item => item && typeof item === 'object' && item.name && String(item.name).trim())
              .map(item => {
                const mappedCategory = mapBankItemCategory(item.category);
                const quantity = Math.max(0, safeNumber(item.quantity, 0));
                const estimatedPrice = Math.max(0, safeNumber(item.estimatedPrice, 0));
                
                console.log(`Bank item: ${item.name}, Original: ${item.category}, Mapped: ${mappedCategory}, Qty: ${quantity}, Price: ${estimatedPrice}`);
                
                return {
                  ...item,
                  category: mappedCategory, // This is now guaranteed to be valid
                  quantity: quantity,
                  estimatedPrice: estimatedPrice,
                  name: String(item.name).trim()
                };
              })
          ])
        ),
        hoursPerDay: Math.max(1, Math.min(24, safeNumber(hoursPerDay) || 10))
      };

      console.log('Sending cleaned data to edge function:', {
        charactersCount: cleanedData.characters.length,
        methodsCount: cleanedData.moneyMethods.length,
        goalsCount: cleanedData.purchaseGoals.length,
        bankItemsCount: Object.values(cleanedData.bankData).flat().length
      });

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

      console.log('Cloud data loaded successfully:', data);
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
