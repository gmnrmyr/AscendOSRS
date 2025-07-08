import { SummaryCards } from "./summary/SummaryCards";
import { ProgressCard } from "./summary/ProgressCard";
import { DollarSign, Users, Target, Star, Brain, TrendingUp } from "lucide-react";

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
  
  // Calculate total bank value across all characters (including coins and plat tokens as raw GP)
  const getTotalBankValue = () => {
    let total = 0;
    for (const items of Object.values(bankData)) {
      for (const item of items) {
        if (item.name && item.name.toLowerCase().includes('coin')) {
          console.log('[BankSum] Coins:', item.name, item.quantity);
          total += item.quantity || 0;
        } else if (item.name && item.name.toLowerCase().includes('platinum')) {
          console.log('[BankSum] Plat:', item.name, item.quantity, '->', (item.quantity || 0) * 1000);
          total += (item.quantity || 0) * 1000;
        } else {
          console.log('[BankSum] Item:', item.name, item.quantity, item.estimatedPrice, '->', (item.quantity || 0) * (item.estimatedPrice || 0));
          total += (item.quantity || 0) * (item.estimatedPrice || 0);
        }
      }
    }
    console.log('[BankSum] Total:', total);
    return total;
  };

  // Calculate total gold value (coins + plat tokens) across all characters
  const getTotalGoldValue = () => {
    let total = 0;
    for (const items of Object.values(bankData)) {
      for (const item of items) {
        if (item.name && item.name.toLowerCase().includes('coin')) {
          console.log('[GoldSum] Coins:', item.name, item.quantity);
          total += item.quantity || 0;
        } else if (item.name && item.name.toLowerCase().includes('platinum')) {
          console.log('[GoldSum] Plat:', item.name, item.quantity, '->', (item.quantity || 0) * 1000);
          total += (item.quantity || 0) * 1000;
        }
      }
    }
    console.log('[GoldSum] Total:', total);
    return total;
  };

  // Calculate total goals value
  const getTotalGoalsValue = () => {
    return purchaseGoals.reduce((total, goal) => {
      const targetPrice = goal?.targetPrice || goal?.currentPrice || 0;
      const quantity = goal?.quantity || 0;
      return total + (targetPrice * quantity);
    }, 0);
  };

  // Calculate total current GP/hour from all active methods (use isActive instead of character assignment)
  const getCurrentGPPerHour = () => {
    if (!moneyMethods || moneyMethods.length === 0) return 0;
    
    return moneyMethods.reduce((total, method) => {
      // Use isActive flag instead of character assignment for more accurate calculations
      if (method?.isActive === true) {
        return total + (method?.gpHour || 0);
      }
      return total;
    }, 0);
  };

  // Get methods breakdown by character - only show active methods
  const getMethodsByCharacter = () => {
    if (!moneyMethods || moneyMethods.length === 0) return {};
    
    const methodsByChar: Record<string, any[]> = {};
    
    moneyMethods.forEach(method => {
      if (method?.isActive === true && method?.character && method?.character !== 'none' && method?.character !== '') {
        if (!methodsByChar[method.character]) {
          methodsByChar[method.character] = [];
        }
        methodsByChar[method.character].push(method);
      }
    });
    
    return methodsByChar;
  };

  // Calculate best money making method from active methods
  const getBestMethod = () => {
    if (!moneyMethods || moneyMethods.length === 0) return null;
    const activeMethods = moneyMethods.filter(method => method?.isActive === true);
    if (activeMethods.length === 0) return null;
    
    return activeMethods.reduce((best, current) => {
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

  // AI Insights for purchase recommendations
  const getAIInsights = () => {
    const totalGold = getTotalGoldValue();
    const totalBank = getTotalBankValue();
    const currentGPHour = getCurrentGPPerHour();
    const sortedGoals = [...purchaseGoals].sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
    
    // Get character gear analysis from bank data
    const hasHighEndGear = () => {
      const gearKeywords = ['twisted bow', 'scythe', 'shadow', 'armadyl', 'bandos', 'primordial', 'pegasian'];
      for (const items of Object.values(bankData)) {
        for (const item of items) {
          if (gearKeywords.some(keyword => item.name?.toLowerCase().includes(keyword))) {
            return true;
          }
        }
      }
      return false;
    };

    const hasRangedGear = () => {
      const rangedKeywords = ['crossbow', 'blowpipe', 'armadyl', 'pegasian', 'anguish'];
      for (const items of Object.values(bankData)) {
        for (const item of items) {
          if (rangedKeywords.some(keyword => item.name?.toLowerCase().includes(keyword))) {
            return true;
          }
        }
      }
      return false;
    };

    const hasMeleeGear = () => {
      const meleeKeywords = ['whip', 'dagger', 'claws', 'bandos', 'primordial', 'torture'];
      for (const items of Object.values(bankData)) {
        for (const item of items) {
          if (meleeKeywords.some(keyword => item.name?.toLowerCase().includes(keyword))) {
            return true;
          }
        }
      }
      return false;
    };

    const insights = [];

    // Wealth-based recommendations
    if (totalGold < 10000000) {
      insights.push("💡 Focus on basic gear upgrades like Abyssal Whip or Dragon Boots to improve your money-making efficiency.");
    } else if (totalGold < 50000000) {
      if (hasRangedGear()) {
        insights.push("🎯 Consider upgrading to Armadyl Crossbow or Blowpipe - your ranged setup could benefit from better weapons.");
      } else if (hasMeleeGear()) {
        insights.push("⚔️ Bandos gear would be a great next step to maximize your melee damage output.");
      } else {
        insights.push("🔧 Start building a combat specialty - choose between ranged or melee gear for better money-making methods.");
      }
    } else if (totalGold < 200000000) {
      if (hasRangedGear() && !hasHighEndGear()) {
        insights.push("🏹 You have solid ranged gear - Dragon Hunter Crossbow would unlock high-tier dragon killing methods.");
      } else if (hasMeleeGear() && !hasHighEndGear()) {
        insights.push("💪 Your melee setup is developing well - consider Prayer Scrolls (Rigour/Augury) for significant DPS boosts.");
      } else {
        insights.push("📈 You're in the mid-game tier - focus on specialized gear for your preferred combat style.");
      }
    } else {
      insights.push("🌟 You're ready for end-game content! Consider ultimate goals like Twisted Bow or Scythe of Vitur for the highest-tier PvM.");
    }

    // Method-based recommendations
    const activeMethods = moneyMethods.filter(m => m?.isActive === true);
    if (activeMethods.length === 0) {
      insights.push("⚠️ No active money-making methods detected. Add some methods to improve your GP/hour calculations!");
    } else if (currentGPHour < 1000000) {
      insights.push("📊 Your current methods are generating under 1M GP/hour. Consider upgrading to mid-tier methods like Zulrah or Vorkath.");
    } else if (currentGPHour > 5000000) {
      insights.push("🔥 Excellent GP/hour! You're running high-tier methods - keep this up for rapid goal completion.");
    }

    // Goal-specific recommendations
    if (sortedGoals.length > 0) {
      const affordableGoals = sortedGoals.filter(goal => (goal.currentPrice || 0) <= totalGold);
      if (affordableGoals.length > 0) {
        const nextGoal = affordableGoals[0];
        insights.push(`✅ You can afford ${nextGoal.name} right now! This could be a good immediate purchase.`);
      }
      
      const nearbyGoals = sortedGoals.filter(goal => {
        const price = goal.currentPrice || 0;
        return price > totalGold && price <= totalGold * 1.5;
      });
      
      if (nearbyGoals.length > 0) {
        const nextGoal = nearbyGoals[0];
        const daysNeeded = Math.ceil(((nextGoal.currentPrice || 0) - totalGold) / (currentGPHour * hoursPerDay));
        insights.push(`🎯 ${nextGoal.name} is within reach - only ${daysNeeded} days of current methods needed!`);
      }
    }

    return insights;
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
  const aiInsights = getAIInsights();

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

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="osrs-card p-6 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-600 dark:border-purple-400">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <Brain className="h-6 w-6" />
              🧠 AI Insights & Recommendations
            </h3>
          </div>
          
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg">
                <p className="text-purple-800 dark:text-purple-200 font-medium" style={{ fontFamily: 'Cinzel, serif' }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Earnings Breakdown */}
      {currentGPHour > 0 && (
        <div className="osrs-card p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-600 dark:border-green-400">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <DollarSign className="h-6 w-6" />
              💸 Current Earnings Breakdown
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-600 dark:border-green-400 rounded">
              <p className="text-3xl font-bold text-green-700 dark:text-green-300" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(currentGPHour)}/hr
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Hourly Rate</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-600 dark:border-green-400 rounded">
              <p className="text-3xl font-bold text-green-700 dark:text-green-300" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(currentGPHour * hoursPerDay)} GP
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Daily ({hoursPerDay}h)</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-600 dark:border-green-400 rounded">
              <p className="text-3xl font-bold text-green-700 dark:text-green-300" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                {formatGP(currentGPHour * hoursPerDay * 30)} GP
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>Monthly</p>
            </div>
          </div>

          {/* Methods by Character */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-green-800 dark:text-green-200" style={{ fontFamily: 'Cinzel, serif' }}>
              Methods by Character:
            </h4>
            {Object.entries(methodsByCharacter).map(([character, methods]) => {
              const characterTotal = methods.reduce((sum, method) => sum + (method?.gpHour || 0), 0);
              return (
                <div key={character} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-green-800 dark:text-green-200" style={{ fontFamily: 'Cinzel, serif' }}>
                      ⚔️ {character}
                    </span>
                    <span className="osrs-badge bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                      {formatGP(characterTotal)}/hr
                    </span>
                  </div>
                  <div className="space-y-1">
                    {methods.map((method, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-green-700 dark:text-green-300">{method.name}</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{formatGP(method.gpHour)}/hr</span>
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
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <Star className="h-5 w-5" />
              ⭐ Best Money Method
            </h3>
          </div>
          {bestMethod ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>
                  {bestMethod.name || 'Unknown Method'}
                </h4>
                <span className="osrs-badge">
                  {formatGP(bestMethod.gpHour)}/hr
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded">
                  <p className="text-amber-600 dark:text-amber-400 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Daily ({hoursPerDay}h)</p>
                  <p className="font-bold text-green-700 dark:text-green-300 text-lg" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                    {formatGP((bestMethod.gpHour || 0) * hoursPerDay)} GP
                  </p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded">
                  <p className="text-amber-600 dark:text-amber-400 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Monthly</p>
                  <p className="font-bold text-green-700 dark:text-green-300 text-lg" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                    {formatGP((bestMethod.gpHour || 0) * hoursPerDay * 30)} GP
                  </p>
                </div>
              </div>

              {bestMethod.requirements && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded">
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>Requirements:</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{bestMethod.requirements}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-amber-600 dark:text-amber-400 text-center py-6 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
              🔍 No money-making methods added yet
            </p>
          )}
        </div>

        {/* Character Summary */}
        <div className="osrs-card p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <Users className="h-5 w-5" />
              ⚔️ Character Overview
            </h3>
          </div>
          {characters && characters.length > 0 ? (
            <div className="space-y-3">
              {characters.slice(0, 3).map((char, index) => {
                // Get real bank value for this character from bankData
                const characterBankValue = bankData[char?.name] ? 
                  bankData[char?.name].reduce((total, item) => {
                    if (item.name && item.name.toLowerCase().includes('coin')) {
                      return total + (item.quantity || 0);
                    } else if (item.name && item.name.toLowerCase().includes('platinum')) {
                      return total + ((item.quantity || 0) * 1000);
                    } else {
                      return total + ((item.quantity || 0) * (item.estimatedPrice || 0));
                    }
                  }, 0) : (char?.bank || 0);
                
                return (
                  <div key={char?.id || index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-400 dark:border-amber-700 rounded">
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>⚔️ {char?.name || 'Unknown'}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400" style={{ fontFamily: 'Cinzel, serif' }}>
                        CB: {char?.combatLevel || 3} | Total: {char?.totalLevel || 32}
                      </p>
                    </div>
                    <span className="osrs-badge">
                      {formatGP(characterBankValue)} GP
                    </span>
                  </div>
                );
              })}
              
              {characters.length > 3 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 text-center pt-2 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                  +{characters.length - 3} more characters
                </p>
              )}
            </div>
          ) : (
            <p className="text-amber-600 dark:text-amber-400 text-center py-6 font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
              👤 No characters added yet
            </p>
          )}
        </div>
      </div>

      {/* Top Goals */}
      <div className="osrs-card p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
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
                <div key={goal?.id || index} className="space-y-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>
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
