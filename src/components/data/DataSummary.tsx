
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSummaryProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
}

export function DataSummary({
  characters,
  moneyMethods,
  purchaseGoals,
  bankData
}: DataSummaryProps) {
  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-800">Current Data Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-amber-700">{characters.length}</div>
            <div className="text-sm text-amber-600">Characters</div>
          </div>
          <div className="p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-amber-700">{moneyMethods.length}</div>
            <div className="text-sm text-amber-600">Money Methods</div>
          </div>
          <div className="p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-amber-700">{purchaseGoals.length}</div>
            <div className="text-sm text-amber-600">Purchase Goals</div>
          </div>
          <div className="p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-amber-700">
              {Object.values(bankData).reduce((sum, items) => sum + items.length, 0)}
            </div>
            <div className="text-sm text-amber-600">Bank Items</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
