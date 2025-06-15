import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Target, TrendingUp, Filter, SortAsc, SortDesc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AutocompleteInput } from "./AutocompleteInput";
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
    priority: 'A',
    category: 'gear',
    notes: '',
    imageUrl: '',
    itemId: undefined
  });
  
  // Filtering and sorting states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'priority'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  // Auto-save goals whenever they change
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('purchaseGoals', JSON.stringify(goals));
    }
  }, [goals]);

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

  // Only search for items, not money-making methods
  const searchItems = async (query: string) => {
    const items = await osrsApi.searchItems(query);
    
    // Fetch current prices for all search results
    const prices = await osrsApi.fetchItemPrices();
    
    return items.map(item => ({
      id: item.id,
      name: item.name,
      subtitle: 'OSRS Item',
      icon: item.icon,
      value: item.current_price || (prices[item.id]?.high) || 0,
      category: 'item'
    }));
  };

  const handleItemSelect = async (option: any) => {
    console.log('Selected item:', option);
    
    let currentPrice = 0;
    let itemIcon = option.icon;
    let itemId = option.id;

    // Try to get item ID from name if not provided
    if (!itemId) {
      const defaultItem = defaultGoals.find(g => g.name.toLowerCase() === option.name.toLowerCase());
      if (defaultItem) {
        itemId = defaultItem.itemId;
      }
    }

    // Fetch current price using item ID if available
    if (itemId) {
      try {
        console.log(`Fetching price for item ID: ${itemId}`);
        const priceData = await osrsApi.fetchSingleItemPrice(itemId);
        if (priceData?.high) {
          currentPrice = priceData.high;
          console.log(`Successfully fetched price: ${currentPrice}`);
        }
      } catch (error) {
        console.log('Could not fetch current price, using search value');
        currentPrice = option.value || 0;
      }
    } else {
      currentPrice = option.value || 0;
    }

    // Ensure we have a valid image URL
    if (!itemIcon || itemIcon === '') {
      itemIcon = osrsApi.getItemIcon(option.name);
    }

    console.log('Setting item with price:', currentPrice, 'and icon:', itemIcon);

    setNewGoal({
      ...newGoal,
      name: option.name,
      currentPrice: currentPrice,
      imageUrl: itemIcon,
      itemId: itemId
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

    // Ensure we have an image URL
    let finalImageUrl = newGoal.imageUrl;
    if (!finalImageUrl || finalImageUrl === '') {
      finalImageUrl = osrsApi.getItemIcon(newGoal.name);
    }

    const goal: PurchaseGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      currentPrice: newGoal.currentPrice || 0,
      targetPrice: newGoal.targetPrice,
      quantity: newGoal.quantity || 1,
      priority: newGoal.priority || 'A',
      category: newGoal.category || 'gear',
      notes: newGoal.notes || '',
      imageUrl: finalImageUrl,
      itemId: newGoal.itemId
    };

    console.log('Adding goal with price:', goal.currentPrice, 'and image:', goal.imageUrl);
    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      currentPrice: 0,
      targetPrice: 0,
      quantity: 1,
      priority: 'A',
      category: 'gear',
      notes: '',
      imageUrl: '',
      itemId: undefined
    });
    
    toast({
      title: "Success",
      description: `Goal ${goal.name} added successfully`
    });
  };

  const addDefaultGoals = async () => {
    console.log('Adding default goals with live prices...');
    
    const newGoals = [];
    
    for (const goal of defaultGoals) {
      try {
        console.log(`Fetching price for ${goal.name} (ID: ${goal.itemId})`);
        const priceData = await osrsApi.fetchSingleItemPrice(goal.itemId);
        const currentPrice = priceData?.high || goal.currentPrice;
        
        newGoals.push({
          id: Date.now().toString() + Math.random(),
          ...goal,
          currentPrice: currentPrice,
          targetPrice: currentPrice,
          quantity: 1,
          priority: goal.priority as PurchaseGoal['priority'],
          category: goal.category as PurchaseGoal['category'],
          notes: '',
          imageUrl: osrsApi.getItemIcon(goal.name)
        });
        
        console.log(`Added ${goal.name} with price: ${currentPrice}`);
      } catch (error) {
        console.error(`Error fetching price for ${goal.name}:`, error);
        // Add with default price if API fails
        newGoals.push({
          id: Date.now().toString() + Math.random(),
          ...goal,
          targetPrice: goal.currentPrice,
          quantity: 1,
          priority: goal.priority as PurchaseGoal['priority'],
          category: goal.category as PurchaseGoal['category'],
          notes: '',
          imageUrl: osrsApi.getItemIcon(goal.name)
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

  // Add function to refresh prices for existing goals
  const refreshPrices = async () => {
    console.log('Refreshing prices for all goals...');
    
    const updatedGoals = [];
    
    for (const goal of goals) {
      if (goal.itemId) {
        try {
          const priceData = await osrsApi.fetchSingleItemPrice(goal.itemId);
          if (priceData?.high) {
            updatedGoals.push({
              ...goal,
              currentPrice: priceData.high
            });
            console.log(`Updated price for ${goal.name}: ${priceData.high}`);
          } else {
            updatedGoals.push(goal);
          }
        } catch (error) {
          console.error(`Error refreshing price for ${goal.name}:`, error);
          updatedGoals.push(goal);
        }
      } else {
        updatedGoals.push(goal);
      }
    }
    
    setGoals(updatedGoals);
    toast({
      title: "Prices Updated",
      description: "Refreshed current prices from OSRS Wiki"
    });
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
            <div className="flex items-center gap-2">
              {goals.length > 0 && (
                <Button
                  onClick={refreshPrices}
                  variant="outline"
                  size="sm"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Refresh Prices
                </Button>
              )}
              <TrendingUp className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Filter className="h-5 w-5" />
              Filters & Sorting
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Filter by Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="S+">S+</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="S-">S-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="gear">Gear</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'price' | 'priority')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort Order</Label>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full justify-start"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardContent>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Item Name</Label>
              <AutocompleteInput
                value={newGoal.name || ''}
                onChange={(value) => setNewGoal({...newGoal, name: value})}
                onSelect={handleItemSelect}
                placeholder="e.g., Twisted bow, Bandos chestplate"
                searchFunction={searchItems}
                className="bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <Label>Current Price (GP) - From OSRS Wiki</Label>
              <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {newGoal.currentPrice ? formatGP(newGoal.currentPrice) : 'Select an item to fetch price'}
              </div>
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
                  <SelectItem value="S+">S+</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="S-">S-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
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
              <Label>Notes</Label>
              <Input
                value={newGoal.notes || ''}
                onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
                placeholder="Additional notes..."
                className="bg-white dark:bg-slate-800"
              />
            </div>
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
        {filteredAndSortedGoals.map((goal) => (
          <Card key={goal.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {goal.imageUrl && (
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded border p-1">
                      <img 
                        src={goal.imageUrl} 
                        alt={goal.name}
                        className="w-full h-full object-contain"
                        onLoad={() => console.log('Image loaded successfully:', goal.imageUrl)}
                        onError={(e) => {
                          console.log('Image failed to load:', goal.imageUrl);
                          const target = e.target as HTMLImageElement;
                          const fallbackUrl = osrsApi.getItemIcon(goal.name);
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
                <Badge 
                  className={`cursor-pointer border ${getPriorityColor(goal.priority)} hover:opacity-80 transition-opacity`}
                  onClick={() => updateGoal(goal.id, 'priority', cyclePriority(goal.priority))}
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
                    onChange={(e) => updateGoal(goal.id, 'targetPrice', Number(e.target.value) || undefined)}
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
  );
}
