import { SummaryCards } from "./summary/SummaryCards";
import { ProgressCard } from "./summary/ProgressCard";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Target, Star, Scroll, Swords, Trophy } from "lucide-react";
import { availableGold, mainAccount } from "@/services/gold";
import type { AppSettings } from "@/hooks/useAppData";

interface SummaryDashboardProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  settings: AppSettings;
}

const GOLD = { color: "hsl(var(--gold))" };

export function SummaryDashboard({
  characters,
  moneyMethods,
  purchaseGoals,
  bankData,
  hoursPerDay,
  settings
}: SummaryDashboardProps) {

  // Valor de um item do save: coins/plat viram gp cru, resto quantity × preço vivo cacheado.
  const itemValue = (item: any) => {
    const name = (item.name || '').toLowerCase();
    if (name.includes('coin')) return item.quantity || 0;
    if (name.includes('platinum')) return (item.quantity || 0) * 1000;
    return (item.quantity || 0) * (item.estimatedPrice || 0);
  };

  const getTotalBankValue = () =>
    Object.values(bankData).reduce((t, items) => t + items.reduce((s, it) => s + itemValue(it), 0), 0);

  // Gold líquido pra comprar goals — MESMA regra da aba Goals (respeita os
  // toggles salvos: Runite bars como gold e "só a conta principal").
  const getTotalGoldValue = () => availableGold(bankData, settings);

  const getTotalGoalsValue = () =>
    purchaseGoals.reduce((total, goal) => {
      // Conquistas (buyable === false) não têm preço de GE — entram pelo custo de supplies
      if (goal?.buyable === false) return total + (goal?.suppliesCost || 0) * (goal?.quantity || 0);
      const targetPrice = goal?.targetPrice || goal?.currentPrice || 0;
      return total + targetPrice * (goal?.quantity || 0);
    }, 0);

  const getCurrentGPPerHour = () =>
    (moneyMethods || []).reduce((t, m) => (m?.isActive === true ? t + (m?.gpHour || 0) : t), 0);

  const getMethodsByCharacter = () => {
    const byChar: Record<string, any[]> = {};
    for (const m of moneyMethods || []) {
      if (m?.isActive === true && m?.character && m.character !== 'none' && m.character !== '') {
        (byChar[m.character] ??= []).push(m);
      }
    }
    return byChar;
  };

  const getBestMethod = () => {
    const active = (moneyMethods || []).filter((m) => m?.isActive === true);
    if (active.length === 0) return null;
    return active.reduce((best, cur) => ((cur?.gpHour || 0) > (best?.gpHour || 0) ? cur : best));
  };

  const getTimeToCompleteGoals = () => {
    const totalNeeded = getTotalGoalsValue() - getTotalGoldValue();
    if (totalNeeded <= 0) return 0;
    const gpHour = getCurrentGPPerHour();
    if (!gpHour) return Infinity;
    return Math.ceil(totalNeeded / (gpHour * hoursPerDay));
  };

  const getCompletionPercentage = () => {
    const totalGoals = getTotalGoalsValue();
    if (totalGoals === 0) return 100;
    return Math.min(100, (getTotalGoldValue() / totalGoals) * 100);
  };

  // Conselhos do "Wise Old Man" — recomendações baseadas em riqueza/métodos/goals.
  const getAdvisorNotes = () => {
    const totalGold = getTotalGoldValue();
    const currentGPHour = getCurrentGPPerHour();
    const sortedGoals = [...purchaseGoals].sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));

    const bankHas = (keywords: string[]) =>
      Object.values(bankData).some((items) =>
        items.some((it) => keywords.some((k) => it.name?.toLowerCase().includes(k))));

    const hasHighEndGear = () => bankHas(['twisted bow', 'scythe', 'shadow', 'armadyl', 'bandos', 'primordial', 'pegasian']);
    const hasRangedGear = () => bankHas(['crossbow', 'blowpipe', 'armadyl', 'pegasian', 'anguish']);
    const hasMeleeGear = () => bankHas(['whip', 'dagger', 'claws', 'bandos', 'primordial', 'torture']);

    const notes: string[] = [];

    if (totalGold < 10_000_000) {
      notes.push("Focus on basic gear upgrades like Abyssal Whip or Dragon Boots to improve your money-making efficiency.");
    } else if (totalGold < 50_000_000) {
      if (hasRangedGear()) notes.push("Consider upgrading to Armadyl Crossbow or Blowpipe - your ranged setup could benefit from better weapons.");
      else if (hasMeleeGear()) notes.push("Bandos gear would be a great next step to maximize your melee damage output.");
      else notes.push("Start building a combat specialty - choose between ranged or melee gear for better money-making methods.");
    } else if (totalGold < 200_000_000) {
      if (hasRangedGear() && !hasHighEndGear()) notes.push("You have solid ranged gear - Dragon Hunter Crossbow would unlock high-tier dragon killing methods.");
      else if (hasMeleeGear() && !hasHighEndGear()) notes.push("Your melee setup is developing well - consider Prayer Scrolls (Rigour/Augury) for significant DPS boosts.");
      else notes.push("You're in the mid-game tier - focus on specialized gear for your preferred combat style.");
    } else {
      notes.push("You're ready for end-game content. Ultimate goals like Twisted Bow or Scythe of Vitur await.");
    }

    const active = (moneyMethods || []).filter((m) => m?.isActive === true);
    if (active.length === 0) notes.push("No active money-making methods. Assign methods to your characters to project GP/hour.");
    else if (currentGPHour < 1_000_000) notes.push("Current methods are under 1M GP/hour. Zulrah or Vorkath would raise the ceiling.");
    else if (currentGPHour > 5_000_000) notes.push("Excellent GP/hour - high-tier methods running. Keep it up for rapid goal completion.");

    if (sortedGoals.length > 0) {
      const affordable = sortedGoals.filter((g) => (g.currentPrice || 0) <= totalGold);
      if (affordable.length > 0) notes.push(`You can afford ${affordable[0].name} right now.`);
      const nearby = sortedGoals.filter((g) => {
        const price = g.currentPrice || 0;
        return price > totalGold && price <= totalGold * 1.5;
      });
      if (nearby.length > 0 && currentGPHour > 0) {
        const days = Math.ceil(((nearby[0].currentPrice || 0) - totalGold) / (currentGPHour * hoursPerDay));
        notes.push(`${nearby[0].name} is within reach - about ${days} day${days === 1 ? '' : 's'} of grinding.`);
      }
    }

    return notes;
  };

  const formatGP = (amount: number | undefined | null) => {
    if (amount == null || isNaN(amount) || typeof amount !== 'number') return '0';
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toLocaleString();
  };

  const formatDays = (days: number) => {
    if (days === Infinity || days === 0) return "Complete";
    if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
    if (days < 365) { const m = Math.round(days / 30); return `${m} month${m === 1 ? '' : 's'}`; }
    const y = Math.round(days / 365);
    return `${y} year${y === 1 ? '' : 's'}`;
  };

  const totalBankValue = getTotalBankValue();
  const totalGoldValue = getTotalGoldValue();
  const totalGoalsValue = getTotalGoalsValue();
  const bestMethod = getBestMethod();
  const currentGPHour = getCurrentGPPerHour();
  const methodsByCharacter = getMethodsByCharacter();
  const daysToComplete = getTimeToCompleteGoals();
  const completionPercentage = getCompletionPercentage();
  const advisorNotes = getAdvisorNotes();

  return (
    <div className="space-y-6">
      {/* Tiles de status */}
      <SummaryCards
        charactersCount={characters?.length || 0}
        totalBankValue={totalBankValue}
        totalGoldValue={totalGoldValue}
        currentGPHour={currentGPHour}
        totalGoalsValue={totalGoalsValue}
        daysToComplete={daysToComplete}
        formatGP={formatGP}
        formatDays={formatDays}
      />

      {/* Conselheiro */}
      {advisorNotes.length > 0 && (
        <div className="osrs-card p-6">
          <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
            <Scroll className="h-5 w-5" style={GOLD} />
            Advisor
          </h3>
          <div className="space-y-2">
            {advisorNotes.map((note, i) => (
              <div key={i} className="osrs-inset p-3">
                <p className="osrs-muted text-base leading-snug">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ganhos atuais */}
      {currentGPHour > 0 && (
        <div className="osrs-card p-6">
          <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5" style={GOLD} />
            Current Earnings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[
              { v: `${formatGP(currentGPHour)}/hr`, l: "Hourly Rate" },
              { v: `${formatGP(currentGPHour * hoursPerDay)} gp`, l: `Daily (${hoursPerDay}h)` },
              { v: `${formatGP(currentGPHour * hoursPerDay * 30)} gp`, l: "Monthly" },
            ].map((c) => (
              <div key={c.l} className="osrs-inset text-center p-4">
                <p className="osrs-gp text-2xl">{c.v}</p>
                <p className="osrs-label text-sm mt-1">{c.l}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {Object.entries(methodsByCharacter).map(([character, methods]) => {
              const characterTotal = methods.reduce((sum, m) => sum + (m?.gpHour || 0), 0);
              return (
                <div key={character} className="osrs-inset p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="osrs-value text-base flex items-center gap-2">
                      <Swords className="h-4 w-4" style={GOLD} />
                      {character}
                    </span>
                    <span className="osrs-badge">{formatGP(characterTotal)}/hr</span>
                  </div>
                  <div className="space-y-1">
                    {methods.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="osrs-muted">{m.name}</span>
                        <span className="osrs-gp">{formatGP(m.gpHour)}/hr</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progresso geral */}
      <ProgressCard
        totalGoldValue={totalGoldValue}
        totalGoalsValue={totalGoalsValue}
        completionPercentage={completionPercentage}
        formatGP={formatGP}
        subtitle={`Coins + plat tokens${settings.runiteAsGold ? ' + Runite bars' : ''}${settings.goldMainOnly ? ` (só ${mainAccount(bankData) || 'conta principal'})` : ''} vs. total goals value`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Melhor método */}
        <div className="osrs-card p-6">
          <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
            <Star className="h-5 w-5" style={GOLD} />
            Best Money Method
          </h3>
          {bestMethod ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="osrs-value text-lg">{bestMethod.name || 'Unknown Method'}</h4>
                <span className="osrs-badge">{formatGP(bestMethod.gpHour)}/hr</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="osrs-inset p-3">
                  <p className="osrs-label text-sm">Daily ({hoursPerDay}h)</p>
                  <p className="osrs-gp text-lg">{formatGP((bestMethod.gpHour || 0) * hoursPerDay)} gp</p>
                </div>
                <div className="osrs-inset p-3">
                  <p className="osrs-label text-sm">Monthly</p>
                  <p className="osrs-gp text-lg">{formatGP((bestMethod.gpHour || 0) * hoursPerDay * 30)} gp</p>
                </div>
              </div>

              {bestMethod.requirements && (
                <div className="osrs-inset p-3">
                  <p className="osrs-label text-sm">Requirements</p>
                  <p className="osrs-muted text-sm">{bestMethod.requirements}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="osrs-muted text-center py-6">No money-making methods added yet</p>
          )}
        </div>

        {/* Personagens */}
        <div className="osrs-card p-6">
          <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" style={GOLD} />
            Character Overview
          </h3>
          {characters && characters.length > 0 ? (
            <div className="space-y-3">
              {characters.slice(0, 3).map((char, index) => {
                const characterBankValue = bankData[char?.name]
                  ? bankData[char.name].reduce((t, it) => t + itemValue(it), 0)
                  : (char?.bank || 0);
                return (
                  <div key={char?.id || index} className="osrs-inset flex items-center justify-between p-3">
                    <div>
                      <p className="osrs-value text-base">{char?.name || 'Unknown'}</p>
                      <p className="osrs-muted text-sm">CB {char?.combatLevel || 3} · Total {char?.totalLevel || 32}</p>
                    </div>
                    <span className="osrs-badge">{formatGP(characterBankValue)} gp</span>
                  </div>
                );
              })}
              {characters.length > 3 && (
                <p className="osrs-muted text-sm text-center pt-2">+{characters.length - 3} more characters</p>
              )}
            </div>
          ) : (
            <p className="osrs-muted text-center py-6">No characters added yet</p>
          )}
        </div>
      </div>

      {/* Top goals */}
      <div className="osrs-card p-6">
        <h3 className="osrs-title text-xl flex items-center gap-2 mb-4">
          <Target className="h-5 w-5" style={GOLD} />
          Purchase Goals Progress
        </h3>
        {purchaseGoals && purchaseGoals.length > 0 ? (
          <div className="space-y-3">
            {[...purchaseGoals]
              .sort((a, b) => (b?.targetPrice || b?.currentPrice || 0) - (a?.targetPrice || a?.currentPrice || 0))
              .slice(0, 5)
              .map((goal, index) => {
                const targetValue = goal?.targetPrice || goal?.currentPrice || 0;
                const progress = targetValue > 0 ? Math.min(100, (totalGoldValue / targetValue) * 100) : 0;
                return (
                  <div key={goal?.id || index} className="osrs-inset space-y-2 p-3">
                    <div className="flex items-center justify-between">
                      <span className="osrs-value text-base flex items-center gap-2">
                        {goal?.imageUrl ? (
                          <img
                            src={goal.imageUrl}
                            alt=""
                            className="h-6 w-6 object-contain"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Trophy className="h-4 w-4" style={GOLD} />
                        )}
                        {goal?.name || 'Unknown Goal'}
                      </span>
                      <span className="osrs-badge">{formatGP(targetValue)} gp</span>
                    </div>
                    <div className="osrs-progress h-3">
                      <div className="osrs-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="osrs-muted">{formatGP(totalGoldValue)} / {formatGP(targetValue)} gp</span>
                      <span className={progress >= 100 ? "osrs-gp" : "osrs-label"}>{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}

            {purchaseGoals.length > 5 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if ((window as any).onShowMoreGoals) (window as any).onShowMoreGoals();
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="osrs-button-secondary"
                >
                  <Target className="h-4 w-4 mr-2" />
                  View all {purchaseGoals.length} goals
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="osrs-muted text-center py-6">No purchase goals added yet</p>
        )}
      </div>
    </div>
  );
}
