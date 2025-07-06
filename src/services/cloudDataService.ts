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
      
      // Count and analyze bank items before save
      const allBankItems = Object.values(bankData).flat();
      const totalBankItems = allBankItems.length;
      
      // Calculate total bank value for reporting
      const totalBankValue = allBankItems.reduce((sum, item) => {
        const value = (item.quantity || 0) * (item.estimatedPrice || 0);
        return sum + value;
      }, 0);
      
      console.log(`Attempting to save ${totalBankItems} bank items across ${Object.keys(bankData).length} characters`);
      console.log(`Total bank value: ${totalBankValue.toLocaleString()} GP`);
      
      // Sort and prioritize bank items by value before sending
      const prioritizedBankData = Object.fromEntries(
        Object.entries(bankData).map(([character, items]) => [
          character,
          [...items].sort((a, b) => {
            const valueA = (a.quantity || 0) * (a.estimatedPrice || 0);
            const valueB = (b.quantity || 0) * (b.estimatedPrice || 0);
            // Sort by value descending, then by name for consistency
            if (valueB !== valueA) {
              return valueB - valueA;
            }
            return (a.name || '').localeCompare(b.name || '');
          })
        ])
      );
      
      // Log top 10 most valuable items being saved
      const topItems = allBankItems
        .map(item => ({
          name: item.name || 'Unknown',
          quantity: item.quantity || 0,
          price: item.estimatedPrice || 0,
          value: (item.quantity || 0) * (item.estimatedPrice || 0),
          character: item.character || 'Unknown'
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      
      console.log('Top 10 most valuable items being saved:');
      topItems.forEach((item, index) => {
        if (item.value > 0) {
          console.log(`  ${index + 1}. ${item.name} (${item.character}) - ${item.quantity.toLocaleString()} x ${item.price.toLocaleString()} = ${item.value.toLocaleString()} GP`);
        }
      });
      
      // Save ALL fields for every entity, preserving all user data
      const cleanedData = {
        characters: characters.map(char => ({
          ...char,
          combatLevel: Math.min(Math.max(typeof char.combatLevel === 'number' ? char.combatLevel : 3, 3), 126),
          totalLevel: Math.min(Math.max(typeof char.totalLevel === 'number' ? char.totalLevel : 32, 32), 2277),
          bank: Math.min(typeof char.bank === 'number' ? char.bank : 0, 999999999999),
          platTokens: Math.min(typeof char.platTokens === 'number' ? char.platTokens : 0, 999999999999),
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
            gpHour: Math.min(typeof method.gpHour === 'number' ? method.gpHour : 0, 999999999999),
            clickIntensity: Math.min(Math.max(typeof method.clickIntensity === 'number' ? method.clickIntensity : 1, 1), 5),
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
          Object.entries(prioritizedBankData).map(([character, items]) => [
            character,
            items
              .filter(item => item && typeof item === 'object' && item.name && String(item.name).trim())
              .map(item => ({
                ...item,
                category: mapBankItemCategory(item.category), // Use the category mapping function
                quantity: Math.min(typeof item.quantity === 'number' ? item.quantity : 0, 999999999999),
                estimatedPrice: Math.min(typeof item.estimatedPrice === 'number' ? item.estimatedPrice : 0, 999999999999),
                name: String(item.name).trim()
              }))
          ])
        ),
        hoursPerDay: typeof hoursPerDay === 'number' ? hoursPerDay : 10
      };

      // Log detailed info about what's being saved
      const cleanedBankItems = Object.values(cleanedData.bankData).flat().length;
      console.log('Sending cleaned data to edge function:', {
        charactersCount: cleanedData.characters.length,
        methodsCount: cleanedData.moneyMethods.length,
        goalsCount: cleanedData.purchaseGoals.length,
        bankItemsCount: cleanedBankItems,
        hoursPerDay: cleanedData.hoursPerDay
      });
      
      if (cleanedBankItems < totalBankItems) {
        console.warn(`WARNING: ${totalBankItems - cleanedBankItems} bank items were filtered out during cleaning`);
      }
      
      // Debug: Log the actual character data being sent
      console.log('Character data being sent:', JSON.stringify(cleanedData.characters, null, 2));
      console.log('Money methods being sent:', JSON.stringify(cleanedData.moneyMethods, null, 2));
      console.log('Bank data summary being sent:', Object.entries(cleanedData.bankData).map(([char, items]) => ({
        character: char,
        itemCount: items.length,
        topItems: items.slice(0, 3).map(item => ({ name: item.name, value: (item.quantity || 0) * (item.estimatedPrice || 0) }))
      })));

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
      
      // Enhanced reporting for bank items
      if (data?.saved?.bankItems) {
        const savedItems = data.saved.bankItems;
        const successRate = ((savedItems / cleanedBankItems) * 100).toFixed(1);
        
        console.log(`Bank items sync result: ${savedItems}/${cleanedBankItems} items saved (${successRate}% success rate)`);
        
        if (savedItems < cleanedBankItems) {
          const missingItems = cleanedBankItems - savedItems;
          const message = `Cloud save completed with warnings: Only ${savedItems} out of ${cleanedBankItems} bank items were saved (${successRate}% success). ${missingItems} items failed to sync. Most valuable items were prioritized.`;
          console.warn(message);
          
          // Return success but with detailed warning info
          return {
            ...data,
            warning: message,
            partialSync: {
              expected: cleanedBankItems,
              saved: savedItems,
              missing: missingItems,
              successRate: parseFloat(successRate),
              totalValue: totalBankValue,
              itemsLost: missingItems
            }
          };
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      throw error;
    }
  }

  // FIXED: Chunked sync method that doesn't accidentally clear data
  static async saveUserDataChunked(
    characters: Character[],
    moneyMethods: MoneyMethod[],
    purchaseGoals: PurchaseGoal[],
    bankData: Record<string, BankItem[]>,
    hoursPerDay: number,
    progressCallback?: (progress: { current: number; total: number; phase: string }) => void
  ) {
    try {
      console.log('Starting FIXED chunked cloud save...');
      
      const totalBankItems = Object.values(bankData).flat().length;
      
      // If dataset is small, use regular save
      if (totalBankItems <= 500) {
        console.log('Dataset is small, using regular save method');
        return await this.saveUserData(characters, moneyMethods, purchaseGoals, bankData, hoursPerDay);
      }
      
      console.log(`Large dataset detected (${totalBankItems} items), using chunked save...`);
      
      // FIXED: Save everything with prioritized bank data instead of clearing bank data
      progressCallback?.({ current: 1, total: 3, phase: 'Saving all data with prioritized items...' });
      
      // Sort all bank items by value first
      const prioritizedBankData = Object.fromEntries(
        Object.entries(bankData).map(([character, items]) => [
          character,
          [...items].sort((a, b) => {
            const valueA = (a.quantity || 0) * (a.estimatedPrice || 0);
            const valueB = (b.quantity || 0) * (b.estimatedPrice || 0);
            return valueB - valueA; // Most valuable first
          })
        ])
      );
      
      progressCallback?.({ current: 2, total: 3, phase: 'Saving prioritized data to cloud...' });
      
      // Save everything at once with prioritized data (no chunking needed - the server now handles this better)
      const result = await this.saveUserData(characters, moneyMethods, purchaseGoals, prioritizedBankData, hoursPerDay);
      
      progressCallback?.({ current: 3, total: 3, phase: 'Completed' });
      
      console.log('Fixed chunked save completed successfully');
      
      return {
        ...result,
        method: 'fixed-chunked',
        note: 'Used improved chunked method with value prioritization'
      };
      
    } catch (error) {
      console.error('Error in fixed chunked save:', error);
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
        bankData: data?.bankData && typeof data.bankData === 'object' ? 
          Object.fromEntries(
            Object.entries(data.bankData).map(([character, items]) => [
              character,
              Array.isArray(items) ? items.map((item: any) => ({
                id: item.id || Date.now().toString() + Math.random(),
                name: String(item.name || 'Unknown Item'),
                quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                estimatedPrice: typeof item.estimatedPrice === 'number' ? item.estimatedPrice : 0,
                category: mapBankItemCategory(item.category), // Use the category mapping function
                character: String(item.character || character)
              })) : []
            ])
          ) : {},
        hoursPerDay: typeof data?.hoursPerDay === 'number' ? data.hoursPerDay : 10
      };

      console.log('Cloud data loaded and validated:', safeData);
      console.log('Loaded characters:', JSON.stringify(safeData.characters, null, 2));
      console.log('Loaded money methods:', JSON.stringify(safeData.moneyMethods, null, 2));
      console.log('Loaded bank data:', JSON.stringify(safeData.bankData, null, 2));
      console.log('Loaded hoursPerDay:', safeData.hoursPerDay);
      return safeData;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      throw error;
    }
  }
}
