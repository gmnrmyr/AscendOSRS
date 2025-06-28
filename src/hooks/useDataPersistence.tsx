
import { useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";

interface AppData {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
}

export function useDataPersistence(data: AppData) {
  const { user } = useAuth();

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      characters: data.characters,
      moneyMethods: data.moneyMethods,
      purchaseGoals: data.purchaseGoals,
      bankData: data.bankData,
      hoursPerDay: data.hoursPerDay
    };
    localStorage.setItem('osrs-dashboard-data', JSON.stringify(dataToSave));
  }, [data.characters, data.moneyMethods, data.purchaseGoals, data.bankData, data.hoursPerDay]);

  // Auto-save to cloud for authenticated users (debounced)
  useEffect(() => {
    if (!user) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        console.log('Auto-saving to cloud...');
        const { CloudDataService } = await import('@/services/cloudDataService');
        await CloudDataService.saveUserData(
          data.characters,
          data.moneyMethods,
          data.purchaseGoals,
          data.bankData,
          data.hoursPerDay
        );
        console.log('Auto-save to cloud completed');
      } catch (error) {
        console.error('Auto-save to cloud failed:', error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [user, data.characters, data.moneyMethods, data.purchaseGoals, data.bankData, data.hoursPerDay]);
}
