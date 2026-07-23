import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatGoldValue } from '@/lib/utils';
import { moversAt, type WealthSnapshot, type ItemMover } from '@/services/wealthHistory';
import { projectionRate, projectedSeries, daysBetween, addDays, todayKey, bondSchedule, BOND_ID } from '@/services/projection';
import { priceOf } from '@/services/priceEngine';
import { fetchGoalHistory, type GoalCostHistory } from '@/services/goalHistory';
import { useAppState } from '@/components/AppStateProvider';

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

// Horizonte da projeção futura (hoje -> +N meses). 0 = desligada.
const FUTURES: { months: number; label: string }[] = [
  { months: 0, label: 'off' },
  { months: 1, label: '1m' },
  { months: 3, label: '3m' },
  { months: 6, label: '6m' },
  { months: 12, label: '1a' },
];

// Paleta pras linhas por conta (ordem = riqueza; cores seguras pra CVD).
const CHAR_COLORS = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9', '#D55E00'];

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

// Ponto do gráfico: chaves fixas + uma chave "c:<conta>" por conta no modo por conta.
// `bond` só existe (não-null) nos dias FUTUROS com compra de bond: é o y da
// linha esperada naquele dia, e vira o marcador vermelho; `bondChars` diz quem.
type ChartPoint = {
  date: string; full: string;
  total: number | null; dayPct: number | null; expected: number | null;
  bond: number | null; bondChars?: string[];
  goals: number | null; goalPct: number | null;
} & Record<`c:${string}`, number | null>;

