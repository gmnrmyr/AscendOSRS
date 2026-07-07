import { useEffect, useState } from "react";
import { Database, HardDrive } from "lucide-react";

interface DataSummaryProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
}

const GOLD = { color: "hsl(var(--gold))" };

export function DataSummary({
  characters,
  moneyMethods,
  purchaseGoals,
  bankData
}: DataSummaryProps) {
  // Status do save local-first (disco do Mac via server :3001)
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [diskOk, setDiskOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/data')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setDiskOk(!!d); setSavedAt(d?.savedAt || null); })
      .catch(() => setDiskOk(false));
  }, []);

  const tiles = [
    { label: "Characters", value: characters.length },
    { label: "Money Methods", value: moneyMethods.length },
    { label: "Purchase Goals", value: purchaseGoals.length },
    { label: "Bank Items", value: Object.values(bankData).reduce((sum, items) => sum + items.length, 0) },
  ];

  return (
    <div className="osrs-card p-6">
      <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
        <Database className="h-5 w-5" style={GOLD} />
        Current Data
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="osrs-inset text-center p-4">
            <div className="osrs-value text-2xl">{t.value}</div>
            <div className="osrs-label text-sm mt-1">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="osrs-inset flex items-center gap-2 p-3 mt-4">
        <HardDrive className="h-4 w-4 shrink-0" style={GOLD} />
        {diskOk === null ? (
          <span className="osrs-muted text-sm">Checking local save…</span>
        ) : diskOk ? (
          <span className="osrs-muted text-sm">
            Saved to disk (local-first){savedAt ? ` — last save ${new Date(savedAt).toLocaleString()}` : ''}
          </span>
        ) : (
          <span className="text-sm" style={{ color: 'hsl(var(--destructive))', fontFamily: 'RuneScape Bold, monospace' }}>
            Local save server unreachable — changes are NOT being persisted to disk
          </span>
        )}
      </div>
    </div>
  );
}
