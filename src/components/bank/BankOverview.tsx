import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Character, BankItem } from '@/hooks/useAppData';
import { itemImageUrl } from '@/services/priceEngine';
import { formatGoldValue } from '@/lib/utils';

interface BankOverviewProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
}

// Paleta estável por char (combina com o tema)
const CHAR_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#06b6d4', '#eab308', '#ec4899'];

const itemValue = (it: BankItem) => Math.floor(it.quantity || 0) * (it.estimatedPrice || 0);

// Raridade por preço UNITÁRIO (estilo Diablo): dourado megarare -> roxo épico -> azul raro -> comum.
function rarityStyle(unit: number): string {
  if (unit >= 500_000_000) return 'border-amber-400 shadow-[0_0_14px_-2px_rgba(251,191,36,0.75)] bg-gradient-to-br from-amber-50/60 to-transparent dark:from-amber-500/10'; // megarare (tbow, scythe, shadow, ely)
  if (unit >= 50_000_000) return 'border-purple-400 shadow-[0_0_12px_-3px_rgba(168,85,247,0.6)] bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-500/10'; // epic
  if (unit >= 1_000_000) return 'border-blue-400 shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)] bg-gradient-to-br from-blue-50/40 to-transparent dark:from-blue-500/10'; // rare
  return 'border-border'; // comum
}

export function BankOverview({ characters, bankData }: BankOverviewProps) {
  // Riqueza por conta (só as que têm valor), ordenado desc
  const perChar = useMemo(() => {
    return characters
      .map((c) => ({
        name: c.name,
        value: (bankData[c.name] || []).reduce((s, it) => s + itemValue(it), 0),
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [characters, bankData]);

  // Só considera bankData de chars que existem (ignora lixo órfão de chars removidos)
  const validBank = useMemo(() => {
    const names = new Set(characters.map((c) => c.name));
    return Object.entries(bankData).filter(([name]) => names.has(name)).map(([, items]) => items);
  }, [characters, bankData]);

  // Top 30 itens mais valiosos, agregados entre todas as contas
  const topItems = useMemo(() => {
    const agg = new Map<string, { name: string; osrsId?: number; qty: number; value: number; unit: number }>();
    for (const items of validBank) {
      for (const it of items) {
        const v = itemValue(it);
        if (v <= 0) continue;
        const key = it.osrsId ? `id:${it.osrsId}` : `n:${(it.name || '').toLowerCase()}`;
        const cur = agg.get(key) || { name: it.name, osrsId: it.osrsId, qty: 0, value: 0, unit: it.estimatedPrice || 0 };
        cur.qty += Math.floor(it.quantity || 0);
        cur.value += v;
        cur.unit = Math.max(cur.unit, it.estimatedPrice || 0);
        agg.set(key, cur);
      }
    }
    return [...agg.values()].sort((a, b) => b.value - a.value).slice(0, 30);
  }, [validBank]);

  const grandTotal = perChar.reduce((s, c) => s + c.value, 0);

  if (grandTotal === 0) {
    return null; // sem dados ainda — não polui
  }

  return (
    <div className="space-y-6">
      {/* Riqueza por conta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-orange-500" />
              Riqueza por conta
            </span>
            <span className="text-lg font-bold text-orange-600">
              {formatGoldValue(grandTotal)} <span className="text-sm font-normal text-muted-foreground">total</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: Math.max(120, perChar.length * 48) }}>
            <ResponsiveContainer>
              <BarChart data={perChar} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [`${formatGoldValue(v)} gp`, 'Banco']}
                  cursor={{ fill: 'rgba(245,158,11,0.08)' }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: 'right', formatter: (v: number) => formatGoldValue(v), fontSize: 11, fill: 'currentColor' }}>
                  {perChar.map((_, i) => (
                    <Cell key={i} fill={CHAR_COLORS[i % CHAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Itens mais valiosos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Itens mais valiosos
            <span className="text-sm font-normal text-muted-foreground">top {topItems.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {topItems.map((it, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg border-2 bg-card p-2.5 hover:bg-accent/40 transition-colors ${rarityStyle(it.unit)}`}
              >
                <div className="flex h-7 w-6 shrink-0 items-center justify-center text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/50">
                  {it.osrsId ? (
                    <img
                      src={itemImageUrl(it.osrsId)}
                      alt={it.name}
                      className="max-h-9 max-w-9 object-contain"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={it.osrsId ? `https://prices.runescape.wiki/osrs/item/${it.osrsId}` : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium hover:underline"
                    title={it.name}
                  >
                    {it.name}
                  </a>
                  <p className="text-xs text-muted-foreground">×{it.qty.toLocaleString()}</p>
                </div>
                <div className="shrink-0 text-right font-mono text-sm font-semibold text-green-600">
                  {formatGoldValue(it.value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
