import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { itemImageUrl } from '@/services/priceEngine';
import { geTax, flipProfit, dailyPnL, type FlipJournalEntry } from '@/services/flipping';
import { formatGoldValue } from '@/lib/utils';

interface FlipJournalProps {
  journal: FlipJournalEntry[];
  onChange: (journal: FlipJournalEntry[]) => void;
}

const gp = (n: number) => `${n.toLocaleString('pt-BR')} gp`;
const shortDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

// Linha de flip aberto: input do preço de venda + fechar.
function OpenEntry({ e, onClose, onDelete }: {
  e: FlipJournalEntry;
  onClose: (sellPrice: number) => void;
  onDelete: () => void;
}) {
  const [sell, setSell] = useState('');
  const sellN = parseInt(sell.replace(/\D/g, ''), 10) || 0;
  const preview = sellN > 0 ? (sellN - geTax(sellN, e.itemId) - e.buyPrice) * e.qty : null;

  return (
    <div className="osrs-inset flex flex-wrap items-center gap-2 p-2">
      <img src={itemImageUrl(e.itemId)} alt="" className="h-6 w-6 shrink-0" loading="lazy" />
      <span className="osrs-value min-w-0 flex-1 truncate">{e.name}</span>
      <span className="osrs-muted text-xs shrink-0" title={`Comprado em ${new Date(e.boughtAt).toLocaleString('pt-BR')}`}>
        {e.qty.toLocaleString('pt-BR')}× @ {gp(e.buyPrice)}
      </span>
      <input
        className="pixel-input w-32 py-1 text-sm"
        placeholder="vendeu por..."
        inputMode="numeric"
        value={sell}
        onChange={(ev) => setSell(ev.target.value)}
      />
      {preview != null && (
        <span className={`text-xs font-semibold tabular-nums ${preview >= 0 ? 'osrs-gp' : 'text-red-500'}`}>
          {preview >= 0 ? '+' : '−'}{formatGoldValue(Math.abs(preview))} pós-tax
        </span>
      )}
      <button className="pixel-button px-2 py-1 text-xs" disabled={sellN <= 0} onClick={() => onClose(sellN)}>
        Fechar
      </button>
      <button className="pixel-button px-2 py-1" title="Apagar registro" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function FlipJournal({ journal, onChange }: FlipJournalProps) {
  const open = journal.filter((e) => e.status === 'open');
  const closed = journal
    .filter((e) => e.status === 'closed')
    .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''));
  const days = dailyPnL(journal);
  const totalRealized = closed.reduce((s, e) => s + flipProfit(e), 0);

  const closeEntry = (id: string, sellPrice: number) => {
    onChange(journal.map((e) =>
      e.id === id ? { ...e, sellPrice, soldAt: new Date().toISOString(), status: 'closed' as const } : e,
    ));
  };
  const deleteEntry = (id: string) => onChange(journal.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      {journal.length === 0 && (
        <p className="osrs-muted text-sm">
          Nenhum flip registrado. Use <b>Comprar</b> numa sugestão pra abrir o primeiro.
        </p>
      )}

      {open.length > 0 && (
        <div>
          <h4 className="osrs-label mb-2">Abertos ({open.length})</h4>
          <div className="space-y-1.5">
            {open.map((e) => (
              <OpenEntry key={e.id} e={e} onClose={(p) => closeEntry(e.id, p)} onDelete={() => deleteEntry(e.id)} />
            ))}
          </div>
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h4 className="osrs-label">Fechados ({closed.length})</h4>
            <span className={`text-sm font-semibold tabular-nums ${totalRealized >= 0 ? 'osrs-gp' : 'text-red-500'}`}>
              total {totalRealized >= 0 ? '+' : '−'}{formatGoldValue(Math.abs(totalRealized))}
            </span>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {closed.map((e) => {
              const profit = flipProfit(e);
              return (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <img src={itemImageUrl(e.itemId)} alt="" className="h-5 w-5 shrink-0" loading="lazy" />
                  <span className="min-w-0 flex-1 truncate osrs-value">{e.name}</span>
                  <span className="osrs-muted text-xs shrink-0">
                    {e.qty.toLocaleString('pt-BR')}× {gp(e.buyPrice)} → {gp(e.sellPrice!)}
                  </span>
                  <span className={`w-20 shrink-0 text-right font-semibold tabular-nums ${profit >= 0 ? 'osrs-gp' : 'text-red-500'}`}>
                    {profit >= 0 ? '+' : '−'}{formatGoldValue(Math.abs(profit))}
                  </span>
                  <span className="osrs-muted w-10 shrink-0 text-right text-xs">{shortDay(e.soldAt!)}</span>
                  <button className="pixel-button px-1.5 py-0.5" title="Apagar registro" onClick={() => deleteEntry(e.id)}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {days.length > 0 && (
        <div>
          <h4 className="osrs-label mb-2">P&L por dia</h4>
          <div className="flex flex-wrap gap-2">
            {days.slice(0, 10).map((d) => (
              <div key={d.date} className="osrs-inset px-2.5 py-1.5 text-center">
                <div className="osrs-muted text-[11px]">{shortDay(d.date)} · {d.flips} flip{d.flips > 1 ? 's' : ''}</div>
                <div className={`text-sm font-semibold tabular-nums ${d.profit >= 0 ? 'osrs-gp' : 'text-red-500'}`}>
                  {d.profit >= 0 ? '+' : '−'}{formatGoldValue(Math.abs(d.profit))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
