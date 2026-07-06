
import { createContext, useContext, ReactNode } from 'react';
import { useAppData, type Character, type MoneyMethod, type PurchaseGoal, type BankItem } from '@/hooks/useAppData';
import type { WealthSnapshot } from '@/services/wealthHistory';

interface AppState {
  characters: Character[];
  moneyMethods: MoneyMethod[];
  purchaseGoals: PurchaseGoal[];
  bankData: Record<string, BankItem[]>;
  hoursPerDay: number;
  wealthHistory: WealthSnapshot[];
  setCharacters: (characters: Character[]) => void;
  setMoneyMethods: (methods: MoneyMethod[]) => void;
  setPurchaseGoals: (goals: PurchaseGoal[]) => void;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
  setHoursPerDay: (hours: number) => void;
  setAllData: (data: {
    characters: Character[];
    moneyMethods: MoneyMethod[];
    purchaseGoals: PurchaseGoal[];
    bankData: Record<string, BankItem[]>;
    hoursPerDay: number;
  }) => void;
  recordWealthSnapshot: () => void;
  refreshAllPrices: () => Promise<{ bankChanged: number; goalsChanged: number }>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const appData = useAppData();

  return (
    <AppStateContext.Provider value={appData}>
      {children}
    </AppStateContext.Provider>
  );
};
