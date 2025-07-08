
import { TrendingUp } from "lucide-react";

interface ProgressCardProps {
  totalGoldValue: number;
  totalGoalsValue: number;
  completionPercentage: number;
  formatGP: (amount: number) => string;
}

export function ProgressCard({
  totalGoldValue,
  totalGoalsValue,
  completionPercentage,
  formatGP
}: ProgressCardProps) {
  return (
    <div className="osrs-card p-6 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-600 dark:border-amber-400">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
          <TrendingUp className="h-6 w-6" />
          📈 Overall Progress (Based on Gold)
        </h3>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1" style={{ fontFamily: 'Cinzel, serif' }}>
          Progress is calculated using Coins + Platinum Tokens only
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>
            Goal Completion
          </span>
          <span className="osrs-badge text-base">
            {completionPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="osrs-progress h-4">
          <div 
            className="osrs-progress-fill" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-600 dark:border-yellow-400 rounded">
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalGoldValue)} GP
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Current Gold</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-600 dark:border-purple-400 rounded">
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(Math.max(0, totalGoalsValue - totalGoldValue))} GP
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Still Needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
