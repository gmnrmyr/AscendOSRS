
import { SummaryCards } from "./summary/SummaryCards";
import { ProgressCard } from "./summary/ProgressCard";
import { DollarSign, Users, Target, Star } from "lucide-react";

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

  // Calculate total gold value (coins + plat tokens) across all characters
  const getTotalGoldValue = () => {
    return Object.keys(bankData).reduce((total, character) => {
      const items = bankData[character] || [];
      const coins = items.find(item => item?.name?.toLowerCase().includes('coin'))?.quantity || 0;
      const platTokens = items.find(item => item?.name?.toLowerCase().includes('platinum'))?.quantity || 0;
      return total + coins + (platTokens * 1000);
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

  // Calculate total current GP/hour from all assigned methods
  const getCurrentGPPerHour = () => {
    if (!moneyMethods || moneyMethods.length === 0) return 0;
    
    return moneyMethods.reduce((total, method) => {
      if (method?.character && method?.character !== 'none' && method?.character !== '') {
        return total + (method?.gpHour || 0);
      }
      return total;
    }, 0);
  };

  // Get methods breakdown by character
  const getMethodsByCharacter = () => {
    if (!moneyMethods || moneyMethods.length === 0) return {};
    
    const methodsByChar: Record<string, any[]> = {};
    
    moneyMethods.forEach(method => {
      if (method?.character && method?.character !== 'none' && method?.character !== '') {
        if (!methodsByChar[method.character]) {
          methodsByChar[method.character] = [];
        }
        methodsByChar[method.character].push(method);
      }
    });
    
    return methodsByChar;
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

  // Calculate time to complete all goals using GOLD VALUE
  const getTimeToCompleteGoals = () => {
    const totalNeeded = getTotalGoalsValue() - getTotalGoldValue();
    if (totalNeeded <= 0) return 0;
    
    const currentGPHour = getCurrentGPPerHour();
    if (!currentGPHour) return Infinity;
    
    const dailyEarnings = currentGPHour * hoursPerDay;
    return Math.ceil(totalNeeded / dailyEarnings);
  };

  // Calculate completion percentage using GOLD VALUE
  const getCompletionPercentage = () => {
    const totalGoals = getTotalGoalsValue();
    const totalGold = getTotalGoldValue();
    if (totalGoals === 0) return 100;
    return Math.min(100, (totalGold / totalGoals) * 100);
  };

  const formatGP = (amount: number | undefined | null) => {
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
  const totalGoldValue = getTotalGoldValue();
  const totalGoalsValue = getTotalGoalsValue();
  const bestMethod = getBestMethod();
  const currentGPHour = getCurrentGPPerHour();
  const methodsByCharacter = getMethodsByCharacter();
  const daysToComplete = getTimeToCompleteGoals();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
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

      {/* Current Earnings Breakdown */}
      {currentGPHour > 0 && (
        <div className="osrs-card p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-green-600">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <DollarSign className="h-6 w-6" />
              💸 Current Earnings Breakdown
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 border-2 border-green-600 rounded">
              <p className="text-3xl font-bold text-green-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(currentGPHour)}/hr
              </p>
              <p className="text-sm text-green-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Hourly Rate</p>
            </div>
            <div className="text-center p-4 bg-green-50 border-2 border-green-600 rounded">
              <p className="text-3xl font-bold text-green-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(currentGPHour * hoursPerDay)} GP
              </p>
              <p className="text-sm text-green-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Daily ({hoursPerDay}h)</p>
            </div>
            <div className="text-center p-4 bg-green-50 border-2 border-green-600 rounded">
              <p className="text-3xl font-bold text-green-700" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(currentGPHour * hoursPerDay * 30)} GP
              </p>
              <p className="text-sm text-green-600 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Monthly</p>
            </div>
          </div>

          {/* Methods by Character */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-green-800" style={{ fontFamily: 'Cinzel, serif' }}>
              Methods by Character:
            </h4>
            {Object.entries(methodsByCharacter).map(([character, methods]) => {
              const characterTotal = methods.reduce((sum, method) => sum + (method?.gpHour || 0), 0);
              return (
                <div key={character} className="p-3 bg-green-50 border border-green-300 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-green-800" style={{ fontFamily: 'Cinzel, serif' }}>
                      ⚔️ {character}
                    </span>
                    <span className="osrs-badge bg-green-200 text-green-800">
                      {formatGP(characterTotal)}/hr
                    </span>
                  </div>
                  <div className="space-y-1">
                    {methods.map((method, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-green-700">{method.name}</span>
                        <span className="text-green-600 font-medium">{formatGP(method.gpHour)}/hr</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Card */}
      <ProgressCard
        totalGoldValue={totalGoldValue}
        totalGoalsValue={totalGoalsValue}
        completionPercentage={completionPercentage}
        formatGP={formatGP}
      />

      {/* Best Method & Character Overview */}
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
                    {formatGP(char?.bank || 0)} GP
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
              const currentValue = totalGoldValue; // Use gold value for progress
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
