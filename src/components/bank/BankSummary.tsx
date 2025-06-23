
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";

interface BankSummaryProps {
  totalBankValue: number;
  totalGoldValue: number;
  charactersCount: number;
  formatGP: (amount: number) => string;
}

export function BankSummary({ totalBankValue, totalGoldValue, charactersCount, formatGP }: BankSummaryProps) {
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