export function WealthHistoryChart({ history, onSnapshot }: WealthHistoryChartProps) {
  const [range, setRange] = useState<Range>('30d');
  const [byCharMode, setByCharMode] = useState(false);
  const [futureMonths, setFutureMonths] = useState(0);
  const { characters, moneyMethods, hoursPerDay, purchaseGoals } = useAppState();

  // Linha do custo dos goals: liga sob demanda; a série vem do mercado da Wiki
  // (cache 12h no goalHistory), nada é gravado no save.
  const [showGoals, setShowGoals] = useState(false);
  const [goalHist, setGoalHist] = useState<GoalCostHistory | null>(null);
  const [goalsLoading, setGoalsLoading] = useState(false);
  useEffect(() => {
    if (!showGoals || goalHist || goalsLoading || purchaseGoals.length === 0) return;
    setGoalsLoading(true);
    fetchGoalHistory(purchaseGoals)
      .then(setGoalHist)
      .catch((e) => console.warn('Histórico dos goals indisponível:', e))
      .finally(() => setGoalsLoading(false));
  }, [showGoals, goalHist, goalsLoading, purchaseGoals]);

  const sorted = useMemo(
    () => [...(history || [])].sort((a, b) => a.date.localeCompare(b.date)),
    [history],
  );

  // Ritmo esperado (gp/dia) dos métodos ativos nas horas planejadas.
  const rate = useMemo(
    () => projectionRate(characters, moneyMethods, hoursPerDay),
    [characters, moneyMethods, hoursPerDay],
  );

  // Preço vivo do bond (priceEngine já carregado pelo app). 0 = indisponível.
  const bondPrice = priceOf(BOND_ID) || 0;

  // Contas presentes no histórico, da mais rica pra mais pobre (no último dia).
  const charNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of sorted) for (const n of Object.keys(s.byChar || {})) names.add(n);
    const last = sorted[sorted.length - 1];
    return [...names].sort((a, b) => (last?.byChar?.[b] || 0) - (last?.byChar?.[a] || 0));
  }, [sorted]);

  // Projeção futura só na visão total (a linha esperada é do bolo inteiro).
  const projectionOn = futureMonths > 0 && rate.gpDay > 0 && !byCharMode;

  const goalsOn = showGoals && goalHist != null;

  const data = useMemo(() => {
    const cfg = RANGES.find((r) => r.key === range)!;
    // dayPct calculado sobre a série inteira ANTES do recorte, pro 1º ponto
    // do range ainda ter a variação vs o dia anterior (fora do range).
    const withPct: ChartPoint[] = sorted.map((s, i) => {
      const prev = i > 0 ? sorted[i - 1] : null;
      const dayPct = prev && prev.total > 0 ? ((s.total - prev.total) / prev.total) * 100 : null;
      const goals = goalsOn ? goalHist!.costAt(s.date) : null;
      const goalPct = goals && goals > 0 ? (s.total / goals) * 100 : null;
      const p = { date: shortDate(s.date), full: s.date, total: s.total, dayPct, expected: null, bond: null, goals, goalPct } as ChartPoint;
      for (const n of charNames) p[`c:${n}`] = s.byChar?.[n] ?? null;
      return p;
    });
    const pick = cfg.days == null ? withPct : withPct.slice(-cfg.days);

    // Futuro: linha esperada emenda no ÚLTIMO ponto real e segue N meses,
    // crescendo gpDay/dia e deduzindo o bond de cada conta no vencimento.
    if (projectionOn && pick.length) {
      const anchor = pick[pick.length - 1];
      anchor.expected = anchor.total;
      const horizon = futureMonths * 30;
      const purchases = bondSchedule(characters, addDays(anchor.full, 1), addDays(anchor.full, horizon));
      for (const fp of projectedSeries(anchor.full, anchor.total || 0, horizon, rate.gpDay, purchases, bondPrice)) {
        // No futuro o custo dos goals congela no último preço conhecido; a
        // cobertura (goalPct) segue a linha ESPERADA, não o real.
        const goals = goalsOn ? goalHist!.costAt(fp.full) : null;
        pick.push({
          date: shortDate(fp.full), full: fp.full, total: null, dayPct: null,
          expected: fp.expected,
          bond: fp.bondChars.length ? fp.expected : null,
          bondChars: fp.bondChars,
          goals,
          goalPct: goals && goals > 0 ? (fp.expected / goals) * 100 : null,
        } as ChartPoint);
      }
    }
    return pick;
  }, [sorted, range, charNames, projectionOn, futureMonths, rate, characters, bondPrice, goalsOn, goalHist]);

  const latest = sorted[sorted.length - 1];
  const firstReal = data.find((p) => p.total != null);
  const delta = latest && firstReal ? latest.total - (firstReal.total || 0) : 0;
  const deltaPct = firstReal && (firstReal.total || 0) > 0 ? (delta / (firstReal.total || 1)) * 100 : 0;
  const deltaUp = delta >= 0;

  // Variação vs o último dia gravado (independente do range selecionado).
  const prevDay = sorted[sorted.length - 2];
  const dayDelta = latest && prevDay ? latest.total - prevDay.total : 0;
  const dayDeltaPct = prevDay && prevDay.total > 0 ? (dayDelta / prevDay.total) * 100 : 0;
  const dayUp = dayDelta >= 0;

  // Régua expected vs reality do passado visível: o que o ritmo previa vs o que rolou.
  const projStats = useMemo(() => {
    if (futureMonths <= 0 || rate.gpDay <= 0 || byCharMode) return null;
    const past = data.filter((p) => p.total != null);
    if (past.length < 2) return null;
    const first = past[0], last = past[past.length - 1];
    const days = daysBetween(first.full, last.full);
    const expectedGain = rate.gpDay * days;
    if (expectedGain <= 0) return null;
    const realGain = (last.total || 0) - (first.total || 0);
    const efficiency = (realGain / expectedGain) * 100;
    const farmedHours = rate.gpHour > 0 ? realGain / rate.gpHour : 0;
    const plannedHours = rate.gpHour > 0 ? expectedGain / rate.gpHour : 0;
    return { realGain, expectedGain, efficiency, farmedHours, plannedHours };
  }, [futureMonths, rate, byCharMode, data]);

  // Bonds: vencimentos e próximas compras (independe da projeção estar ligada).
  const bonds = useMemo(() => {
    const withBond = characters.filter((c) => c.bondExpiresAt);
    if (!withBond.length) return null;
    const today = todayKey();
    const horizon = addDays(today, Math.max(futureMonths, 3) * 30);
    const list = bondSchedule(characters, today, horizon).slice(0, 8);
    const expiring = withBond
      .map((c) => ({ char: c.name, days: Math.ceil(daysBetween(today, c.bondExpiresAt!)) }))
      .sort((a, b) => a.days - b.days);
    return { list, expiring };
  }, [characters, futureMonths]);

  // "O que mudou" NAVEGÁVEL: offset 0 = os 2 últimos dias; as setinhas andam
  // dia a dia pro passado. O fallback de detalhe (itemsByChar -> items ->
  // byChar) é por PAR, então dias antigos degradam sozinhos pro formato legado.
  const [moverOffsetRaw, setMoverOffset] = useState(0);
  const maxMoverOffset = Math.max(0, sorted.length - 2);
  // Clampado aqui (e não só no moversAt) pra setinha não "andar no vazio"
  // se o histórico encolher com um offset antigo guardado no estado.
  const moverOffset = Math.min(moverOffsetRaw, maxMoverOffset);
  const movers = useMemo(() => {
    const r = moversAt(sorted, moverOffset);
    if (!r) return null;
    if (r.kind === 'byChar') return { ...r, groups: r.groups.map((g) => ({ ...g, movers: g.movers.slice(0, 4) })) };
    if (r.kind === 'item') return { ...r, items: r.items.slice(0, 6) };
    return { ...r, chars: r.chars.slice(0, 6) };
  }, [sorted, moverOffset]);

  const toggleCls = (on: boolean) =>
    `rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
      on ? 'border-cyan-500 bg-cyan-500/15 text-cyan-600' : 'border-border bg-transparent text-muted-foreground hover:bg-accent'
    }`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-cyan-500" />
            Histórico da riqueza
          </span>
          <div className="flex flex-wrap items-center gap-2">
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
            <button
              onClick={() => setByCharMode((v) => !v)}
              title="Uma linha por conta em vez do total"
              className={toggleCls(byCharMode)}
            >
              Por conta
            </button>
            {purchaseGoals.length > 0 && (
              <button
                onClick={() => setShowGoals((v) => !v)}
                title="Custo total dos goals ao longo do tempo (preço de mercado da Wiki) — no hover, quanto do custo o banco cobre"
                className={toggleCls(showGoals)}
              >
                {goalsLoading ? 'Goals…' : 'vs Goals'}
              </button>
            )}
            {rate.gpDay > 0 && !byCharMode && (
              <div
                className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5"
                title={`Projeção de hoje pro futuro: métodos ativos × horas planejadas (${formatGoldValue(rate.gpDay)}/dia), deduzindo bonds no vencimento`}
              >
                <span className="text-xs text-muted-foreground">Projeção</span>
                <div className="flex overflow-hidden rounded">
                  {FUTURES.map((f) => (
                    <button
                      key={f.months}
                      onClick={() => setFutureMonths(f.months)}
                      className={`px-1.5 py-0.5 text-xs font-medium transition-colors ${
                        futureMonths === f.months
                          ? 'bg-amber-500 text-white'
                          : 'bg-transparent text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                <span className="flex flex-wrap items-baseline gap-x-3 pb-0.5 text-sm">
                  <span className={`font-semibold ${deltaUp ? 'text-green-600' : 'text-red-500'}`}>
                    {deltaUp ? '▲' : '▼'} {formatGoldValue(Math.abs(delta))} ({deltaPct.toFixed(1)}%)
                    <span className="ml-1 font-normal text-muted-foreground">no período</span>
                  </span>
                  <span className={`font-semibold ${dayUp ? 'text-green-600' : 'text-red-500'}`}>
                    {dayUp ? '▲' : '▼'} {formatGoldValue(Math.abs(dayDelta))} ({dayDeltaPct.toFixed(1)}%)
                    <span className="ml-1 font-normal text-muted-foreground">vs último dia</span>
                  </span>
                </span>
              )}
            </div>

            {goalsOn && (() => {
              const goalsToday = goalHist!.costAt(latest.date);
              const cover = goalsToday > 0 ? (latest.total / goalsToday) * 100 : null;
              return (
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 rounded" style={{ background: '#e11d48' }} />
                    <span className="text-muted-foreground">Custo dos goals:</span>
                    <b className="text-rose-600">{formatGoldValue(goalsToday)}</b>
                  </span>
                  {cover != null && (
                    <span className="text-muted-foreground">
                      banco cobre <b className={cover >= 100 ? 'text-green-600' : 'text-foreground'}>{cover.toFixed(1)}%</b>
                    </span>
                  )}
                  <span className="text-muted-foreground" title="Goals sem histórico de mercado (conquistas, untradeables) entram pelo custo de hoje, constante">
                    {goalHist!.itemsWithHistory}/{goalHist!.itemsTotal} goals com preço histórico
                  </span>
                </div>
              );
            })()}

            {byCharMode && (
              <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {charNames.map((n, i) => (
                  <span key={n} className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: CHAR_COLORS[i % CHAR_COLORS.length] }} />
                    {n}
                  </span>
                ))}
              </div>
            )}

            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <ComposedChart data={data} margin={{ left: 8, right: 12, top: 4, bottom: 4 }}>
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
                    formatter={(v: number, name: string, entry: { payload?: { dayPct?: number | null; goalPct?: number | null; bondChars?: string[] } }) => {
                      if (name === 'expected') return [`${Math.round(v).toLocaleString()} gp`, 'Esperado'];
                      if (name === 'goals') {
                        const pct = entry?.payload?.goalPct;
                        const suffix = pct == null ? '' : `  (banco cobre ${pct.toFixed(1)}%)`;
                        return [`${Math.round(v).toLocaleString()} gp${suffix}`, 'Goals'];
                      }
                      if (name === 'bond') {
                        const chars = entry?.payload?.bondChars || [];
                        const cost = bondPrice > 0 ? formatGoldValue(bondPrice * Math.max(chars.length, 1)) : '?';
                        return [`−${cost} (${chars.join(', ') || 'bond'})`, 'Bond'];
                      }
                      if (name.startsWith('c:')) return [`${v.toLocaleString()} gp`, name.slice(2)];
                      const pct = entry?.payload?.dayPct;
                      const suffix = pct == null ? '' : `  (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs dia anterior)`;
                      return [`${v.toLocaleString()} gp${suffix}`, 'Total'];
                    }}
                    labelFormatter={(l) => `Dia ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  {byCharMode ? (
                    charNames.map((n, i) => (
                      <Line
                        key={n}
                        type="monotone"
                        dataKey={`c:${n}`}
                        stroke={CHAR_COLORS[i % CHAR_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 2, fill: CHAR_COLORS[i % CHAR_COLORS.length], strokeWidth: 0 }}
                        isAnimationActive={false}
                        connectNulls
                      />
                    ))
                  ) : (
                    <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} fill="url(#wealthFill)" dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} />
                  )}
                  {goalsOn && (
                    <Line
                      type="monotone"
                      dataKey="goals"
                      stroke="#e11d48"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={false}
                      isAnimationActive={false}
                      connectNulls
                    />
                  )}
                  {projectionOn && (
                    <Line type="monotone" dataKey="expected" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
                  )}
                  {projectionOn && (
                    // Marcadores de compra de bond: Line invisível só com dots em
                    // cima da linha esperada (integra com o Tooltip; ReferenceDot
                    // erraria o dia com DD/MM repetido no eixo categórico).
                    <Line
                      type="monotone"
                      dataKey="bond"
                      stroke="none"
                      dot={{ r: 4.5, fill: '#ef4444', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 0 }}
                      isAnimationActive={false}
                      legendType="none"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {projStats && (
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Real <b className={projStats.realGain >= 0 ? 'text-green-600' : 'text-red-500'}>
                    {projStats.realGain >= 0 ? '+' : '−'}{formatGoldValue(Math.abs(projStats.realGain))}
                  </b>
                  {' '}vs esperado <b className="text-amber-600">+{formatGoldValue(projStats.expectedGain)}</b>
                  <span className="ml-1">no período</span>
                </span>
                <span>
                  Eficiência <b className={projStats.efficiency >= 100 ? 'text-green-600' : projStats.efficiency >= 50 ? 'text-amber-600' : 'text-red-500'}>
                    {projStats.efficiency.toFixed(0)}%
                  </b>
                </span>
                <span title="Ganho real dividido pelos gp/h dos métodos ativos — quantas horas de farm o período rendeu de fato">
                  ≈ <b>{projStats.farmedHours.toFixed(1)}h</b> farmadas de {projStats.plannedHours.toFixed(0)}h planejadas
                </span>
              </div>
            )}

            {bonds && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">Bonds</h4>
                  <span className="text-xs text-muted-foreground">
                    {bondPrice > 0 ? `bond hoje: ${formatGoldValue(bondPrice)}` : 'preço do bond indisponível'}
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {bonds.expiring.map((e) => {
                    const cls = e.days <= 3 ? 'bg-red-500/15 text-red-600' : e.days <= 7 ? 'bg-amber-500/15 text-amber-600' : 'bg-green-500/15 text-green-600';
                    return (
                      <span key={e.char} className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
                        {e.char}: {e.days <= 0 ? 'bond VENCIDO' : `vence em ${e.days}d`}
                      </span>
                    );
                  })}
                </div>
                <ul className="space-y-1">
                  {(() => {
                    let acc = 0;
                    return bonds.list.map((p, i) => {
                      acc += bondPrice;
                      return (
                        <li key={`${p.date}-${p.char}`} className="flex items-center gap-2 text-sm">
                          <span className="w-12 shrink-0 tabular-nums text-xs text-muted-foreground">{shortDate(p.date)}</span>
                          <span className="flex-1 truncate">{p.char}</span>
                          <span className="shrink-0 tabular-nums font-medium text-red-500">
                            −{bondPrice > 0 ? formatGoldValue(bondPrice) : '?'}
                          </span>
                          <span className="shrink-0 w-20 text-right tabular-nums text-xs text-muted-foreground" title="Custo acumulado de bonds até aqui">
                            {bondPrice > 0 ? formatGoldValue(acc) : '—'}
                          </span>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </div>
            )}

            {movers && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">O que mudou</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMoverOffset(Math.min(moverOffset + 1, maxMoverOffset))}
                      disabled={moverOffset >= maxMoverOffset}
                      title="Par de dias anterior"
                      className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ←
                    </button>
                    <span className="min-w-[7.5rem] text-center text-xs tabular-nums text-muted-foreground">
                      {shortDate(movers.prev.date)} → {shortDate(movers.curr.date)}
                      {movers.kind === 'char' && ' · por conta'}
                    </span>
                    <button
                      onClick={() => setMoverOffset(Math.max(moverOffset - 1, 0))}
                      disabled={moverOffset === 0}
                      title="Par de dias seguinte"
                      className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      →
                    </button>
                    {moverOffset > 0 && (
                      <button
                        onClick={() => setMoverOffset(0)}
                        title="Voltar pro par mais recente"
                        className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
                      >
                        hoje
                      </button>
                    )}
                  </div>
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
