
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Starting cloud save for user:', user.id);

      // Clear existing data first
      await Promise.all([
        supabase.from('characters').delete().eq('user_id', user.id),
        supabase.from('money_methods').delete().eq('user_id', user.id),
        supabase.from('purchase_goals').delete().eq('user_id', user.id),
        supabase.from('bank_items').delete().eq('user_id', user.id)
      ]);

      // Save characters
      if (characters.length > 0) {
        const { error: charactersError } = await supabase.from('characters').insert(
          characters.map(char => ({
            user_id: user.id,
            name: char.name,
            type: char.type,
            combat_level: char.combatLevel,
            total_level: char.totalLevel,
            bank: char.bank,
            notes: char.notes || ''
          }))
        );
        if (charactersError) {
          console.error('Error saving characters:', charactersError);
          throw charactersError;
        }
      }

      // Save money methods
      if (moneyMethods.length > 0) {
        const { error: methodsError } = await supabase.from('money_methods').insert(
          moneyMethods.map(method => ({
            user_id: user.id,
            name: method.name,
            character: method.character,
            gp_hour: method.gpHour,
            click_intensity: method.clickIntensity,
            requirements: method.requirements || '',
            notes: method.notes || '',
            category: method.category
          }))
        );
        if (methodsError) {
          console.error('Error saving money methods:', methodsError);
          throw methodsError;
        }
      }

      // Save purchase goals
      if (purchaseGoals.length > 0) {
        const { error: goalsError } = await supabase.from('purchase_goals').insert(
          purchaseGoals.map(goal => ({
            user_id: user.id,
            name: goal.name,
            current_price: goal.currentPrice,
            target_price: goal.targetPrice,
            quantity: goal.quantity,
            priority: goal.priority,
            category: goal.category,
            notes: goal.notes || '',
            image_url: goal.imageUrl || ''
          }))
        );
        if (goalsError) {
          console.error('Error saving purchase goals:', goalsError);
          throw goalsError;
        }
      }

      // Save bank items
      const allBankItems = Object.values(bankData).flat();
      if (allBankItems.length > 0) {
        const { error: bankError } = await supabase.from('bank_items').insert(
          allBankItems.map(item => ({
            user_id: user.id,
            name: item.name,
            quantity: item.quantity,
            estimated_price: item.estimatedPrice,
            category: item.category,
            character: item.character
          }))
        );
        if (bankError) {
          console.error('Error saving bank items:', bankError);
          throw bankError;
        }
      }

      console.log('Cloud save completed successfully');
      return true;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      throw error;
    }
  }

  static async loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Loading cloud data for user:', user.id);

      // Load all data in parallel
      const [charactersResult, methodsResult, goalsResult, bankResult] = await Promise.all([
        supabase.from('characters').select('*').eq('user_id', user.id),
        supabase.from('money_methods').select('*').eq('user_id', user.id),
        supabase.from('purchase_goals').select('*').eq('user_id', user.id),
        supabase.from('bank_items').select('*').eq('user_id', user.id)
      ]);

      // Transform characters
      const characters: Character[] = (charactersResult.data || []).map(char => ({
        id: char.id,
        name: char.name,
        type: char.type as Character['type'],
        combatLevel: char.combat_level,
        totalLevel: char.total_level,
        bank: char.bank,
        notes: char.notes || '',
        isActive: true
      }));

      // Transform money methods
      const moneyMethods: MoneyMethod[] = (methodsResult.data || []).map(method => ({
        id: method.id,
        name: method.name,
        character: method.character,
        gpHour: method.gp_hour,
        clickIntensity: method.click_intensity as MoneyMethod['clickIntensity'],
        requirements: method.requirements || '',
        notes: method.notes || '',
        category: method.category as MoneyMethod['category']
      }));

      // Transform purchase goals
      const purchaseGoals: PurchaseGoal[] = (goalsResult.data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        currentPrice: goal.current_price,
        targetPrice: goal.target_price,
        quantity: goal.quantity,
        priority: goal.priority as PurchaseGoal['priority'],
        category: goal.category as PurchaseGoal['category'],
        notes: goal.notes || '',
        imageUrl: goal.image_url || ''
      }));

      // Transform bank items
      const bankItems = (bankResult.data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        estimatedPrice: item.estimated_price,
        category: item.category as BankItem['category'],
        character: item.character
      }));

      // Group bank items by character
      const bankData: Record<string, BankItem[]> = {};
      bankItems.forEach(item => {
        if (!bankData[item.character]) {
          bankData[item.character] = [];
        }
        bankData[item.character].push(item);
      });

      console.log('Cloud data loaded successfully');
      return {
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay: 10
      };
    } catch (error) {
      console.error('Error loading from cloud:', error);
      throw error;
    }
  }
}
