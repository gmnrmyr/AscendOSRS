import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, DollarSign } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';

interface BankSummaryProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
}

export function BankSummary({ characters, bankData }: BankSummaryProps) {
  // Calculate total value (items + gold + platinum tokens)
  const totalValue = Object.values(bankData).reduce((sum, items) => {
    return sum + items.reduce((itemSum, item) => {
      if (item.name.toLowerCase().includes('coin')) {
        return itemSum + Math.floor(item.quantity || 0);
      } else if (item.name.toLowerCase().includes('platinum')) {
        return itemSum + (Math.floor(item.quantity || 0) * 1000);
      } else {
        return itemSum + (Math.floor(item.quantity || 0) * (item.estimatedPrice || 0));
      }
    }, 0);
  }, 0);

  // Calculate total gold value (coins + platinum tokens only)
  const totalGoldValue = Object.values(bankData).reduce((sum, items) => {
    return sum + items.reduce((itemSum, item) => {
      if (item.name.toLowerCase().includes('coin')) {
        return itemSum + Math.floor(item.quantity || 0);
      } else if (item.name.toLowerCase().includes('platinum')) {
        return itemSum + (Math.floor(item.quantity || 0) * 1000);
      }
      return itemSum;
    }, 0);
  }, 0);

  const formatGP = (amount: number) => {
    const safeAmount = Number(amount) || 0;
    
    if (safeAmount >= 1000000000) {
      return `${(safeAmount / 1000000000).toFixed(1)}B`;
    } else if (safeAmount >= 1000000) {
      return `${(safeAmount / 1000000).toFixed(1)}M`;
    } else if (safeAmount >= 1000) {
      return `${(safeAmount / 1000).toFixed(0)}K`;
    }
    return safeAmount.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Total Bank Value */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Bank Value</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatGP(totalValue)}</div>
          <div className="text-xs text-gray-500 mt-1">Items + Gold + Platinum Tokens</div>
        </CardContent>
      </Card>

      {/* Total Gold Value */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Total Gold Value</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{formatGP(totalGoldValue)}</div>
          <div className="text-xs text-gray-500 mt-1">Gold Coins + Platinum Tokens</div>
        </CardContent>
      </Card>
    </div>
  );
}
