import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, DollarSign, Users, Target, Coins, Landmark, RefreshCw } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";
import { useToast } from "@/hooks/use-toast";

export function SummaryNavbar({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const {
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    refreshAllPrices
  } = useAppState();

  // Atualiza preço de TUDO (todos os bancos + goals) com o GE ao vivo.
  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const { bankChanged, goalsChanged } = await refreshAllPrices();
      toast({
        title: "Preços atualizados (GE ao vivo)",
        description: `${bankChanged} itens de banco e ${goalsChanged} goals reprecificados.`,
      });
    } catch (e) {
      console.error("Falha ao atualizar preços globais:", e);
      toast({ title: "Erro", description: "Falha ao buscar preços ao vivo.", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle scroll behavior for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Filter active characters and methods
  const activeCharacters = characters.filter(char => char.isActive);
  
  // Calculate current GP/hour from methods assigned to characters (same logic as dashboard)
  const getCurrentGPPerHour = () => {
    if (!moneyMethods || moneyMethods.length === 0) return 0;
    
    return moneyMethods.reduce((total, method) => {
      if (method?.isActive && method?.character && method?.character !== 'none' && method?.character !== '') {
        return total + (method?.gpHour || 0);
      }
      return total;
    }, 0);
  };

  // Calculate total bank value across all characters (including coins and plat tokens as raw GP)
  const getTotalBankValue = () => {
    // First try to calculate from bank items
    const validNames = new Set(characters.map((c) => c.name));
    let totalFromItems = 0;
    for (const [character, items] of Object.entries(bankData)) {
      if (!validNames.has(character)) continue; // ignora lixo de chars removidos
      for (const item of items) {
        if (item.name && item.name.toLowerCase().includes('coin')) {
          totalFromItems += item.quantity || 0;
        } else if (item.name && item.name.toLowerCase().includes('platinum')) {
          totalFromItems += (item.quantity || 0) * 1000;
        } else {
          totalFromItems += (item.quantity || 0) * (item.estimatedPrice || 0);
        }
      }
    }
    
    // If we have bank items, use that value
    if (totalFromItems > 0) {
      return totalFromItems;
    }
    
    // Otherwise, fall back to character bank fields
    return characters.reduce((total, char) => total + (char.bank || 0), 0);
  };

  // Calculate total gold value (coins + plat tokens) across all characters
  const getTotalGoldValue = () => {
    const validNames = new Set(characters.map((c) => c.name));
    let total = 0;
    for (const [character, items] of Object.entries(bankData)) {
      if (!validNames.has(character)) continue; // ignora lixo de chars removidos
      for (const item of items) {
        if (item.name && item.name.toLowerCase().includes('coin')) {
          total += item.quantity || 0;
        } else if (item.name && item.name.toLowerCase().includes('platinum')) {
          total += (item.quantity || 0) * 1000;
        }
      }
    }
    return total;
  };

  // Calculate total goals value
  const getTotalGoalsValue = () => {
    return purchaseGoals.reduce((total, goal) => {
      const targetPrice = goal?.targetPrice || goal?.currentPrice || 0;
      const quantity = goal?.quantity || 1;
      return total + (targetPrice * quantity);
    }, 0);
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };


  
  const currentGPHour = getCurrentGPPerHour();
  const totalBankValue = getTotalBankValue();
  const totalGoldValue = getTotalGoldValue();
  const totalGoalsValue = getTotalGoalsValue();
  const activeMethodsCount = moneyMethods.filter(method => method?.isActive === true).length;

  return (
    <div 
      className={`fixed top-16 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-6">
        <Card className="osrs-card">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => onTabChange?.('methods')}
                  title="Ver métodos de dinheiro"
                  className="flex items-center gap-1 sm:gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[hsl(var(--gold))]" />
                  <span className="text-sm sm:text-base font-bold osrs-gp">
                    {formatGP(currentGPHour)}/hr
                  </span>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    ({activeMethodsCount} assigned)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange?.('characters')}
                  title="Ver personagens"
                  className="flex items-center gap-1 sm:gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[hsl(var(--gold))]" />
                  <span className="text-sm sm:text-base font-bold osrs-value">
                    {activeCharacters.length} chars
                  </span>
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-[hsl(var(--gold))]" />
                  <span className="text-sm sm:text-base font-bold osrs-value cursor-help" title={`${totalGoldValue.toLocaleString()} gp`}>
                    {formatGP(totalGoldValue)} GP
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onTabChange?.('bank')}
                  title={`${totalBankValue.toLocaleString()} gp — clique pra abrir o banco`}
                  className="flex items-center gap-1 sm:gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <Landmark className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                  <span className="text-sm sm:text-base font-bold text-orange-700 dark:text-orange-400">
                    {formatGP(totalBankValue)} bank
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange?.('goals')}
                  title={`${totalGoalsValue.toLocaleString()} gp — ver objetivos`}
                  className="flex items-center gap-1 sm:gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-[hsl(var(--gold))]" />
                  <span className="text-sm sm:text-base font-bold osrs-value">
                    {formatGP(totalGoalsValue)} goals
                  </span>
                </button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                title="Atualizar preço de tudo (todos os bancos + goals) com o GE ao vivo"
                className="h-10 w-10 sm:h-8 sm:w-8 p-2 sm:p-1 hover:bg-amber-100 dark:hover:bg-amber-800/20 ml-2"
              >
                <RefreshCw className={`h-5 w-5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-10 w-10 sm:h-8 sm:w-8 p-2 sm:p-1 hover:bg-amber-100 dark:hover:bg-amber-800/20 ml-1"
              >
                {isExpanded ? (
                  <ChevronUp className="h-6 w-6 sm:h-5 sm:w-5" />
                ) : (
                  <ChevronDown className="h-6 w-6 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-muted-foreground">Daily Earnings</p>
                    <p className="font-medium osrs-gp">
                      {formatGP(currentGPHour * hoursPerDay)} GP
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-muted-foreground">Total Bank</p>
                    <p className="font-medium osrs-value cursor-help" title={`${totalBankValue.toLocaleString()} gp`}>
                      {formatGP(totalBankValue)} GP
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-muted-foreground">Progress</p>
                    <p className="font-medium osrs-value">
                      {totalGoalsValue > 0 ? Math.min(100, (totalGoldValue / totalGoalsValue) * 100).toFixed(1) : 100}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-muted-foreground">Time to Goals</p>
                    <p className="font-medium text-orange-700 dark:text-orange-400">
                      {currentGPHour > 0 && totalGoalsValue > totalGoldValue 
                        ? `${Math.ceil((totalGoalsValue - totalGoldValue) / (currentGPHour * hoursPerDay))} days`
                        : 'Complete'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

