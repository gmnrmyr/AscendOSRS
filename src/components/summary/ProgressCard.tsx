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
    <div className="osrs-card p-6">
      <div className="mb-4">
        <h3 className="osrs-title text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
          Overall Progress
        </h3>
        <p className="osrs-muted text-sm mt-1">Coins + platinum tokens vs. total goals value</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="osrs-label text-base">Goal Completion</span>
          <span className="osrs-badge text-base">{completionPercentage.toFixed(1)}%</span>
        </div>
        <div className="osrs-progress h-4">
          <div className="osrs-progress-fill" style={{ width: `${completionPercentage}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="osrs-inset text-center p-4">
            <p className="osrs-gp text-2xl">{formatGP(totalGoldValue)} gp</p>
            <p className="osrs-label text-sm mt-1">Current Gold</p>
          </div>
          <div className="osrs-inset text-center p-4">
            <p className="osrs-value text-2xl">{formatGP(Math.max(0, totalGoalsValue - totalGoldValue))} gp</p>
            <p className="osrs-label text-sm mt-1">Still Needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
