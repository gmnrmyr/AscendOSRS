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
    // === S+ TIER - ULTIMATE GOALS ===
    { name: "Twisted bow", currentPrice: 1200000000, category: "gear", priority: "S+", itemId: 20997 },
    { name: "Scythe of vitur", currentPrice: 800000000, category: "gear", priority: "S+", itemId: 22325 },
    { name: "Tumeken's shadow", currentPrice: 1000000000, category: "gear", priority: "S+", itemId: 27277 },
    { name: "Sanguinesti staff", currentPrice: 80000000, category: "gear", priority: "S+", itemId: 22323 },
    { name: "Ghrazi rapier", currentPrice: 150000000, category: "gear", priority: "S+", itemId: 22324 },
    
    // === S TIER - VERY HIGH PRIORITY ===
    { name: "Avernic defender", currentPrice: 150000000, category: "gear", priority: "S", itemId: 22322 },
    { name: "Dragon hunter crossbow", currentPrice: 120000000, category: "gear", priority: "S", itemId: 21012 },
    { name: "Dragon hunter lance", currentPrice: 85000000, category: "gear", priority: "S", itemId: 22978 },
    { name: "Armadyl crossbow", currentPrice: 40000000, category: "gear", priority: "S", itemId: 11785 },
    { name: "Blowpipe", currentPrice: 4000000, category: "gear", priority: "S", itemId: 12926 },
    { name: "Trident of the swamp", currentPrice: 1200000, category: "gear", priority: "S", itemId: 12899 },
    
    // === A+ TIER - HIGH PRIORITY ===
    { name: "Primordial boots", currentPrice: 32000000, category: "gear", priority: "A+", itemId: 13239 },
    { name: "Pegasian boots", currentPrice: 38000000, category: "gear", priority: "A+", itemId: 13237 },
    { name: "Prayer scroll (rigour)", currentPrice: 45000000, category: "other", priority: "A+", itemId: 21034 },
    { name: "Prayer scroll (augury)", currentPrice: 25000000, category: "other", priority: "A+", itemId: 21079 },
    { name: "Dragon claws", currentPrice: 180000000, category: "gear", priority: "A+", itemId: 13652 },
    { name: "Bandos chestplate", currentPrice: 25000000, category: "gear", priority: "A+", itemId: 11832 },
    { name: "Bandos tassets", currentPrice: 28000000, category: "gear", priority: "A+", itemId: 11834 },
    { name: "Armadyl chestplate", currentPrice: 35000000, category: "gear", priority: "A+", itemId: 11828 },
    { name: "Armadyl chainskirt", currentPrice: 18000000, category: "gear", priority: "A+", itemId: 11830 },
    
    // === A TIER - MEDIUM-HIGH PRIORITY ===
    { name: "Eternal boots", currentPrice: 5000000, category: "gear", priority: "A", itemId: 13235 },
    { name: "Abyssal whip", currentPrice: 3000000, category: "gear", priority: "A", itemId: 4151 },
    { name: "Abyssal dagger", currentPrice: 6000000, category: "gear", priority: "A", itemId: 13265 },
    { name: "Saradomin sword", currentPrice: 1500000, category: "gear", priority: "A", itemId: 11838 },
    { name: "Zamorakian spear", currentPrice: 3500000, category: "gear", priority: "A", itemId: 11824 },
    { name: "Staff of the dead", currentPrice: 2000000, category: "gear", priority: "A", itemId: 11791 },
    { name: "Occult necklace", currentPrice: 1200000, category: "gear", priority: "A", itemId: 12002 },
    { name: "Berserker ring (i)", currentPrice: 3500000, category: "gear", priority: "A", itemId: 11770 },
    { name: "Archer ring (i)", currentPrice: 2500000, category: "gear", priority: "A", itemId: 11771 },
    { name: "Seers ring (i)", currentPrice: 800000, category: "gear", priority: "A", itemId: 11772 },
    { name: "Warrior ring (i)", currentPrice: 150000, category: "gear", priority: "A", itemId: 11773 },
    
    // === A- TIER - MEDIUM PRIORITY ===
    { name: "Fury amulet", currentPrice: 3000000, category: "gear", priority: "A-", itemId: 6585 },
    { name: "Tormented bracelet", currentPrice: 15000000, category: "gear", priority: "A-", itemId: 19544 },
    { name: "Necklace of anguish", currentPrice: 4000000, category: "gear", priority: "A-", itemId: 19553 },
    { name: "Amulet of torture", currentPrice: 12000000, category: "gear", priority: "A-", itemId: 19550 },
    { name: "Barrows gloves", currentPrice: 0, category: "gear", priority: "A-", itemId: 7462 },
    { name: "Fire cape", currentPrice: 0, category: "gear", priority: "A-", itemId: 6570 },
    { name: "Infernal cape", currentPrice: 0, category: "gear", priority: "A-", itemId: 21295 },
    { name: "Dragon defender", currentPrice: 0, category: "gear", priority: "A-", itemId: 12954 },
    { name: "Void melee helm", currentPrice: 0, category: "gear", priority: "A-", itemId: 11665 },
    { name: "Void range helm", currentPrice: 0, category: "gear", priority: "A-", itemId: 11664 },
    { name: "Void mage helm", currentPrice: 0, category: "gear", priority: "A-", itemId: 11663 },
    { name: "Void knight top", currentPrice: 0, category: "gear", priority: "A-", itemId: 8839 },
    { name: "Void knight robe", currentPrice: 0, category: "gear", priority: "A-", itemId: 8840 },
    
    // === B+ TIER - LOWER PRIORITY GEAR ===
    { name: "Dragon boots", currentPrice: 250000, category: "gear", priority: "B+", itemId: 11840 },
    { name: "Rune boots", currentPrice: 80000, category: "gear", priority: "B+", itemId: 4131 },
    { name: "Granite maul", currentPrice: 35000, category: "gear", priority: "B+", itemId: 4153 },
    { name: "Dragon scimitar", currentPrice: 100000, category: "gear", priority: "B+", itemId: 4587 },
    { name: "Dragon longsword", currentPrice: 60000, category: "gear", priority: "B+", itemId: 1305 },
    { name: "Rune crossbow", currentPrice: 9500, category: "gear", priority: "B+", itemId: 9185 },
    { name: "Magic shortbow (i)", currentPrice: 750000, category: "gear", priority: "B+", itemId: 12788 },
    { name: "Iban's staff", currentPrice: 0, category: "gear", priority: "B+", itemId: 1409 },
    { name: "Slayer helmet (i)", currentPrice: 0, category: "gear", priority: "B+", itemId: 11864 },
    
    // === CONSUMABLES ===
    { name: "Super combat potion(4)", currentPrice: 15000, category: "consumables", priority: "A", itemId: 12695 },
    { name: "Ranging potion(4)", currentPrice: 2500, category: "consumables", priority: "A", itemId: 2444 },
    { name: "Magic potion(4)", currentPrice: 1200, category: "consumables", priority: "A", itemId: 3040 },
    { name: "Prayer potion(4)", currentPrice: 10000, category: "consumables", priority: "A", itemId: 2434 },
    { name: "Saradomin brew(4)", currentPrice: 5000, category: "consumables", priority: "A", itemId: 6685 },
    { name: "Super restore(4)", currentPrice: 8000, category: "consumables", priority: "A", itemId: 3024 },
    { name: "Stamina potion(4)", currentPrice: 12000, category: "consumables", priority: "A", itemId: 12625 },
    { name: "Divine super combat potion(4)", currentPrice: 25000, category: "consumables", priority: "A+", itemId: 23685 },
    { name: "Divine ranging potion(4)", currentPrice: 18000, category: "consumables", priority: "A+", itemId: 23691 },
    { name: "Divine magic potion(4)", currentPrice: 15000, category: "consumables", priority: "A+", itemId: 23688 },
    { name: "Shark", currentPrice: 800, category: "consumables", priority: "B+", itemId: 385 },
    { name: "Karambwan", currentPrice: 1200, category: "consumables", priority: "B+", itemId: 3142 },
    { name: "Manta ray", currentPrice: 1500, category: "consumables", priority: "B+", itemId: 391 },
    { name: "Anglerfish", currentPrice: 1800, category: "consumables", priority: "A-", itemId: 13441 },
    
    // === MATERIALS ===
    { name: "Dragon bones", currentPrice: 2800, category: "materials", priority: "A", itemId: 536 },
    { name: "Superior dragon bones", currentPrice: 8500, category: "materials", priority: "A+", itemId: 22124 },
    { name: "Ensouled dragon head", currentPrice: 15000, category: "materials", priority: "A", itemId: 13511 },
    { name: "Mahogany logs", currentPrice: 450, category: "materials", priority: "B+", itemId: 6332 },
    { name: "Yew logs", currentPrice: 200, category: "materials", priority: "B", itemId: 1515 },
    { name: "Magic logs", currentPrice: 1100, category: "materials", priority: "B+", itemId: 1513 },
    { name: "Runite ore", currentPrice: 11000, category: "materials", priority: "B+", itemId: 451 },
    { name: "Adamantite ore", currentPrice: 1100, category: "materials", priority: "B", itemId: 449 },
    { name: "Coal", currentPrice: 180, category: "materials", priority: "B", itemId: 453 },
    { name: "Pure essence", currentPrice: 4, category: "materials", priority: "B", itemId: 7936 },
    { name: "Nature rune", currentPrice: 180, category: "materials", priority: "B+", itemId: 561 },
    { name: "Death rune", currentPrice: 220, category: "materials", priority: "B+", itemId: 560 },
    { name: "Blood rune", currentPrice: 400, category: "materials", priority: "A-", itemId: 565 },
    { name: "Wrath rune", currentPrice: 450, category: "materials", priority: "A-", itemId: 21880 },
    { name: "Ranarr seed", currentPrice: 45000, category: "materials", priority: "A", itemId: 5295 },
    { name: "Snapdragon seed", currentPrice: 55000, category: "materials", priority: "A", itemId: 5300 },
    { name: "Torstol seed", currentPrice: 58000, category: "materials", priority: "A", itemId: 5304 },
    
    // === OTHER/SPECIAL ITEMS ===
    { name: "Old school bond", currentPrice: 5000000, category: "other", priority: "B+", itemId: 13190 },
    { name: "Rune pouch", currentPrice: 0, category: "other", priority: "A-", itemId: 12791 },
    { name: "Looting bag", currentPrice: 0, category: "other", priority: "B+", itemId: 11739 },
    { name: "Herb sack", currentPrice: 0, category: "other", priority: "B+", itemId: 13226 },
    { name: "Seed box", currentPrice: 0, category: "other", priority: "B+", itemId: 13639 },
    { name: "Gem bag", currentPrice: 0, category: "other", priority: "B+", itemId: 12020 },
    { name: "Coal bag", currentPrice: 0, category: "other", priority: "B+", itemId: 12019 },
    { name: "Graceful outfit", currentPrice: 0, category: "other", priority: "A-", itemId: 11850 },
    { name: "Prospector outfit", currentPrice: 0, category: "other", priority: "B+", itemId: 12013 },
    { name: "Angler outfit", currentPrice: 0, category: "other", priority: "B+", itemId: 13258 },
    { name: "Lumberjack outfit", currentPrice: 0, category: "other", priority: "B+", itemId: 10933 },
    { name: "Farmer outfit", currentPrice: 0, category: "other", priority: "B+", itemId: 13646 },
    { name: "Rogue outfit", currentPrice: 0, category: "other", priority: "B+", itemId: 5553 },
    
    // === PETS (for collectors) ===
    { name: "Vorki", currentPrice: 0, category: "other", priority: "B-", itemId: 21992 },
    { name: "Venenatis spiderling", currentPrice: 0, category: "other", priority: "B-", itemId: 13177 },
    { name: "Callisto cub", currentPrice: 0, category: "other", priority: "B-", itemId: 13178 },
    { name: "Vet'ion jr.", currentPrice: 0, category: "other", priority: "B-", itemId: 13179 },
    { name: "Chaos elemental jr.", currentPrice: 0, category: "other", priority: "B-", itemId: 11995 },
    { name: "Kraken", currentPrice: 0, category: "other", priority: "B-", itemId: 12655 },
    { name: "Abyssal orphan", currentPrice: 0, category: "other", priority: "B-", itemId: 13262 },
    { name: "Jal-nib-rek", currentPrice: 0, category: "other", priority: "B-", itemId: 21291 },
    
    // === EXPENSIVE COSMETICS ===
    { name: "3rd age longsword", currentPrice: 500000000, category: "other", priority: "B-", itemId: 10330 },
    { name: "3rd age bow", currentPrice: 800000000, category: "other", priority: "B-", itemId: 10224 },
    { name: "3rd age wand", currentPrice: 1200000000, category: "other", priority: "B-", itemId: 10333 },
    { name: "3rd age pickaxe", currentPrice: 2000000000, category: "other", priority: "B-", itemId: 20014 },
    { name: "3rd age axe", currentPrice: 1800000000, category: "other", priority: "B-", itemId: 20011 },
    { name: "Gilded full helm", currentPrice: 500000, category: "other", priority: "B-", itemId: 3486 },
    { name: "Gilded platebody", currentPrice: 800000, category: "other", priority: "B-", itemId: 3481 },
    { name: "Gilded platelegs", currentPrice: 400000, category: "other", priority: "B-", itemId: 3483 }
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
