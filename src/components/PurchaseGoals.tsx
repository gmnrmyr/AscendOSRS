import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { osrsApi } from "@/services/osrsApi";
import { GoalForm } from "./goals/GoalForm";
import { GoalFilters } from "./goals/GoalFilters";
import { GoalCard } from "./goals/GoalCard";
import { useItemsRefresh } from "@/hooks/useItemsRefresh";

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

interface PurchaseGoalsProps {
  goals: PurchaseGoal[];
  setGoals: (goals: PurchaseGoal[]) => void;
}

export function PurchaseGoals({ goals, setGoals }: PurchaseGoalsProps) {
  // Filtering and sorting states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'priority'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();
  const { isRefreshing, metadata, refreshItems } = useItemsRefresh();

  // Auto-save goals whenever they change
  useEffect(() => {
    localStorage.setItem('purchaseGoals', JSON.stringify(goals));
  }, [goals]);

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('purchaseGoals');
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } catch (error) {
        console.error('Error parsing saved goals:', error);
      }
    }
  }, []);

  // Default popular OSRS purchase goals with correct item IDs
  const defaultGoals = [
    { name: "Twisted bow", currentPrice: 1200000000, category: "gear", priority: "S+", itemId: 20997 },
    { name: "Scythe of vitur", currentPrice: 800000000, category: "gear", priority: "S", itemId: 22325 },
    { name: "Avernic defender", currentPrice: 150000000, category: "gear", priority: "A+", itemId: 22322 },
    { name: "Primordial boots", currentPrice: 32000000, category: "gear", priority: "A", itemId: 13239 },
    { name: "Pegasian boots", currentPrice: 38000000, category: "gear", priority: "A", itemId: 13237 },
    { name: "Eternal boots", currentPrice: 5000000, category: "gear", priority: "A-", itemId: 13235 },
    { name: "Dragon claws", currentPrice: 180000000, category: "gear", priority: "A", itemId: 13652 },
    { name: "Bandos chestplate", currentPrice: 25000000, category: "gear", priority: "A-", itemId: 11832 },
    { name: "Bandos tassets", currentPrice: 28000000, category: "gear", priority: "A-", itemId: 11834 },
    { name: "Armadyl chestplate", currentPrice: 35000000, category: "gear", priority: "A", itemId: 11828 },
    { name: "Prayer scroll (rigour)", currentPrice: 45000000, category: "other", priority: "S-", itemId: 21034 },
    { name: "Prayer scroll (augury)", currentPrice: 25000000, category: "other", priority: "A+", itemId: 21079 },
    { name: "Old school bond", currentPrice: 5000000, category: "other", priority: "B+", itemId: 13190 }
  ];

  const addDefaultGoals = async () => {
    const newGoals = [];
    
    for (const goal of defaultGoals) {
      try {
        const priceData = await osrsApi.fetchSingleItemPrice(goal.itemId);
        const currentPrice = typeof priceData === 'number' ? priceData : goal.currentPrice;
        
        newGoals.push({
          id: Date.now().toString() + Math.random(),
          ...goal,
          currentPrice: currentPrice,
          targetPrice: currentPrice,
          quantity: 1,
          priority: goal.priority as PurchaseGoal['priority'],
          category: goal.category as PurchaseGoal['category'],
          notes: '',
          imageUrl: await osrsApi.getItemIcon(goal.itemId)
        });
      } catch (error) {
        newGoals.push({
          id: Date.now().toString() + Math.random(),
          ...goal,
          targetPrice: goal.currentPrice,
          quantity: 1,
          priority: goal.priority as PurchaseGoal['priority'],
          category: goal.category as PurchaseGoal['category'],
          notes: '',
          imageUrl: await osrsApi.getItemIcon(goal.itemId)
        });
      }
    }
    
    setGoals([...goals, ...newGoals]);
    toast({
      title: "Success",
      description: `Added ${newGoals.length} default purchase goals with live prices`
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

  const cyclePriority = (currentPriority: PurchaseGoal['priority']): PurchaseGoal['priority'] => {
    const priorities: PurchaseGoal['priority'][] = ['B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+'];
    const currentIndex = priorities.indexOf(currentPriority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    return priorities[nextIndex];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'S+': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';
      case 'S': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
      case 'S-': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300';
      case 'A+': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200';
      case 'A': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300';
      case 'A-': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200';
      case 'B+': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200';
      case 'B-': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  // Filtering and sorting logic
  const filteredAndSortedGoals = goals
    .filter(goal => {
      if (filterPriority !== 'all' && goal.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { 'S+': 9, 'S': 8, 'S-': 7, 'A+': 6, 'A': 5, 'A-': 4, 'B+': 3, 'B': 2, 'B-': 1 };
      
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = getTotalCost(a) - getTotalCost(b);
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalGoalValue = goals.reduce((sum, goal) => sum + getTotalCost(goal), 0);

  // Format the timestamp nicely
  const formatLastUpdate = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours ago, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours === 0) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show the date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold">Purchase Goals</h2>
            <Badge variant="outline" className="text-xs">
              Prices updated: {formatLastUpdate(metadata?.last_updated || null)}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshItems}
              disabled={isRefreshing}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {isRefreshing ? 'Updating...' : 'Update Prices'}
            </Button>
            {goals.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addDefaultGoals}
              >
                <Target className="h-4 w-4 mr-1" />
                Add Default Goals
              </Button>
            )}
          </div>
        </div>
        
        {/* Filters */}
        <GoalFilters
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onRefreshPrices={refreshItems}
          isRefreshing={isRefreshing}
          goalsCount={goals.length}
        />

        {/* Add New Goal */}
        <GoalForm 
          goals={goals}
          setGoals={setGoals}
          onAddDefaultGoals={addDefaultGoals}
        />

        {/* Goals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onRemove={removeGoal}
              onUpdate={updateGoal}
              formatGP={formatGP}
              getTotalCost={getTotalCost}
              cyclePriority={cyclePriority}
              getPriorityColor={getPriorityColor}
              getCategoryColor={getCategoryColor}
            />
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

        {filteredAndSortedGoals.length === 0 && goals.length > 0 && (
          <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No goals match your filters</h3>
              <p className="text-gray-400 text-center mb-4">
                Try adjusting your filter settings
              </p>
              <Button onClick={() => {
                setFilterPriority('all');
                setFilterCategory('all');
              }} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
