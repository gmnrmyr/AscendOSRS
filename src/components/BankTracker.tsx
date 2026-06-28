
import React from 'react';
import { Character, BankItem } from '@/hooks/useAppData';
import { IntegratedBankManager } from '@/components/bank/IntegratedBankManager';
import { BankSummary } from '@/components/bank/BankSummary';
import { BankOverview } from '@/components/bank/BankOverview';

interface BankTrackerProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
  setCharacters: (characters: Character[]) => void;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
}

export function BankTracker({
  characters,
  bankData,
  setCharacters,
  setBankData
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

      <IntegratedBankManager
        characters={characters}
        bankData={bankData}
        setCharacters={setCharacters}
        setBankData={setBankData}
      />
    </div>
  );
}
