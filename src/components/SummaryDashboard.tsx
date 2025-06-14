
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Clock, Users, Coins, Calendar } from "lucide-react";

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

  const formatTime = (hours: number) => {
    if (hours >= 24 * 365) {
      return `${(hours / (24 * 365)).toFixed(1)} years`;
    } else if (hours >= 24 * 30) {
      return `${(hours / (24 * 30)).toFixed(1)} months`;
    } else if (hours >= 24) {
      return `${(hours / 24).toFixed(1)} days`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  // Calculate total bank value
  const totalBankValue = Object.keys(bankData).reduce((total, character) => {
    const items = bankData[character] || [];
    return total + items.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
  }, 0);

  // Calculate total goal value
  const totalGoalValue = purchaseGoals.reduce((sum, goal) => {
    return sum + ((goal.targetPrice || goal.currentPrice) * goal.quantity);
  }, 0);

  // Calculate remaining amount needed
  const remainingNeeded = Math.max(0, totalGoalValue - totalBankValue);

  // Calculate best money making method
  const bestMethod = moneyMethods.length > 0 
    ? moneyMethods.reduce((best, method) => method.gpHour > best.gpHour ? method : best)
    : null;

  // Calculate time estimates
  const timeWithBestMethod = bestMethod && bestMethod.gpHour > 0 
    ? remainingNeeded / (bestMethod.gpHour * hoursPerDay)
    : 0;

  // Calculate total potential earnings from all methods
  const totalPotentialGPH = moneyMethods.reduce((sum, method) => sum + method.gpHour, 0);
  const timeWithAllMethods = totalPotentialGPH > 0 
    ? remainingNeeded / (totalPotentialGPH * hoursPerDay)
    : 0;

  // Calculate progress percentage
  const progressPercentage = totalGoalValue > 0 
    ? Math.min(100, (totalBankValue / totalGoalValue) * 100)
    : 0;

  // Get top goals by priority/value
  const topGoals = purchaseGoals
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);

  // Get top money methods
  const topMethods = moneyMethods
    .sort((a, b) => b.gpHour - a.gpHour)
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Bank Value</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {formatGP(totalBankValue)}
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Goal Value</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {formatGP(totalGoalValue)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Still Needed</p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {formatGP(remainingNeeded)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Characters</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {characters.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Time Estimates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Target className="h-5 w-5" />
              Progress to Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Current Value</p>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatGP(totalBankValue)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Target Value</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {formatGP(totalGoalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Clock className="h-5 w-5" />
              Time Estimates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Playing {hoursPerDay} hours/day</p>
            </div>
            
            {bestMethod && remainingNeeded > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Best Method: {bestMethod.name}
                </p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {formatTime(timeWithBestMethod)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatGP(bestMethod.gpHour)}/hr
                </p>
              </div>
            )}

            {moneyMethods.length > 1 && remainingNeeded > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  All Methods Combined
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {formatTime(timeWithAllMethods)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatGP(totalPotentialGPH)}/hr total
                </p>
              </div>
            )}

            {remainingNeeded <= 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  🎉 Goals Achieved!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  You have enough to purchase all your goals
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Goals and Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Target className="h-5 w-5" />
              Priority Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topGoals.length > 0 ? (
              <div className="space-y-3">
                {topGoals.map((goal, index) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200">
                          {goal.name}
                        </h4>
                        <Badge className={getPriorityColor(goal.priority)} size="sm">
                          {goal.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {formatGP((goal.targetPrice || goal.currentPrice) * goal.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {goal.quantity > 1 ? `x${goal.quantity}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No goals added yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <TrendingUp className="h-5 w-5" />
              Top Money Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topMethods.length > 0 ? (
              <div className="space-y-3">
                {topMethods.map((method, index) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200">
                          {method.name}
                        </h4>
                        {method.character && (
                          <p className="text-xs text-gray-500">{method.character}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-green-600 dark:text-green-400">
                        {formatGP(method.gpHour)}/hr
                      </p>
                      <p className="text-xs text-gray-500">
                        Intensity {method.clickIntensity}/5
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No methods added yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {characters.length > 0 && moneyMethods.length > 0 && purchaseGoals.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <TrendingUp className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remainingNeeded > 0 && bestMethod && (
              <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  💡 Fastest Path to Goals
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Focus on <strong>{bestMethod.name}</strong> for optimal progress. 
                  At {formatGP(bestMethod.gpHour)}/hr, you'll reach your goals in{' '}
                  <strong>{formatTime(timeWithBestMethod)}</strong> playing {hoursPerDay} hours daily.
                </p>
              </div>
            )}

            {moneyMethods.length > 1 && (
              <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  🔄 Diversification Strategy
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Running all {moneyMethods.length} methods simultaneously could reduce time to{' '}
                  <strong>{formatTime(timeWithAllMethods)}</strong>. Consider using alts for AFK methods!
                </p>
              </div>
            )}

            {progressPercentage >= 75 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  🎯 Almost There!
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  You're {progressPercentage.toFixed(1)}% of the way to your goals. 
                  Just {formatGP(remainingNeeded)} more to go!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
