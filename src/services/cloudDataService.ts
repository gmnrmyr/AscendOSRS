
import { supabase } from "@/integrations/supabase/client";

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

export class CloudDataService {
  static async saveUserData(
    characters: Character[],
    moneyMethods: MoneyMethod[],
    purchaseGoals: PurchaseGoal[],
    bankData: Record<string, BankItem[]>,
    hoursPerDay: number
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Starting cloud save process...');

      // Clear existing data for this user first
      const deletePromises = [
        supabase.from('characters').delete().eq('user_id', user.id),
        supabase.from('money_methods').delete().eq('user_id', user.id),
        supabase.from('purchase_goals').delete().eq('user_id', user.id),
        supabase.from('bank_items').delete().eq('user_id', user.id)
      ];

      const deleteResults = await Promise.allSettled(deletePromises);
      console.log('Delete results:', deleteResults);

      // Save characters with all required fields
      if (characters.length > 0) {
        const charactersToSave = characters.map(char => ({
          user_id: user.id,
          name: char.name,
          type: char.type,
          combat_level: char.combatLevel || 0,
          total_level: char.totalLevel || 0,
          bank: char.bank || 0,
          notes: char.notes || '',
          plat_tokens: 0 // Default value for now
        }));

        console.log('Saving characters:', charactersToSave);
        const { error: charError } = await supabase
          .from('characters')
          .insert(charactersToSave);

        if (charError) {
          console.error('Characters save error:', charError);
          throw charError;
        }
        console.log('Characters saved successfully');
      }

      // Save money methods with proper category mapping
      if (moneyMethods.length > 0) {
        const methodsToSave = moneyMethods.map(method => {
          // Map frontend categories to database categories
          let dbCategory = method.category;
          if (method.category === 'bossing') dbCategory = 'pvm';
          if (method.category === 'other') dbCategory = 'merching';
          
          return {
            user_id: user.id,
            name: method.name,
            character: method.character,
            gp_hour: method.gpHour || 0,
            click_intensity: method.clickIntensity,
            requirements: method.requirements || '',
            notes: method.notes || '',
            category: dbCategory
          };
        });

        console.log('Saving money methods:', methodsToSave);
        const { error: methodsError } = await supabase
          .from('money_methods')
          .insert(methodsToSave);

        if (methodsError) {
          console.error('Money methods save error:', methodsError);
          throw methodsError;
        }
        console.log('Money methods saved successfully');
      }

      // Save purchase goals with proper category mapping
      if (purchaseGoals.length > 0) {
        const goalsToSave = purchaseGoals.map(goal => {
          // Map frontend categories to database categories
          let dbCategory = goal.category;
          if (goal.category === 'materials') dbCategory = 'misc';
          if (goal.category === 'other') dbCategory = 'misc';
          
          return {
            user_id: user.id,
            name: goal.name,
            current_price: goal.currentPrice || 0,
            target_price: goal.targetPrice || null,
            quantity: goal.quantity || 1,
            priority: goal.priority,
            category: dbCategory,
            notes: goal.notes || '',
            image_url: goal.imageUrl || ''
          };
        });

        console.log('Saving purchase goals:', goalsToSave);
        const { error: goalsError } = await supabase
          .from('purchase_goals')
          .insert(goalsToSave);

        if (goalsError) {
          console.error('Purchase goals save error:', goalsError);
          throw goalsError;
        }
        console.log('Purchase goals saved successfully');
      }

      // Save bank items with proper category mapping
      const allBankItems: any[] = [];
      Object.entries(bankData).forEach(([character, items]) => {
        items.forEach(item => {
          // Map frontend categories to database categories
          let dbCategory = item.category;
          if (item.category === 'materials') dbCategory = 'consumables';
          if (item.category === 'other') dbCategory = 'consumables';
          
          allBankItems.push({
            user_id: user.id,
            character: character,
            name: item.name,
            quantity: item.quantity || 0,
            estimated_price: item.estimatedPrice || 0,
            category: dbCategory
          });
        });
      });

      if (allBankItems.length > 0) {
        console.log('Saving bank items:', allBankItems);
        const { error: bankError } = await supabase
          .from('bank_items')
          .insert(allBankItems);

        if (bankError) {
          console.error('Bank items save error:', bankError);
          throw bankError;
        }
        console.log('Bank items saved successfully');
      }

      console.log('Cloud save completed successfully');
      return { success: true };

    } catch (error) {
      console.error('Cloud save failed:', error);
      throw error;
    }
  }

  static async loadUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Starting cloud load process...');

      // Load all data in parallel
      const [charactersResult, methodsResult, goalsResult, bankItemsResult] = await Promise.allSettled([
        supabase.from('characters').select('*').eq('user_id', user.id),
        supabase.from('money_methods').select('*').eq('user_id', user.id),
        supabase.from('purchase_goals').select('*').eq('user_id', user.id),
        supabase.from('bank_items').select('*').eq('user_id', user.id)
      ]);

      // Handle characters
      const characters: Character[] = [];
      if (charactersResult.status === 'fulfilled' && charactersResult.value.data) {
        characters.push(...charactersResult.value.data.map(char => ({
          id: char.id,
          name: char.name,
          type: char.type as Character['type'],
          combatLevel: char.combat_level || 0,
          totalLevel: char.total_level || 0,
          bank: Number(char.bank) || 0,
          notes: char.notes || '',
          isActive: true
        })));
      }

      // Handle money methods
      const moneyMethods: MoneyMethod[] = [];
      if (methodsResult.status === 'fulfilled' && methodsResult.value.data) {
        moneyMethods.push(...methodsResult.value.data.map(method => {
          // Map database categories back to frontend categories
          let frontendCategory = method.category;
          if (method.category === 'pvm') frontendCategory = 'bossing';
          if (method.category === 'merching') frontendCategory = 'other';
          
          return {
            id: method.id,
            name: method.name,
            character: method.character,
            gpHour: method.gp_hour || 0,
            clickIntensity: method.click_intensity as MoneyMethod['clickIntensity'],
            requirements: method.requirements || '',
            notes: method.notes || '',
            category: frontendCategory as MoneyMethod['category']
          };
        }));
      }

      // Handle purchase goals
      const purchaseGoals: PurchaseGoal[] = [];
      if (goalsResult.status === 'fulfilled' && goalsResult.value.data) {
        purchaseGoals.push(...goalsResult.value.data.map(goal => {
          // Map database categories back to frontend categories
          let frontendCategory = goal.category;
          if (goal.category === 'misc') frontendCategory = 'materials';
          
          return {
            id: goal.id,
            name: goal.name,
            currentPrice: goal.current_price || 0,
            targetPrice: goal.target_price || undefined,
            quantity: goal.quantity || 1,
            priority: goal.priority as PurchaseGoal['priority'],
            category: frontendCategory as PurchaseGoal['category'],
            notes: goal.notes || '',
            imageUrl: goal.image_url || ''
          };
        }));
      }

      // Handle bank items
      const bankData: Record<string, BankItem[]> = {};
      if (bankItemsResult.status === 'fulfilled' && bankItemsResult.value.data) {
        bankItemsResult.value.data.forEach(item => {
          if (!bankData[item.character]) {
            bankData[item.character] = [];
          }
          
          // Map database categories back to frontend categories
          let frontendCategory = item.category;
          if (item.category === 'consumables' && !['stackable', 'gear'].includes(item.category)) {
            frontendCategory = 'materials';
          }
          
          bankData[item.character].push({
            id: item.id,
            name: item.name,
            quantity: item.quantity || 0,
            estimatedPrice: item.estimated_price || 0,
            category: frontendCategory as BankItem['category'],
            character: item.character
          });
        });
      }

      const hoursPerDay = 10; // Default value

      console.log('Cloud load completed successfully');
      console.log('Loaded data:', { characters, moneyMethods, purchaseGoals, bankData });
      
      return {
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay
      };

    } catch (error) {
      console.error('Cloud load failed:', error);
      throw error;
    }
  }
}
