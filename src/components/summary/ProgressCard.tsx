
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
    <div className="osrs-card p-6 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-600">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-amber-800 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
          <TrendingUp className="h-6 w-6" />
          📈 Overall Progress (Based on Gold)
        </h3>
        <p className="text-sm text-amber-600 mt-1" style={{ fontFamily: 'Cinzel, serif' }}>
          Progress is calculated using Coins + Platinum Tokens only
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>
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
          <div className="text-center p-4 bg-yellow-50 border-2 border-yellow-600 rounded">
            <p className="text-3xl font-bold text-yellow-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalGoldValue)} GP
            </p>
            <p className="text-sm text-yellow-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Current Gold</p>
          </div>
          <div className="text-center p-4 bg-purple-50 border-2 border-purple-600 rounded">
            <p className="text-3xl font-bold text-purple-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(Math.max(0, totalGoalsValue - totalGoldValue))} GP
            </p>
            <p className="text-sm text-purple-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Still Needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
