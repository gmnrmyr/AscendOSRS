import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatGoldValue } from '@/lib/utils';
import { diffItems, diffItemsByChar, diffChars, type WealthSnapshot, type ItemMover } from '@/services/wealthHistory';

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

// Rótulo curto da causa do movimento de um item.
const REASON: Record<ItemMover['reason'], { label: string; cls: string }> = {
  price: { label: 'preço',     cls: 'bg-amber-500/15 text-amber-600' },
  qty:   { label: 'qtd',       cls: 'bg-blue-500/15 text-blue-600' },
  both:  { label: 'preço+qtd', cls: 'bg-purple-500/15 text-purple-600' },
  new:   { label: 'novo',      cls: 'bg-green-500/15 text-green-600' },
  gone:  { label: 'saiu',      cls: 'bg-gray-500/15 text-muted-foreground' },
};

// Explica no hover o que rolou (preço de X→Y, qtd de X→Y).
function moverTitle(m: ItemMover): string {
  const money = `${m.prevValue.toLocaleString()} → ${m.currValue.toLocaleString()} gp`;
  const qty = m.prevQty !== m.currQty ? `  · qtd ${m.prevQty.toLocaleString()} → ${m.currQty.toLocaleString()}` : '';
  const unit = m.prevUnit !== m.currUnit ? `  · preço ${m.prevUnit.toLocaleString()} → ${m.currUnit.toLocaleString()} cada` : '';
  return money + qty + unit;
}

// Linha de um item que se moveu (compartilhada entre a visão agregada e a por conta).
function MoverRow({ m }: { m: ItemMover }) {
  const up = m.deltaValue >= 0;
  return (
    <li className="flex items-center gap-2 text-sm cursor-help" title={moverTitle(m)}>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${REASON[m.reason].cls}`}>
        {REASON[m.reason].label}
      </span>
      <span className="flex-1 truncate">{m.name}</span>
      <span className={`shrink-0 tabular-nums font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
        {up ? '+' : '−'}{formatGoldValue(Math.abs(m.deltaValue))}
      </span>
      <span className="shrink-0 w-14 text-right tabular-nums text-xs text-muted-foreground">
        {up ? '+' : '−'}{Math.abs(m.deltaPct).toFixed(1)}%
      </span>
    </li>
  );
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

  // "O que mudou": diff dos 2 últimos snapshots. Prefere item POR CONTA;
  // cai pra item agregado (snapshots antigos); por fim só o total por conta.
  const movers = useMemo(() => {
    if (sorted.length < 2) return null;
    const prev = sorted[sorted.length - 2];
    const curr = sorted[sorted.length - 1];
    const byChar = diffItemsByChar(prev, curr);
    if (byChar?.length) {
      return { kind: 'byChar' as const, prev, curr, groups: byChar.map((g) => ({ ...g, movers: g.movers.slice(0, 4) })) };
    }
    const items = diffItems(prev, curr).slice(0, 6);
    if (items.length) return { kind: 'item' as const, prev, curr, items };
    const chars = diffChars(prev, curr).slice(0, 6);
    return chars.length ? { kind: 'char' as const, prev, curr, chars } : null;
  }, [sorted]);

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
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    axisLine={false}
                    tickLine={false}
                    width={92}
                    tickCount={4}
                    tickFormatter={(v: number) => Math.round(v).toLocaleString('pt-BR')}
                    domain={['dataMin', 'dataMax']}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString()} gp`, 'Total']}
                    labelFormatter={(l) => `Dia ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} fill="url(#wealthFill)" dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} />

                </AreaChart>
              </ResponsiveContainer>
            </div>

            {movers && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">O que mudou</h4>
                  <span className="text-xs text-muted-foreground">
                    {shortDate(movers.prev.date)} → {shortDate(movers.curr.date)}
                    {movers.kind === 'char' && ' · por conta'}
                  </span>
                </div>

                {movers.kind === 'byChar' ? (
                  <div className="space-y-3">
                    {movers.groups.map((g) => {
                      const up = g.delta >= 0;
                      return (
                        <div key={g.char}>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.char}</span>
                            <span className={`text-xs tabular-nums font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
                              {up ? '+' : '−'}{formatGoldValue(Math.abs(g.delta))}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {g.movers.map((m) => <MoverRow key={m.name} m={m} />)}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : movers.kind === 'item' ? (
                  <ul className="space-y-1">
                    {movers.items.map((m) => <MoverRow key={m.name} m={m} />)}
                  </ul>
                ) : (
                  <ul className="space-y-1">
                    {movers.chars.map((c) => {
                      const up = c.delta >= 0;
                      return (
                        <li key={c.name} className="flex items-center gap-2 text-sm cursor-help" title={`${c.prev.toLocaleString()} → ${c.curr.toLocaleString()} gp`}>
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className={`shrink-0 tabular-nums font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                            {up ? '+' : '−'}{formatGoldValue(Math.abs(c.delta))}
                          </span>
                          <span className="shrink-0 w-14 text-right tabular-nums text-xs text-muted-foreground">
                            {up ? '+' : '−'}{Math.abs(c.deltaPct).toFixed(1)}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {movers.kind === 'char' && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Detalhe por item aparece quando os dois dias comparados já tiverem a foto dos itens.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
