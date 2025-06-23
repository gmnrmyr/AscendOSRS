
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Star } from "lucide-react";

interface MoneyMakingMethod {
  id: string;
  name: string;
  character: string;
  gpHour: number;
  clickIntensity: number;
  requirements: string;
  notes: string;
  category?: string;
  membership?: string;
}

interface MoneyMakingOverviewProps {
  methods: MoneyMakingMethod[];
  formatGP: (amount: number) => string;
}

export function MoneyMakingOverview({ methods, formatGP }: MoneyMakingOverviewProps) {
  const totalPotentialGP = methods.reduce((sum, method) => sum + method.gpHour, 0);
  const avgGPHour = methods.length > 0 ? totalPotentialGP / methods.length : 0;
  const topMethod = methods.length > 0 ? methods.reduce((max, method) => 
    method.gpHour > max.gpHour ? method : max, methods[0]) : null;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <DollarSign className="h-5 w-5" />
          Money-Making Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Methods</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{methods.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg GP/Hour</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{formatGP(avgGPHour)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Potential</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{formatGP(totalPotentialGP)}</p>
          </div>
        </div>

        {topMethod && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">Top Method: {topMethod.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                {formatGP(topMethod.gpHour)}/hr
              </Badge>
              {topMethod.character && (
                <Badge variant="outline">
                  {topMethod.character}
                </Badge>
              )}
              <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                <Clock className="h-3 w-3 mr-1" />
                Intensity {topMethod.clickIntensity}/5
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
