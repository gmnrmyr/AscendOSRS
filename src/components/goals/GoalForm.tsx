
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { AutocompleteInput } from "../AutocompleteInput";
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

interface GoalFormProps {
  goals: PurchaseGoal[];
  setGoals: (goals: PurchaseGoal[]) => void;
  onAddDefaultGoals: () => void;
}

export function GoalForm({ goals, setGoals, onAddDefaultGoals }: GoalFormProps) {
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

  const searchItems = async (query: string) => {
    const items = await osrsApi.searchItems(query);
    
    return items.map(item => ({
      id: item.id,
      name: item.name,
      subtitle: 'OSRS Item',
      icon: item.icon,
      value: item.current_price || 0,
      category: 'item'
    }));
  };

  const handleItemSelect = async (option: any) => {
    let currentPrice = 0;
    let itemIcon = option.icon;
    let itemId = option.id;

    if (!itemId || !Number.isInteger(itemId)) {
      // Try to get item ID from the OSRS API mapping
      const searchResults = await osrsApi.searchItems(option.name);
      if (searchResults.length > 0) {
        itemId = searchResults[0].id;
        currentPrice = searchResults[0].current_price || 0;
        itemIcon = searchResults[0].icon || '';
      }
    } else {
      // Fetch price for the item
      try {
        currentPrice = await osrsApi.fetchSingleItemPrice(itemId);
      } catch (error) {
        currentPrice = option.value || 0;
      }
    }

    if (!itemIcon || itemIcon === '') {
      itemIcon = `https://oldschool.runescape.wiki/images/thumb/${itemId || 995}.png`;
    }

    setNewGoal({
      ...newGoal,
      name: option.name,
      currentPrice: currentPrice,
      imageUrl: itemIcon,
      itemId: itemId
    });
  };

  const addGoal = async () => {
    if (!newGoal.name?.trim()) return;

    let finalItemId = newGoal.itemId;
    let finalCurrentPrice = newGoal.currentPrice || 0;
    let finalImageUrl = newGoal.imageUrl;

    // If we don't have proper item data, try to fetch it
    if (!finalItemId || finalCurrentPrice === 0) {
      const searchResults = await osrsApi.searchItems(newGoal.name);
      if (searchResults.length > 0) {
        const item = searchResults[0];
        finalItemId = item.id;
        finalImageUrl = item.icon;
        
        try {
          finalCurrentPrice = await osrsApi.fetchSingleItemPrice(item.id);
        } catch (error) {
          finalCurrentPrice = item.current_price || 0;
        }
      }
    }

    if (!finalImageUrl || finalImageUrl === '') {
      finalImageUrl = `https://oldschool.runescape.wiki/images/thumb/${finalItemId || 995}.png`;
    }

    const goal: PurchaseGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      currentPrice: finalCurrentPrice,
      targetPrice: newGoal.targetPrice,
      quantity: newGoal.quantity || 1,
      priority: newGoal.priority || 'A',
      category: newGoal.category || 'gear',
      notes: newGoal.notes || '',
      imageUrl: finalImageUrl,
      itemId: finalItemId
    };

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
  };

  return (
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
              {newGoal.currentPrice ? `${newGoal.currentPrice.toLocaleString()} GP` : 'Select an item to fetch price'}
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
            <Button onClick={onAddDefaultGoals} variant="outline">
              Add Popular OSRS Goals
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
