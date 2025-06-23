
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Coins, Target } from "lucide-react";

interface WealthSummaryProps {
  totalBankValue: number;
  totalGoalValue: number;
  formatGP: (amount: number) => string;
}

export function WealthSummary({ totalBankValue, totalGoalValue, formatGP }: WealthSummaryProps) {
  const wealthRatio = totalBankValue > 0 ? (totalBankValue / (totalGoalValue || 1)) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Total Bank Value
              </h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatGP(totalBankValue)} GP
              </p>
            </div>
            <Coins className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Total Goal Value
              </h3>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {formatGP(totalGoalValue)} GP
              </p>
            </div>
            <Target className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Wealth Progress
              </h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {wealthRatio.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
