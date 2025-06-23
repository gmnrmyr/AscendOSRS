
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

      // Clear existing data for this user
      await Promise.all([
        supabase.from('characters').delete().eq('user_id', user.id),
        supabase.from('money_methods').delete().eq('user_id', user.id),
        supabase.from('purchase_goals').delete().eq('user_id', user.id),
        supabase.from('bank_items').delete().eq('user_id', user.id)
      ]);

      // Save characters
      if (characters.length > 0) {
        const charactersToSave = characters.map(char => ({
          user_id: user.id,
          name: char.name,
          type: char.type,
          combat_level: char.combatLevel,
          total_level: char.totalLevel,
          bank: char.bank,
          notes: char.notes || ''
        }));

        const { error: charError } = await supabase
          .from('characters')
          .insert(charactersToSave);

        if (charError) {
          console.error('Characters save error:', charError);
          throw charError;
        }
      }

      // Save money methods
      if (moneyMethods.length > 0) {
        const methodsToSave = moneyMethods.map(method => ({
          user_id: user.id,
          name: method.name,
          character: method.character,
          gp_hour: method.gpHour,
          click_intensity: method.clickIntensity,
          requirements: method.requirements || '',
          notes: method.notes || '',
          category: method.category
        }));

        const { error: methodsError } = await supabase
          .from('money_methods')
          .insert(methodsToSave);

        if (methodsError) {
          console.error('Money methods save error:', methodsError);
          throw methodsError;
        }
      }

      // Save purchase goals
      if (purchaseGoals.length > 0) {
        const goalsToSave = purchaseGoals.map(goal => ({
          user_id: user.id,
          name: goal.name,
          current_price: goal.currentPrice,
          target_price: goal.targetPrice,
          quantity: goal.quantity,
          priority: goal.priority,
          category: goal.category,
          notes: goal.notes || '',
          image_url: goal.imageUrl || ''
        }));

        const { error: goalsError } = await supabase
          .from('purchase_goals')
          .insert(goalsToSave);

        if (goalsError) {
          console.error('Purchase goals save error:', goalsError);
          throw goalsError;
        }
      }

      // Save bank items
      const allBankItems: any[] = [];
      Object.entries(bankData).forEach(([character, items]) => {
        items.forEach(item => {
          allBankItems.push({
            user_id: user.id,
            character: character,
            name: item.name,
            quantity: item.quantity,
            estimated_price: item.estimatedPrice,
            category: item.category
          });
        });
      });

      if (allBankItems.length > 0) {
        const { error: bankError } = await supabase
          .from('bank_items')
          .insert(allBankItems);

        if (bankError) {
          console.error('Bank items save error:', bankError);
          throw bankError;
        }
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

      // Load characters
      const { data: charactersData, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id);

      if (charError) throw charError;

      // Load money methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('money_methods')
        .select('*')
        .eq('user_id', user.id);

      if (methodsError) throw methodsError;

      // Load purchase goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('purchase_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Load bank items
      const { data: bankItemsData, error: bankError } = await supabase
        .from('bank_items')
        .select('*')
        .eq('user_id', user.id);

      if (bankError) throw bankError;

      // Transform data back to frontend format
      const characters: Character[] = (charactersData || []).map(char => ({
        id: char.id,
        name: char.name,
        type: char.type as Character['type'],
        combatLevel: char.combat_level || 0,
        totalLevel: char.total_level || 0,
        bank: char.bank || 0,
        notes: char.notes || '',
        isActive: true // Default to active when loading from cloud
      }));

      const moneyMethods: MoneyMethod[] = (methodsData || []).map(method => ({
        id: method.id,
        name: method.name,
        character: method.character,
        gpHour: method.gp_hour || 0,
        clickIntensity: method.click_intensity as MoneyMethod['clickIntensity'],
        requirements: method.requirements || '',
        notes: method.notes || '',
        category: method.category as MoneyMethod['category']
      }));

      const purchaseGoals: PurchaseGoal[] = (goalsData || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        currentPrice: goal.current_price || 0,
        targetPrice: goal.target_price,
        quantity: goal.quantity || 1,
        priority: goal.priority as PurchaseGoal['priority'],
        category: goal.category as PurchaseGoal['category'],
        notes: goal.notes || '',
        imageUrl: goal.image_url || ''
      }));

      // Rebuild bank data structure
      const bankData: Record<string, BankItem[]> = {};
      (bankItemsData || []).forEach(item => {
        if (!bankData[item.character]) {
          bankData[item.character] = [];
        }
        bankData[item.character].push({
          id: item.id,
          name: item.name,
          quantity: item.quantity || 0,
          estimatedPrice: item.estimated_price || 0,
          category: item.category as BankItem['category'],
          character: item.character
        });
      });

      const hoursPerDay = 10; // Default value since we removed user_settings

      console.log('Cloud load completed successfully');
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
