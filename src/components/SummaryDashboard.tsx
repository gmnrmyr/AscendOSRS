
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Target, Coins, Clock, Star } from "lucide-react";

interface SummaryDashboardProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
}

export function SummaryDashboard({ 
  characters, 
  moneyMethods, 
  purchaseGoals, 
  bankData, 
  hoursPerDay 
}: SummaryDashboardProps) {
  
  // Calculate total bank value across all characters
  const getTotalBankValue = () => {
    return Object.keys(bankData).reduce((total, character) => {
      const items = bankData[character] || [];
      return total + items.reduce((sum, item) => {
        const quantity = item?.quantity || 0;
        const price = item?.estimatedPrice || 0;
        return sum + (quantity * price);
      }, 0);
    }, 0);
  };

  // Calculate total goals value
  const getTotalGoalsValue = () => {
    return purchaseGoals.reduce((total, goal) => {
      const targetPrice = goal?.targetPrice || goal?.currentPrice || 0;
      const quantity = goal?.quantity || 0;
      return total + (targetPrice * quantity);
    }, 0);
  };

  // Calculate best money making method
  const getBestMethod = () => {
    if (!moneyMethods || moneyMethods.length === 0) return null;
    return moneyMethods.reduce((best, current) => {
      const currentGpHour = current?.gpHour || 0;
      const bestGpHour = best?.gpHour || 0;
      return currentGpHour > bestGpHour ? current : best;
    });
  };

  // Calculate time to complete all goals
  const getTimeToCompleteGoals = () => {
    const totalNeeded = getTotalGoalsValue() - getTotalBankValue();
    if (totalNeeded <= 0) return 0;
    
    const bestMethod = getBestMethod();
    if (!bestMethod || !bestMethod.gpHour) return Infinity;
    
    const dailyEarnings = bestMethod.gpHour * hoursPerDay;
    return Math.ceil(totalNeeded / dailyEarnings);
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const totalGoals = getTotalGoalsValue();
    const totalBank = getTotalBankValue();
    if (totalGoals === 0) return 100;
    return Math.min(100, (totalBank / totalGoals) * 100);
  };

  const formatGP = (amount: number | undefined | null) => {
    // Handle undefined, null, or invalid numbers
    if (amount == null || isNaN(amount) || typeof amount !== 'number') {
      return '0';
    }
    
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const formatDays = (days: number) => {
    if (days === Infinity || days === 0) return "Complete";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  const totalBankValue = getTotalBankValue();
  const totalGoalsValue = getTotalGoalsValue();
  const bestMethod = getBestMethod();
  const daysToComplete = getTimeToCompleteGoals();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="osrs-card p-6 bg-gradient-to-br from-blue-100 to-blue-200 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>👥 Characters</p>
              <p className="text-4xl font-bold text-blue-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>{characters?.length || 0}</p>
            </div>
            <Users className="h-10 w-10 text-blue-700" />
          </div>
        </div>

        <div className="osrs-card p-6 bg-gradient-to-br from-green-100 to-green-200 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>💰 Bank Value</p>
              <p className="text-3xl font-bold text-green-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(totalBankValue)} GP
              </p>
            </div>
            <Coins className="h-10 w-10 text-green-700" />
          </div>
        </div>

        <div className="osrs-card p-6 bg-gradient-to-br from-purple-100 to-purple-200 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>🎯 Goals Value</p>
              <p className="text-3xl font-bold text-purple-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(totalGoalsValue)} GP
              </p>
            </div>
            <Target className="h-10 w-10 text-purple-700" />
          </div>
        </div>

        <div className="osrs-card p-6 bg-gradient-to-br from-orange-100 to-orange-200 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>⏰ Time to Goals</p>
              <p className="text-2xl font-bold text-orange-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatDays(daysToComplete)}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-700" />
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="osrs-card p-6 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-600">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-amber-800 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
            <TrendingUp className="h-6 w-6" />
            📈 Overall Progress
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>
              Goal Completion
            </span>
            <span className="osrs-badge text-base">
              {completionPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="osrs-progress h-4">
            <div 
              className="osrs-progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 border-2 border-green-600 rounded">
              <p className="text-3xl font-bold text-green-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(totalBankValue)} GP
              </p>
              <p className="text-sm text-green-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Current Bank</p>
            </div>
            <div className="text-center p-4 bg-purple-50 border-2 border-purple-600 rounded">
              <p className="text-3xl font-bold text-purple-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(Math.max(0, totalGoalsValue - totalBankValue))} GP
              </p>
              <p className="text-sm text-purple-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Still Needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Method & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Money Method */}
        <div className="osrs-card p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <Star className="h-5 w-5" />
              ⭐ Best Money Method
            </h3>
          </div>
          {bestMethod ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>
                  {bestMethod.name || 'Unknown Method'}
                </h4>
                <span className="osrs-badge">
                  {formatGP(bestMethod.gpHour)}/hr
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-amber-50 border border-amber-300 rounded">
                  <p className="text-amber-600 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Daily ({hoursPerDay}h)</p>
                  <p className="font-bold text-green-700 text-lg" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                    {formatGP((bestMethod.gpHour || 0) * hoursPerDay)} GP
                  </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded">
                  <p className="text-amber-600 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Monthly</p>
                  <p className="font-bold text-green-700 text-lg" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                    {formatGP((bestMethod.gpHour || 0) * hoursPerDay * 30)} GP
                  </p>
                </div>
              </div>

              {bestMethod.requirements && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded">
                  <p className="text-amber-600 text-sm font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Requirements:</p>
                  <p className="text-sm text-amber-800">{bestMethod.requirements}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-amber-600 text-center py-6 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
              🔍 No money-making methods added yet
            </p>
          )}
        </div>

        {/* Character Summary */}
        <div className="osrs-card p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <Users className="h-5 w-5" />
              👥 Character Overview
            </h3>
          </div>
          {characters && characters.length > 0 ? (
            <div className="space-y-3">
              {characters.slice(0, 3).map((char, index) => (
                <div key={char?.id || index} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-400 rounded">
                  <div>
                    <p className="font-bold text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>⚔️ {char?.name || 'Unknown'}</p>
                    <p className="text-sm text-amber-600" style={{ fontFamily: 'Cinzel, serif' }}>
                      CB: {char?.combatLevel || 0} | Total: {char?.totalLevel || 0}
                    </p>
                  </div>
                  <span className="osrs-badge">
                    {formatGP(char?.bank)} GP
                  </span>
                </div>
              ))}
              
              {characters.length > 3 && (
                <p className="text-sm text-amber-600 text-center pt-2 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                  +{characters.length - 3} more characters
                </p>
              )}
            </div>
          ) : (
            <p className="text-amber-600 text-center py-6 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
              👤 No characters added yet
            </p>
          )}
        </div>
      </div>

      {/* Top Goals */}
      <div className="osrs-card p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
            <Target className="h-5 w-5" />
            🎯 Purchase Goals Progress
          </h3>
        </div>
        {purchaseGoals && purchaseGoals.length > 0 ? (
          <div className="space-y-4">
            {purchaseGoals.slice(0, 5).map((goal, index) => {
              const targetValue = goal?.targetPrice || goal?.currentPrice || 0;
              const currentValue = goal?.currentValue || 0;
              const progress = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0;
              
              return (
                <div key={goal?.id || index} className="space-y-2 p-3 bg-amber-50 border border-amber-300 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>
                      🏆 {goal?.name || 'Unknown Goal'}
                    </span>
                    <span className="osrs-badge">
                      {formatGP(targetValue)} GP
                    </span>
                  </div>
                  <div className="osrs-progress h-3">
                    <div 
                      className="osrs-progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-amber-600" style={{ fontFamily: 'Cinzel, serif' }}>
                    <span>{formatGP(currentValue)} / {formatGP(targetValue)} GP</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
            
            {purchaseGoals.length > 5 && (
              <p className="text-sm text-amber-600 text-center pt-2 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                +{purchaseGoals.length - 5} more goals
              </p>
            )}
          </div>
        ) : (
          <p className="text-amber-600 text-center py-6 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
            🎯 No purchase goals added yet
          </p>
        )}
      </div>
    </div>
  );
}
