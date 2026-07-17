import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { fetchGameUpdates, type GameUpdate } from '@/services/gameUpdates';

const GOLD = { color: 'hsl(var(--gold))' };

// DD/MM a partir de YYYY-MM-DD (mesma convenção do histórico).
const dm = (iso: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—');

// Últimos updates do jogo (news oficial), com badge GE nos que podem mexer
// com preço. Offline/sem dados o card simplesmente não aparece.
export function GameUpdatesCard() {
  const [updates, setUpdates] = useState<GameUpdate[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGameUpdates().then((u) => { if (alive) setUpdates(u); });
    return () => { alive = false; };
  }, []);

  if (!updates || updates.length === 0) return null;

  return (
    <div className="osrs-card p-6">
      <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5" style={GOLD} />
        Game Updates
      </h3>
      <div className="space-y-2">
        {updates.slice(0, 6).map((u) => (
          <a
            key={u.link}
            href={u.link}
            target="_blank"
            rel="noreferrer"
            title={u.category}
            className="osrs-inset flex items-start gap-3 p-3 transition-opacity hover:opacity-80"
          >
            <span className="osrs-label w-12 shrink-0 pt-0.5 text-sm tabular-nums">{dm(u.date)}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="osrs-value truncate text-base">{u.title}</span>
                {u.priceImpact && (
                  <span
                    className="osrs-badge shrink-0"
                    title="Pode mexer com preços no GE (conteúdo novo / drops / itens)"
                  >
                    GE
                  </span>
                )}
              </span>
              <span className="osrs-muted block truncate text-sm">{u.summary}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
