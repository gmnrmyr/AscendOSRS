import { useEffect } from 'react';
import { saveServerData } from '@/services/localStore';

interface AppData {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  wealthHistory?: any[]; // série histórica da riqueza (persiste junto)
  flipping?: { favorites: any[]; journal: any[] }; // favoritos + journal de flips
  settings?: { runiteAsGold: boolean; goldMainOnly: boolean }; // decisões do usuário (toggles)
  enabled?: boolean; // só salva depois do load inicial (evita gravar defaults por cima do disco)
}

export function useDataPersistence(data: AppData) {
  const enabled = data.enabled ?? true;

  const snapshot = {
    characters: data.characters,
    moneyMethods: data.moneyMethods,
    purchaseGoals: data.purchaseGoals,
    bankData: data.bankData,
    hoursPerDay: data.hoursPerDay,
    wealthHistory: data.wealthHistory ?? [],
    flipping: data.flipping ?? { favorites: [], journal: [] },
    settings: data.settings ?? { runiteAsGold: false, goldMainOnly: false },
  };

  // Cache rápido no localStorage (fallback se o server estiver offline)
  useEffect(() => {
    if (!enabled) return;
    localStorage.setItem('osrs-dashboard-data', JSON.stringify(snapshot));
  }, [enabled, data.characters, data.moneyMethods, data.purchaseGoals, data.bankData, data.hoursPerDay, data.wealthHistory, data.flipping, data.settings]);

  // Fonte de verdade: salva em disco no Mac (debounced). Funciona de qualquer origin.
  useEffect(() => {
    if (!enabled) return;
    const timeoutId = setTimeout(async () => {
      try {
        await saveServerData(snapshot);
      } catch (error) {
        console.error('Falha ao salvar no disco (server). Mantido no localStorage.', error);
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(timeoutId);
  }, [enabled, data.characters, data.moneyMethods, data.purchaseGoals, data.bankData, data.hoursPerDay, data.wealthHistory, data.flipping, data.settings]);
}
