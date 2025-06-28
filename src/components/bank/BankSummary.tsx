
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Package, TrendingUp, Users } from "lucide-react";

interface BankSummaryProps {
  characters: any[];
  bankData: Record<string, any[]>;
}

export function BankSummary({ characters, bankData }: BankSummaryProps) {
  const totalItems = Object.values(bankData).reduce((sum, items) => sum + items.length, 0);
  const totalValue = Object.values(bankData).reduce((sum, items) => {
    return sum + items.reduce((itemSum, item) => itemSum + (item.quantity * item.estimatedPrice), 0);
  }, 0);
  const totalCharacters = Object.keys(bankData).length;
  
  const categoryBreakdown = Object.values(bankData).flat().reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Items</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()} GP</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Characters</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCharacters}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Categories</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {String(category)}: {Number(count)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
