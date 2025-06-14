
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
      return total + items.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
    }, 0);
  };

  // Calculate total goals value
  const getTotalGoalsValue = () => {
    return purchaseGoals.reduce((total, goal) => {
      return total + ((goal.targetPrice || goal.currentPrice) * goal.quantity);
    }, 0);
  };

  // Calculate best money making method
  const getBestMethod = () => {
    if (moneyMethods.length === 0) return null;
    return moneyMethods.reduce((best, current) => 
      current.gpHour > best.gpHour ? current : best
    );
  };

  // Calculate time to complete all goals
  const getTimeToCompleteGoals = () => {
    const totalNeeded = getTotalGoalsValue() - getTotalBankValue();
    if (totalNeeded <= 0) return 0;
    
    const bestMethod = getBestMethod();
    if (!bestMethod) return Infinity;
    
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Characters</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{characters.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Bank Value</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {formatGP(totalBankValue)}
                </p>
              </div>
              <Coins className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Goals Value</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {formatGP(totalGoalsValue)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Time to Goals</p>
                <p className="text-xl font-bold text-orange-800 dark:text-orange-200">
                  {formatDays(daysToComplete)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Goal Completion
            </span>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {completionPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatGP(totalBankValue)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Bank</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatGP(Math.max(0, totalGoalsValue - totalBankValue))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Still Needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Method & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Money Method */}
        <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Star className="h-5 w-5" />
              Best Money Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestMethod ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-amber-800 dark:text-amber-200">
                    {bestMethod.name}
                  </h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {formatGP(bestMethod.gpHour)}/hr
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Daily ({hoursPerDay}h)</p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {formatGP(bestMethod.gpHour * hoursPerDay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly</p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {formatGP(bestMethod.gpHour * hoursPerDay * 30)}
                    </p>
                  </div>
                </div>

                {bestMethod.requirements && (
                  <div>
                    <p className="text-gray-500 text-sm">Requirements:</p>
                    <p className="text-sm">{bestMethod.requirements}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No money-making methods added yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Character Summary */}
        <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Users className="h-5 w-5" />
              Character Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {characters.length > 0 ? (
              <div className="space-y-3">
                {characters.slice(0, 3).map((char, index) => (
                  <div key={char.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">{char.name}</p>
                      <p className="text-sm text-gray-500">
                        CB: {char.combatLevel} | Total: {char.totalLevel}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatGP(char.bank)}
                    </Badge>
                  </div>
                ))}
                
                {characters.length > 3 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{characters.length - 3} more characters
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No characters added yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Goals */}
      <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Target className="h-5 w-5" />
            Purchase Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseGoals.length > 0 ? (
            <div className="space-y-4">
              {purchaseGoals.slice(0, 5).map((goal, index) => {
                const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-800 dark:text-amber-200">
                        {goal.name}
                      </span>
                      <Badge variant="outline">
                        {formatGP(goal.targetValue)}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatGP(goal.currentValue)} / {formatGP(goal.targetValue)}</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
              
              {purchaseGoals.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{purchaseGoals.length - 5} more goals
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No purchase goals added yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
