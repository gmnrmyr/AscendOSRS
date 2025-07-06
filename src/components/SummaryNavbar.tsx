import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, DollarSign, Users, Target, Coins } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";

export function SummaryNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const {
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay
  } = useAppState();

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
    let totalFromItems = 0;
    for (const [character, items] of Object.entries(bankData)) {
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
    let total = 0;
    for (const [character, items] of Object.entries(bankData)) {
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
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800 shadow-md">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {formatGP(currentGPHour)}/hr
                  </span>
                  <span className="text-xs text-gray-500">
                    ({activeMethodsCount} assigned)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {activeCharacters.length} chars
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    {formatGP(totalGoldValue)} GP
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {formatGP(totalGoalsValue)} goals
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Daily Earnings</p>
                    <p className="font-medium text-green-700">
                      {formatGP(currentGPHour * hoursPerDay)} GP
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Bank</p>
                    <p className="font-medium text-blue-700">
                      {formatGP(totalBankValue)} GP
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Progress</p>
                    <p className="font-medium text-purple-700">
                      {totalGoalsValue > 0 ? Math.min(100, (totalGoldValue / totalGoalsValue) * 100).toFixed(1) : 100}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Time to Goals</p>
                    <p className="font-medium text-orange-700">
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

