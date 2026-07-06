import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatGoldValue } from '@/lib/utils';
import type { WealthSnapshot } from '@/services/wealthHistory';

interface WealthHistoryChartProps {
  history: WealthSnapshot[];
  onSnapshot: () => void;
}

type Range = '7d' | '30d' | 'all';
const RANGES: { key: Range; label: string; days: number | null }[] = [
  { key: '7d', label: '7 dias', days: 7 },
  { key: '30d', label: '30 dias', days: 30 },
  { key: 'all', label: 'Tudo', days: null },
];

// DD/MM pro eixo/tooltip a partir de YYYY-MM-DD (sem timezone shift).
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function WealthHistoryChart({ history, onSnapshot }: WealthHistoryChartProps) {
  const [range, setRange] = useState<Range>('30d');

  const sorted = useMemo(
    () => [...(history || [])].sort((a, b) => a.date.localeCompare(b.date)),
    [history],
  );

  const data = useMemo(() => {
    const cfg = RANGES.find((r) => r.key === range)!;
    const pick = cfg.days == null ? sorted : sorted.slice(-cfg.days);
    return pick.map((s) => ({ date: shortDate(s.date), total: s.total, full: s.date }));
  }, [sorted, range]);

  const latest = sorted[sorted.length - 1];
  const first = data[0];
  const delta = latest && first ? latest.total - first.total : 0;
  const deltaPct = first && first.total > 0 ? (delta / first.total) * 100 : 0;
  const deltaUp = delta >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-cyan-500" />
            Histórico da riqueza
          </span>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    range === r.key
                      ? 'bg-cyan-500 text-white'
                      : 'bg-transparent text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={onSnapshot} title="Grava um ponto no histórico com o valor atual">
              Salvar snapshot
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length < 1 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Ainda sem histórico. Um ponto é gravado automático por dia — ou clique em <b>Salvar snapshot</b> agora.
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-end gap-3">
              <span className="text-2xl font-bold text-cyan-600">{formatGoldValue(latest.total)}</span>
              {sorted.length < 2 ? (
                <span className="pb-0.5 text-sm font-normal text-muted-foreground">
                  1º ponto gravado — a tendência aparece a partir do 2º dia.
                </span>
              ) : (
                <span className={`pb-0.5 text-sm font-semibold ${deltaUp ? 'text-green-600' : 'text-red-500'}`}>
                  {deltaUp ? '▲' : '▼'} {formatGoldValue(Math.abs(delta))} ({deltaPct.toFixed(1)}%)
                  <span className="ml-1 font-normal text-muted-foreground">no período</span>
                </span>
              )}
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={data} margin={{ left: 8, right: 12, top: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="wealthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v: number) => formatGoldValue(v)}
                    domain={['dataMin', 'dataMax']}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${formatGoldValue(v)} gp`, 'Total']}
                    labelFormatter={(l) => `Dia ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} fill="url(#wealthFill)" dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} />

                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
