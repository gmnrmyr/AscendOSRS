
import React from 'react';
import { Character, BankItem } from '@/hooks/useAppData';
import { IntegratedBankManager } from '@/components/bank/IntegratedBankManager';
import { BankSummary } from '@/components/bank/BankSummary';
import { BankOverview } from '@/components/bank/BankOverview';
import { WealthHistoryChart } from '@/components/bank/WealthHistoryChart';
import type { WealthSnapshot } from '@/services/wealthHistory';

interface BankTrackerProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
  setCharacters: (characters: Character[]) => void;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
  wealthHistory: WealthSnapshot[];
  recordWealthSnapshot: () => void;
}

export function BankTracker({
  characters,
  bankData,
  setCharacters,
  setBankData,
  wealthHistory,
  recordWealthSnapshot
}: BankTrackerProps) {
  return (
    <div className="space-y-6">
      <BankSummary
        characters={characters}
        bankData={bankData}
      />

      <BankOverview
        characters={characters}
        bankData={bankData}
      />

      <WealthHistoryChart
        history={wealthHistory}
        onSnapshot={recordWealthSnapshot}
      />

      <IntegratedBankManager
        characters={characters}
        bankData={bankData}
        setCharacters={setCharacters}
        setBankData={setBankData}
      />
    </div>
  );
}
