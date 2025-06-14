import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AutocompleteInput } from "./AutocompleteInput";
import { osrsApi } from "@/services/osrsApi";

interface PurchaseGoal {
  id: string;
  name: string;
  currentPrice: number;
  targetPrice?: number;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'gear' | 'consumables' | 'materials' | 'other';
  notes: string;
  imageUrl?: string;
}

interface PurchaseGoalsProps {
  goals: PurchaseGoal[];
  setGoals: (goals: PurchaseGoal[]) => void;
}

export function PurchaseGoals({ goals, setGoals }: PurchaseGoalsProps) {
  const [newGoal, setNewGoal] = useState<Partial<PurchaseGoal>>({
    name: '',
    currentPrice: 0,
    targetPrice: 0,
    quantity: 1,
    priority: 'medium',
    category: 'gear',
    notes: '',
    imageUrl: ''
  });
  const { toast } = useToast();

  // Default popular OSRS purchase goals
  const defaultGoals = [
    { name: "Twisted Bow", currentPrice: 1200000000, category: "gear", priority: "critical" },
    { name: "Scythe of Vitur", currentPrice: 800000000, category: "gear", priority: "high" },
    { name: "Avernic Defender", currentPrice: 150000000, category: "gear", priority: "high" },
    { name: "Primordial Boots", currentPrice: 32000000, category: "gear", priority: "medium" },
    { name: "Pegasian Boots", currentPrice: 38000000, category: "gear", priority: "medium" },
    { name: "Eternal Boots", currentPrice: 5000000, category: "gear", priority: "medium" },
    { name: "Dragon Claws", currentPrice: 180000000, category: "gear", priority: "medium" },
    { name: "Bandos Chestplate", currentPrice: 25000000, category: "gear", priority: "medium" },
    { name: "Bandos Tassets", currentPrice: 28000000, category: "gear", priority: "medium" },
    { name: "Armadyl Chestplate", currentPrice: 35000000, category: "gear", priority: "medium" },
    { name: "Armadyl Chainskirt", currentPrice: 25000000, category: "gear", priority: "medium" },
    { name: "Dragon Hunter Lance", currentPrice: 75000000, category: "gear", priority: "medium" },
    { name: "Dragon Warhammer", currentPrice: 45000000, category: "gear", priority: "medium" },
    { name: "Elysian Spirit Shield", currentPrice: 850000000, category: "gear", priority: "high" },
    { name: "Spectral Spirit Shield", currentPrice: 90000000, category: "gear", priority: "low" },
    { name: "Arcane Spirit Shield", currentPrice: 150000000, category: "gear", priority: "medium" },
    { name: "Dragon Pickaxe", currentPrice: 12000000, category: "gear", priority: "medium" },
    { name: "Prayer Scroll (Rigour)", currentPrice: 45000000, category: "other", priority: "high" },
    { name: "Prayer Scroll (Augury)", currentPrice: 25000000, category: "other", priority: "medium" },
    { name: "Bonds x10", currentPrice: 50000000, category: "other", priority: "medium" }
  ];

  const searchItems = async (query: string) => {
    const items = await osrsApi.searchItems(query);
    return items.map(item => ({
      id: item.id,
      name: item.name,
      subtitle: 'OSRS Item',
      icon: item.icon,
      value: item.current_price,
      category: 'item'
    }));
  };

  const handleItemSelect = (option: any) => {
    setNewGoal({
      ...newGoal,
      name: option.name,
      currentPrice: option.value || 0,
      imageUrl: option.icon || ''
    });
  };

  const addGoal = () => {
    if (!newGoal.name?.trim()) {
      toast({
        title: "Error",
        description: "Goal name is required",
        variant: "destructive"
      });
      return;
    }

    const goal: PurchaseGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      currentPrice: newGoal.currentPrice || 0,
      targetPrice: newGoal.targetPrice,
      quantity: newGoal.quantity || 1,
      priority: newGoal.priority || 'medium',
      category: newGoal.category || 'gear',
      notes: newGoal.notes || '',
      imageUrl: newGoal.imageUrl
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      currentPrice: 0,
      targetPrice: 0,
      quantity: 1,
      priority: 'medium',
      category: 'gear',
      notes: '',
      imageUrl: ''
    });
    
    toast({
      title: "Success",
      description: `Goal ${goal.name} added successfully`
    });
  };

  const addDefaultGoals = () => {
    const newGoals = defaultGoals.map(goal => ({
      id: Date.now().toString() + Math.random(),
      ...goal,
      targetPrice: goal.currentPrice,
      quantity: 1,
      priority: goal.priority as 'low' | 'medium' | 'high' | 'critical',
      category: goal.category as 'gear' | 'consumables' | 'materials' | 'other',
      notes: '',
      imageUrl: `https://oldschool.runescape.wiki/images/${encodeURIComponent(goal.name.replace(/ /g, '_'))}.png`
    }));
    
    setGoals([...goals, ...newGoals]);
    toast({
      title: "Success",
      description: `Added ${newGoals.length} default purchase goals`
    });
  };

  const removeGoal = (id: string) => {
    const goalToRemove = goals.find(g => g.id === id);
    setGoals(goals.filter(g => g.id !== id));
    
    toast({
      title: "Goal Removed",
      description: `${goalToRemove?.name} has been removed`
    });
  };

  const updateGoal = (id: string, field: keyof PurchaseGoal, value: any) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gear': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'consumables': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'materials': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getTotalCost = (goal: PurchaseGoal) => {
    return (goal.targetPrice || goal.currentPrice) * goal.quantity;
  };

  const totalGoalValue = goals.reduce((sum, goal) => sum + getTotalCost(goal), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                Total Goal Value
              </h3>
              <p className="text-amber-600 dark:text-amber-300">
                {goals.length} goals • {formatGP(totalGoalValue)} GP total
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>

      {/* Add New Goal */}
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Plus className="h-5 w-5" />
            Add Purchase Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Item Name</Label>
              <AutocompleteInput
                value={newGoal.name || ''}
                onChange={(value) => setNewGoal({...newGoal, name: value})}
                onSelect={handleItemSelect}
                placeholder="e.g., Twisted Bow, Bandos Chestplate"
                searchFunction={searchItems}
                className="bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <Label>Current Price (GP)</Label>
              <Input
                type="number"
                value={newGoal.currentPrice || ''}
                onChange={(e) => setNewGoal({...newGoal, currentPrice: Number(e.target.value)})}
                placeholder="1200000000"
                className="bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <Label>Target Price (Optional)</Label>
              <Input
                type="number"
                value={newGoal.targetPrice || ''}
                onChange={(e) => setNewGoal({...newGoal, targetPrice: Number(e.target.value)})}
                placeholder="Leave empty to use current price"
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={newGoal.quantity || ''}
                onChange={(e) => setNewGoal({...newGoal, quantity: Number(e.target.value)})}
                placeholder="1"
                min="1"
                className="bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select 
                value={newGoal.priority} 
                onValueChange={(value) => setNewGoal({...newGoal, priority: value as PurchaseGoal['priority']})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select 
                value={newGoal.category} 
                onValueChange={(value) => setNewGoal({...newGoal, category: value as PurchaseGoal['category']})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gear">Gear</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Image URL (Optional)</Label>
              <Input
                value={newGoal.imageUrl || ''}
                onChange={(e) => setNewGoal({...newGoal, imageUrl: e.target.value})}
                placeholder="https://..."
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Input
              value={newGoal.notes || ''}
              onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
              placeholder="Additional notes..."
              className="bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={addGoal} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
            
            {goals.length === 0 && (
              <Button onClick={addDefaultGoals} variant="outline">
                Add Popular OSRS Goals
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals
          .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority] || getTotalCost(b) - getTotalCost(a);
          })
          .map((goal) => (
          <Card key={goal.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {goal.imageUrl && (
                    <img 
                      src={goal.imageUrl} 
                      alt={goal.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                    {goal.name}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(goal.category)}>
                  {goal.category}
                </Badge>
                <Badge className={getPriorityColor(goal.priority)}>
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
                  <Label className="text-xs text-gray-500">Current Price</Label>
                  <Input
                    type="number"
                    value={goal.currentPrice}
                    onChange={(e) => updateGoal(goal.id, 'currentPrice', Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Target Price</Label>
                  <Input
                    type="number"
                    value={goal.targetPrice || ''}
                    onChange={(e) => updateGoal(goal.id, 'targetPrice', Number(e.target.value) || undefined)}
                    className="h-8 text-sm"
                    placeholder="Auto"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Quantity</Label>
                <Input
                  type="number"
                  value={goal.quantity}
                  onChange={(e) => updateGoal(goal.id, 'quantity', Number(e.target.value))}
                  className="h-8 text-sm"
                  min="1"
                />
              </div>

              {goal.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Notes</Label>
                  <Input
                    value={goal.notes}
                    onChange={(e) => updateGoal(goal.id, 'notes', e.target.value)}
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
        ))}
      </div>

      {goals.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No purchase goals yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Add items you want to purchase to track your progress
            </p>
            <Button onClick={addDefaultGoals} variant="outline">
              Add Popular OSRS Goals
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
