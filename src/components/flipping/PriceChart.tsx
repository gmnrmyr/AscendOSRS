import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { fetchTimeseries, type ChartRange, type ChartSeries } from '@/services/flipping';
import { formatGoldValue } from '@/lib/utils';

interface PriceChartProps {
  itemId: number;
  itemName: string;
}

const RANGES: ChartRange[] = ['6h', '24h', '7d', '30d', '1y', 'all'];

// Par high/low validado (CVD + contraste) contra a superfície do card em cada tema.
// No light o contraste fica abaixo de 3:1 (WARN) — o relief é a legenda + tooltip.
const COLORS = {
  dark: { high: '#d47708', low: '#1a97c9', vol: '#8a8175' },
  light: { high: '#b8650f', low: '#0e7fae', vol: '#6b5f4d' },
};

const isIntraday = (r: ChartRange) => r === '6h' || r === '24h';
const isLongRange = (r: ChartRange) => r === '1y' || r === 'all';

// HH:MM intraday, DD/MM até 30d, MM/AA em 1y/all.
function tickLabel(ts: number, range: ChartRange): string {
  const d = new Date(ts * 1000);
  if (isIntraday(range)) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (isLongRange(range)) {
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fullLabel(ts: number, range: ChartRange): string {
  const d = new Date(ts * 1000);
  if (isIntraday(range)) {
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function PriceChart({ itemId, itemName }: PriceChartProps) {
  const { actualTheme } = useTheme();
  const c = COLORS[actualTheme];
  const [range, setRange] = useState<ChartRange>('24h');
  const [series, setSeries] = useState<ChartSeries | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSeries(null);
    setError(null);
    fetchTimeseries(itemId, range)
      .then((s) => { if (!cancelled) setSeries(s); })
      .catch(() => { if (!cancelled) setError('Falha ao carregar a série (Wiki fora do ar?)'); });
    return () => { cancelled = true; };
  }, [itemId, range]);

  const single = series?.kind === 'single';

  const data = useMemo(
    () => (series?.points ?? []).map((p) => ({
      ts: p.timestamp,
      label: tickLabel(p.timestamp, range),
      high: p.avgHighPrice,
      low: p.avgLowPrice,
      volume: p.highPriceVolume + p.lowPriceVolume,
    })),
    [series, range],
  );

  const seriesName = (key: string) =>
    single ? 'Preço (GE)' : key === 'high' ? 'Venda (high)' : 'Compra (low)';

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="osrs-label text-lg">{itemName}</span>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`pixel-tab px-2.5 py-1 text-xs ${range === r ? 'pixel-tab-active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="py-8 text-center text-sm text-red-500">{error}</div>}
      {!error && !series && <div className="py-8 text-center osrs-muted text-sm">Carregando série...</div>}
      {!error && series && data.length === 0 && (
        <div className="py-8 text-center osrs-muted text-sm">Sem negociações registradas nesse período.</div>
      )}

      {!error && data.length > 0 && (
        <>
          {/* preço: um eixo só (gp). Volume tem escala própria -> painel separado abaixo. */}
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={data} syncId={`flip-${itemId}`} margin={{ left: 8, right: 12, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} height={4} />
                <YAxis
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickCount={4}
                  tickFormatter={(v: number) => formatGoldValue(v)}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${Math.round(v).toLocaleString('pt-BR')} gp`, seriesName(name)]}
                  labelFormatter={(_, payload) => fullLabel(payload?.[0]?.payload?.ts ?? 0, range)}
                  contentStyle={{ fontSize: 12, borderRadius: 0 }}
                />
                {/* série única (all-time) dispensa legenda — o título já nomeia */}
                {!single && (
                  <Legend formatter={(v: string) => <span className="osrs-muted text-xs">{seriesName(v)}</span>} />
                )}
                {/* sem animação: no 'all' são ~4k pontos e o desenho progressivo só pesa */}
                <Line type="monotone" dataKey="high" stroke={c.high} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                {!single && <Line type="monotone" dataKey="low" stroke={c.low} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '100%', height: 72 }}>
            <ResponsiveContainer>
              <BarChart data={data} syncId={`flip-${itemId}`} margin={{ left: 8, right: 12, top: 4, bottom: 4 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickCount={2}
                  tickFormatter={(v: number) => formatGoldValue(v)}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString('pt-BR')} un`, 'Volume']}
                  labelFormatter={(_, payload) => fullLabel(payload?.[0]?.payload?.ts ?? 0, range)}
                  contentStyle={{ fontSize: 12, borderRadius: 0 }}
                />
                <Bar dataKey="volume" fill={c.vol} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
