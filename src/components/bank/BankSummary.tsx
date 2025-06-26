
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";
import { Character, BankItem } from "@/hooks/useAppData";

interface BankSummaryProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
}

export function BankSummary({ characters, bankData }: BankSummaryProps) {
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

  const getTotalBankValue = () => {
    const total = Object.keys(bankData).reduce((sum, character) => {
      const items = bankData[character] || [];
      return sum + items.reduce((itemSum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.estimatedPrice) || 0;
        return itemSum + (quantity * price);
      }, 0);
    }, 0);
    return Number(total) || 0;
  };

  const getTotalGoldValue = () => {
    const total = Object.keys(bankData).reduce((sum, character) => {
      const items = bankData[character] || [];
      const coins = items.find(item => item.name.toLowerCase().includes('coin'))?.quantity || 0;
      const platTokens = items.find(item => item.name.toLowerCase().includes('platinum'))?.quantity || 0;
      return sum + Number(coins) + (Number(platTokens) * 1000);
    }, 0);
    return Number(total) || 0;
  };

  const totalBankValue = getTotalBankValue();
  const totalGoldValue = getTotalGoldValue();
  const charactersCount = characters.length;

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                Total Bank Value
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatGP(totalBankValue)} GP
              </p>
              <p className="text-amber-600 dark:text-amber-300">
                Across {charactersCount} characters
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                Total Gold Value
              </h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {formatGP(totalGoldValue)} GP
              </p>
              <p className="text-amber-600 dark:text-amber-300">
                Coins + Plat Tokens
              </p>
            </div>
            <Wallet className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
