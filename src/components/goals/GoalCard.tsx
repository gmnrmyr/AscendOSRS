import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, DollarSign, Target, Hash, Star } from "lucide-react";

interface GoalCardProps {
  goal: any;
  onDelete?: (id: string) => void;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, field: string, value: any) => void;
  formatGP?: (amount: number) => string;
  getTotalCost?: (goal: any) => number;
  cyclePriority?: (priority: string) => string;
  getPriorityColor?: (priority: string) => string;
  getCategoryColor?: (category: string) => string;
}

export function GoalCard({ 
  goal, 
  onDelete, 
  onRemove,
  onUpdate,
  formatGP,
  getTotalCost,
  cyclePriority,
  getPriorityColor,
  getCategoryColor
}: GoalCardProps) {
  const handleDelete = onDelete || onRemove;
  
  const getPriorityColorDefault = (priority: string) => {
    switch (priority) {
      case 'S+': case 'S': case 'S-': return "bg-red-100 text-red-800";
      case 'A+': case 'A': case 'A-': return "bg-orange-100 text-orange-800";
      case 'B+': case 'B': case 'B-': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColorDefault = (category: string) => {
    switch (category) {
      case 'gear': return "bg-purple-100 text-purple-800";
      case 'consumables': return "bg-blue-100 text-blue-800";
      case 'materials': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatGPDefault = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const totalCost = getTotalCost ? getTotalCost(goal) : goal.currentPrice * goal.quantity;
  const targetTotal = goal.targetPrice ? goal.targetPrice * goal.quantity : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            {goal.imageUrl && (
              <img 
                src={goal.imageUrl} 
                alt={goal.name} 
                className="w-8 h-8 object-cover rounded"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            {goal.name}
          </CardTitle>
          {handleDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(goal.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={(getPriorityColor || getPriorityColorDefault)(goal.priority)}>
            <Star className="h-3 w-3 mr-1" />
            {goal.priority}
          </Badge>
          <Badge className={(getCategoryColor || getCategoryColorDefault)(goal.category)}>
            {goal.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Hash className="h-4 w-4" />
          <span>Quantity: {goal.quantity}</span>
        </div>
        
        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
          <DollarSign className="h-5 w-5" />
          <span>{formatGP ? formatGP(totalCost) : formatGPDefault(totalCost)} GP</span>
        </div>

        {targetTotal && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Target className="h-4 w-4" />
            <span>Target: {formatGP ? formatGP(targetTotal) : formatGPDefault(targetTotal)} GP</span>
          </div>
        )}

        {goal.notes && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
            <p className="text-sm text-gray-600">{goal.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
