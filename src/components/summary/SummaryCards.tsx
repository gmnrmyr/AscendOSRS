import { Users, Coins, DollarSign, Target, Clock, Wallet } from "lucide-react";

interface SummaryCardsProps {
  charactersCount: number;
  totalBankValue: number;
  totalGoldValue: number;
  currentGPHour: number;
  totalGoalsValue: number;
  daysToComplete: number;
  formatGP: (amount: number) => string;
  formatDays: (days: number) => string;
}

// Tiles de status no vocabulário visual do jogo:
// label laranja (osrs-label), valor amarelo/tinta (osrs-value), gp em verde (osrs-gp).
export function SummaryCards({
  charactersCount,
  totalBankValue,
  totalGoldValue,
  currentGPHour,
  totalGoalsValue,
  daysToComplete,
  formatGP,
  formatDays
}: SummaryCardsProps) {
  const tiles = [
    { label: "Characters", value: String(charactersCount), icon: Users, gp: false },
    { label: "Bank Sum", value: `${formatGP(totalBankValue)} gp`, icon: Coins, gp: true },
    { label: "Gold Sum", value: `${formatGP(totalGoldValue)} gp`, icon: Wallet, gp: true },
    { label: "GP/Hr", value: `${formatGP(currentGPHour)}/hr`, icon: DollarSign, gp: true },
    { label: "Goals Value", value: `${formatGP(totalGoalsValue)} gp`, icon: Target, gp: true },
    { label: "Time to Goals", value: formatDays(daysToComplete), icon: Clock, gp: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="osrs-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <t.icon className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--gold))" }} />
            <p className="osrs-label text-sm truncate">{t.label}</p>
          </div>
          <p className={`${t.gp ? "osrs-gp" : "osrs-value"} text-2xl leading-tight`}>{t.value}</p>
        </div>
      ))}
    </div>
  );
}
