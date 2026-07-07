import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Star, LineChart, ShoppingCart, X } from 'lucide-react';
import { useAppState } from '@/components/AppStateProvider';
import { itemImageUrl, COINS_ID, PLAT_TOKEN_ID } from '@/services/priceEngine';
import {
  fetchMarketSnapshot, suggestFlips, geTax,
  type FlipItem, type FlipSuggestion, type FlipJournalEntry,
} from '@/services/flipping';
import { PriceChart } from './PriceChart';
import { FlipJournal } from './FlipJournal';
import { formatGoldValue } from '@/lib/utils';

const MAX_ROWS = 30;
const gp = (n: number) => n.toLocaleString('pt-BR');

// Rascunho de compra (abre ao clicar em Comprar numa sugestão).
interface BuyDraft { itemId: number; name: string; price: number; qty: number; }

export function FlippingDashboard() {
  const { characters, bankData, flipping, setFlipping } = useAppState();

  // Gold líquido do save: Coins + plat tokens dos bancos das contas ativas.
  const liquidGold = useMemo(() => {
    const active = new Set(characters.filter((c) => c.isActive).map((c) => c.name));
    let total = 0;
    for (const [char, items] of Object.entries(bankData)) {
      if (!active.has(char)) continue;
      for (const it of items) {
        if (it.osrsId === COINS_ID) total += it.quantity;
        else if (it.osrsId === PLAT_TOKEN_ID) total += it.quantity * 1000;
      }
    }
    return total;
  }, [characters, bankData]);

  const [items, setItems] = useState<FlipItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [budgetInput, setBudgetInput] = useState<string | null>(null); // null = usa liquidGold
  const [f2pOnly, setF2pOnly] = useState(false);
  const [minVol, setMinVol] = useState(100);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);
  const [draft, setDraft] = useState<BuyDraft | null>(null);

  const budget = budgetInput != null ? parseInt(budgetInput.replace(/\D/g, ''), 10) || 0 : liquidGold;

  const load = async (force: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const snap = await fetchMarketSnapshot(force);
      setItems(snap.items);
      setFetchedAt(snap.fetchedAt);
    } catch {
      setError('Não deu pra falar com a API de preços da Wiki. Offline?');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(false); }, []);

  const suggestions = useMemo(
    () => suggestFlips(items, { budget, f2pOnly, minVol1h: minVol, maxStaleMin: 60, search }).slice(0, MAX_ROWS),
    [items, budget, f2pOnly, minVol, search],
  );

  const favIds = useMemo(() => new Set(flipping.favorites.map((f) => f.itemId)), [flipping.favorites]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const toggleFav = (id: number, name: string) => {
    if (favIds.has(id)) {
      setFlipping({ ...flipping, favorites: flipping.favorites.filter((f) => f.itemId !== id) });
    } else {
      setFlipping({
        ...flipping,
        favorites: [...flipping.favorites, { itemId: id, name, addedAt: new Date().toISOString() }],
      });
    }
  };

  const setFavNote = (id: number, note: string) => {
    setFlipping({
      ...flipping,
      favorites: flipping.favorites.map((f) => (f.itemId === id ? { ...f, note } : f)),
    });
  };

  const confirmBuy = () => {
    if (!draft || draft.qty <= 0 || draft.price <= 0) return;
    const entry: FlipJournalEntry = {
      id: `flip-${Date.now()}`,
      itemId: draft.itemId,
      name: draft.name,
      qty: draft.qty,
      buyPrice: draft.price,
      boughtAt: new Date().toISOString(),
      status: 'open',
    };
    setFlipping({ ...flipping, journal: [entry, ...flipping.journal] });
    setDraft(null);
  };

  const openDraft = (s: FlipSuggestion) => {
    setDraft({ itemId: s.id, name: s.name, price: s.low, qty: Math.max(1, s.qtyAffordable) });
  };

  const agoMin = fetchedAt ? Math.round((Date.now() - fetchedAt) / 60000) : null;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------ controles */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="osrs-label mb-1 block text-sm">Budget (gp)</label>
          <div className="flex items-center gap-1">
            <input
              className="pixel-input w-36 py-1.5 text-sm"
              inputMode="numeric"
              value={budgetInput ?? gp(liquidGold)}
              onChange={(e) => setBudgetInput(e.target.value)}
              title="Gold disponível pra flipar. Padrão: Coins + plat tokens das contas ativas."
            />
            {budgetInput != null && (
              <button className="pixel-button px-2 py-1 text-xs" onClick={() => setBudgetInput(null)}
                title={`Voltar pro gold do save (${formatGoldValue(liquidGold)})`}>
                save
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="osrs-label mb-1 block text-sm">Vol. mín/h</label>
          <input
            className="pixel-input w-24 py-1.5 text-sm"
            inputMode="numeric"
            value={minVol}
            onChange={(e) => setMinVol(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
            title='Volume mínimo negociado por hora — filtra o que "flipa de verdade"'
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2">
          <input type="checkbox" checked={f2pOnly} onChange={(e) => setF2pOnly(e.target.checked)} />
          <span className="osrs-muted text-sm">Só F2P</span>
        </label>
        <div className="min-w-40 flex-1">
          <label className="osrs-label mb-1 block text-sm">Buscar item</label>
          <input
            className="pixel-input w-full py-1.5 text-sm"
            placeholder="ex: dragon bones"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pb-1">
          <button className="pixel-button flex items-center gap-1.5 px-3 py-1.5 text-sm" onClick={() => load(true)} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          {agoMin != null && <span className="osrs-muted text-xs">há {agoMin}min</span>}
        </div>
      </div>

      {error && <div className="osrs-inset p-3 text-sm text-red-500">{error}</div>}
      {loading && items.length === 0 && <div className="py-10 text-center osrs-muted">Carregando o mercado...</div>}

      {/* ------------------------------------------------ rascunho de compra */}
      {draft && (
        <div className="osrs-inset flex flex-wrap items-center gap-2 p-3">
          <img src={itemImageUrl(draft.itemId)} alt="" className="h-6 w-6" />
          <span className="osrs-value">{draft.name}</span>
          <label className="osrs-muted text-sm">qtd</label>
          <input className="pixel-input w-24 py-1 text-sm" inputMode="numeric" value={draft.qty}
            onChange={(e) => setDraft({ ...draft, qty: parseInt(e.target.value.replace(/\D/g, ''), 10) || 0 })} />
          <label className="osrs-muted text-sm">@ preço</label>
          <input className="pixel-input w-28 py-1 text-sm" inputMode="numeric" value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: parseInt(e.target.value.replace(/\D/g, ''), 10) || 0 })} />
          <span className="osrs-muted text-xs">= {formatGoldValue(draft.qty * draft.price)}</span>
          <button className="pixel-button-primary pixel-button px-3 py-1 text-sm" onClick={confirmBuy}>
            Registrar compra
          </button>
          <button className="pixel-button px-2 py-1" onClick={() => setDraft(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ------------------------------------------------ sugestões */}
      {items.length > 0 && (
        <div>
          <h3 className="osrs-title mb-2 text-lg">{search ? 'Resultado da busca' : 'Sugestões de flip'}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left">
                  <th className="osrs-label px-2 py-1.5 font-normal" colSpan={2}>Item</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal">Compra</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal">Venda</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal" title="Venda − tax 2% − compra">Margem</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal">ROI</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal" title="Buy limit do GE (por 4h)">Limite</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal" title="Unidades negociadas na última hora">Vol/h</th>
                  <th className="osrs-label px-2 py-1.5 text-right font-normal" title="Margem × min(limite, o que o budget compra)">Potencial</th>
                  <th className="px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer border-t border-border hover:brightness-110"
                    onClick={() => setSelected({ id: s.id, name: s.name })}
                    title="Clique pra ver o gráfico de preço"
                  >
                    <td className="w-8 px-2 py-1.5"><img src={itemImageUrl(s.id)} alt="" className="h-6 w-6" loading="lazy" /></td>
                    <td className="max-w-52 truncate px-2 py-1.5 osrs-value">
                      {s.name}
                      {s.members && <span className="osrs-muted ml-1 text-[10px]" title="Members">(m)</span>}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums osrs-gp">{gp(s.low)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums osrs-gp">{gp(s.high)}</td>
                    <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${s.marginPostTax >= 0 ? 'osrs-gp' : 'text-red-500'}`}>
                      {gp(s.marginPostTax)}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums osrs-value">{(s.roi * 100).toFixed(1)}%</td>
                    <td className="px-2 py-1.5 text-right tabular-nums osrs-value">{s.limit ? gp(s.limit) : '—'}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums osrs-value">{gp(s.vol1h)}</td>
                    <td className="px-2 py-1.5 text-right font-semibold tabular-nums osrs-gp">{formatGoldValue(s.potential)}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="pixel-button mr-1 px-1.5 py-0.5 align-middle"
                        title={favIds.has(s.id) ? 'Tirar dos favoritos' : 'Favoritar'}
                        onClick={() => toggleFav(s.id, s.name)}
                      >
                        <Star className={`h-3.5 w-3.5 ${favIds.has(s.id) ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                      </button>
                      <button className="pixel-button px-1.5 py-0.5 align-middle" title="Registrar compra no journal" onClick={() => openDraft(s)}>
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr><td colSpan={10} className="osrs-muted px-2 py-6 text-center">
                    Nada passa nos filtros — baixa o volume mínimo ou aumenta o budget.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ gráfico */}
      {selected && (
        <div className="osrs-inset p-4">
          <div className="mb-1 flex justify-end">
            <button className="pixel-button px-2 py-0.5" title="Fechar gráfico" onClick={() => setSelected(null)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <PriceChart itemId={selected.id} itemName={selected.name} />
        </div>
      )}

      {/* ------------------------------------------------ favoritos */}
      {flipping.favorites.length > 0 && (
        <div>
          <h3 className="osrs-title mb-2 text-lg">Favoritos</h3>
          <div className="space-y-1.5">
            {flipping.favorites.map((f) => {
              const live = byId.get(f.itemId);
              return (
                <div key={f.itemId} className="osrs-inset flex flex-wrap items-center gap-2 p-2">
                  <img src={itemImageUrl(f.itemId)} alt="" className="h-6 w-6 shrink-0" loading="lazy" />
                  <button
                    className="osrs-value min-w-0 flex-none truncate underline-offset-2 hover:underline"
                    onClick={() => setSelected({ id: f.itemId, name: f.name })}
                    title="Ver gráfico"
                  >
                    <span className="flex items-center gap-1"><LineChart className="h-3 w-3" />{f.name}</span>
                  </button>
                  {live ? (
                    <span className="osrs-muted shrink-0 text-xs tabular-nums">
                      {gp(live.low)} → {gp(live.high)} · margem <span className={live.marginPostTax >= 0 ? 'osrs-gp' : 'text-red-500'}>{gp(live.marginPostTax)}</span> · vol/h {gp(live.vol1h)}
                    </span>
                  ) : (
                    <span className="osrs-muted shrink-0 text-xs">sem preço agora</span>
                  )}
                  <input
                    className="pixel-input min-w-32 flex-1 py-1 text-xs"
                    placeholder="nota (ex: flipa bem à noite)"
                    defaultValue={f.note ?? ''}
                    onBlur={(e) => { if (e.target.value !== (f.note ?? '')) setFavNote(f.itemId, e.target.value); }}
                  />
                  <button className="pixel-button px-1.5 py-0.5" title="Tirar dos favoritos" onClick={() => toggleFav(f.itemId, f.name)}>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------ journal */}
      <div>
        <h3 className="osrs-title mb-2 text-lg">Journal de flips</h3>
        <FlipJournal journal={flipping.journal} onChange={(journal) => setFlipping({ ...flipping, journal })} />
      </div>

      <p className="osrs-muted text-xs">
        Preços e volumes da OSRS Wiki (prices.runescape.wiki). Margem já desconta a GE tax de 2% na venda
        (teto 5m/item; abaixo de 50gp e bonds não pagam). Compra = insta-sell (low), venda = insta-buy (high).
      </p>
    </div>
  );
}
