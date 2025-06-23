
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { osrsApi } from "@/services/osrsApi";

interface PurchaseGoal {
  id: string;
  name: string;
  currentPrice: number;
  targetPrice?: number;
  quantity: number;
  priority: 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-';
  category: 'gear' | 'consumables' | 'materials' | 'other';
  notes: string;
  imageUrl?: string;
  itemId?: number;
}

interface GoalCardProps {
  goal: PurchaseGoal;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof PurchaseGoal, value: any) => void;
  formatGP: (amount: number) => string;
  getTotalCost: (goal: PurchaseGoal) => number;
  cyclePriority: (priority: PurchaseGoal['priority']) => PurchaseGoal['priority'];
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

export function GoalCard({
  goal,
  onRemove,
  onUpdate,
  formatGP,
  getTotalCost,
  cyclePriority,
  getPriorityColor,
  getCategoryColor
}: GoalCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {goal.imageUrl && (
              <div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded border p-1">
                <img 
                  src={goal.imageUrl} 
                  alt={goal.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallbackUrl = osrsApi.getItemIcon(goal.itemId || 995);
                    if (target.src !== fallbackUrl) {
                      target.src = fallbackUrl;
                    } else {
                      target.style.display = 'none';
                    }
                  }}
                />
              </div>
            )}
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
              {goal.name}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(goal.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(goal.category)}>
            {goal.category}
          </Badge>
          <Badge 
            className={`cursor-pointer border ${getPriorityColor(goal.priority)} hover:opacity-80 transition-opacity`}
            onClick={() => onUpdate(goal.id, 'priority', cyclePriority(goal.priority))}
            title="Click to change priority"
          >
            {goal.priority} priority
          </Badge>
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20">
            {formatGP(getTotalCost(goal))} GP
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500">Current Price (Wiki)</Label>
            <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm">
              {formatGP(goal.currentPrice)} GP
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-gray-500">Target Price (Optional)</Label>
            <Input
              type="number"
              value={goal.targetPrice || ''}
              onChange={(e) => onUpdate(goal.id, 'targetPrice', Number(e.target.value) || undefined)}
              className="h-8 text-sm"
              placeholder="Use current"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Quantity</Label>
          <Input
            type="number"
            value={goal.quantity}
            onChange={(e) => onUpdate(goal.id, 'quantity', Number(e.target.value))}
            className="h-8 text-sm"
            min="1"
          />
        </div>

        {goal.notes && (
          <div>
            <Label className="text-xs text-gray-500">Notes</Label>
            <Input
              value={goal.notes}
              onChange={(e) => onUpdate(goal.id, 'notes', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Cost:</span>
            <span className="font-medium text-amber-700 dark:text-amber-300">
              {formatGP(getTotalCost(goal))} GP
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
