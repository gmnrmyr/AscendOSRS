import { AlertTriangle, BadgeDollarSign, ExternalLink } from 'lucide-react';
import { formatGoldValue } from '@/lib/utils';
import type { GearSellAdvice } from '@/services/gearAdvisor';

interface GearAdvicePanelProps {
  advice: GearSellAdvice[];
  goalCost?: number;
}

export function GearAdvicePanel({ advice, goalCost }: GearAdvicePanelProps) {
  if (advice.length === 0) return null;
  const saleValue = advice.reduce((sum, entry) => sum + entry.totalValue, 0);

  return (
    <div className="space-y-2 border-t border-border pt-3">
      {advice.map((entry) => {
        const direct = entry.level === 'sell';
        return (
          <div
            key={entry.relationId}
            className={`rounded-md border p-2.5 text-xs ${direct
              ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/25'
              : 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/25'}`}
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 font-bold ${direct
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-amber-700 dark:text-amber-300'}`}
              >
                {direct ? <BadgeDollarSign className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {direct ? 'Sell' : 'Review sale'} · {formatGoldValue(entry.totalValue)}
              </span>
              <a
                href={entry.sources[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:underline"
                title={`Relação BIS revisada em ${entry.reviewedAt}`}
              >
                BIS: {entry.betterName}<ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="font-medium text-foreground">
              {entry.items.map((item) => `${item.name} (${formatGoldValue(item.value)})`).join(' + ')}
            </p>
            <p className="mt-1 text-muted-foreground">{entry.reason}</p>
            {entry.caveat && <p className="mt-1 text-muted-foreground">⚠ {entry.caveat}</p>}
          </div>
        );
      })}
      {typeof goalCost === 'number' && (
        <div className="flex items-center justify-between rounded-md bg-muted/60 px-2.5 py-2 text-xs">
          <span className="text-muted-foreground">Custo após possíveis vendas</span>
          <strong className="font-mono text-foreground">{formatGoldValue(Math.max(0, goalCost - saleValue))}</strong>
        </div>
      )}
    </div>
  );
}
