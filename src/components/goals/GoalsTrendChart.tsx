// Mini-gráfico do CUSTO TOTAL dos goals ao longo do tempo — mercado da Wiki
// (goalHistory, cache 12h). Queda = goals mais baratos = bom, por isso o delta
// invertido: cair fica verde.

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatGoldValue } from '@/lib/utils';
import { fetchGoalHistory, type GoalCostHistory } from '@/services/goalHistory';
import type { PurchaseGoal } from '@/hooks/useAppData';

type Range = '30d' | '90d' | '1a';
const RANGES: { key: Range; label: string; days: number }[] = [
  { key: '30d', label: '30 dias', days: 30 },
  { key: '90d', label: '90 dias', days: 90 },
  { key: '1a', label: '1 ano', days: 365 },
];

// YYYY-MM-DD local, andando `offset` dias pra trás a partir de hoje.
function dayKeyAgo(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function GoalsTrendChart({ goals }: { goals: PurchaseGoal[] }) {
  const [range, setRange] = useState<Range>('30d');
  const [hist, setHist] = useState<GoalCostHistory | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (goals.length === 0) return;
    let alive = true;
    fetchGoalHistory(goals)
      .then((h) => { if (alive) setHist(h); })
      .catch((e) => { console.warn('Histórico dos goals indisponível:', e); if (alive) setFailed(true); });
    return () => { alive = false; };
    // Refaz só quando a LISTA muda (add/remove) — reprice não mexe na série.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals.length]);

  const data = useMemo(() => {
    if (!hist) return [];
    const days = RANGES.find((r) => r.key === range)!.days;
    const out: { date: string; full: string; cost: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const full = dayKeyAgo(i);
      out.push({ date: shortDate(full), full, cost: hist.costAt(full) });
    }
    return out;
  }, [hist, range]);

  if (goals.length === 0 || failed || (hist && hist.itemsWithHistory === 0)) return null;

  const first = data[0];
  const last = data[data.length - 1];
  const delta = first && last ? last.cost - first.cost : 0;
  const deltaPct = first && first.cost > 0 ? (delta / first.cost) * 100 : 0;
  const cheaper = delta <= 0;

  return (
    <Card className="osrs-card">
      <CardContent className="p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-semibold">Custo dos goals ao longo do tempo</span>
          </div>
          <div className="flex rounded-md border border-border overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r.key ? 'bg-rose-500 text-white' : 'bg-transparent text-muted-foreground hover:bg-accent'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {!hist ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Carregando mercado dos goals…</div>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xl font-bold text-rose-600">{formatGoldValue(last.cost)}</span>
              <span className={`text-sm font-semibold ${cheaper ? 'text-green-600' : 'text-red-500'}`}>
                {cheaper ? '▼' : '▲'} {formatGoldValue(Math.abs(delta))} ({Math.abs(deltaPct).toFixed(1)}%)
                <span className="ml-1 font-normal text-muted-foreground">
                  no período {cheaper ? '· goals mais baratos' : '· goals mais caros'}
                </span>
              </span>
              <span
                className="text-xs text-muted-foreground"
                title="Goals sem histórico de mercado (conquistas, untradeables) entram pelo custo de hoje, constante"
              >
                {hist.itemsWithHistory}/{hist.itemsTotal} com preço histórico
              </span>
            </div>
            <div style={{ width: '100%', height: 130 }}>
              <ResponsiveContainer>
                <AreaChart data={data} margin={{ left: 8, right: 12, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goalsCostFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} axisLine={false} tickLine={false} minTickGap={28} />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tickCount={3}
                    tickFormatter={(v: number) => formatGoldValue(v)}
                    domain={['dataMin', 'dataMax']}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${Math.round(v).toLocaleString()} gp`, 'Custo dos goals']}
                    labelFormatter={(l) => `Dia ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="cost" stroke="#e11d48" strokeWidth={2} fill="url(#goalsCostFill)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
