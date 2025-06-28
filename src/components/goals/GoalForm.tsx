
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalFormFields } from "./GoalFormFields";
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

  const handleItemSelect = async (option: any) => {
    console.log('Item selected:', option);
    
    let currentPrice = 0;
    let itemIcon = option.icon;
    let itemId = option.id;

    if (option.category === 'method') {
      // For money making methods, use the profit as price
      currentPrice = option.value;
      itemIcon = '';
    } else {
      // For items, get the current price and proper icon
      try {
        currentPrice = option.value || 0;
        
        // If we don't have a price, try to fetch it
        if (currentPrice === 0 && itemId) {
          console.log('Fetching price for item ID:', itemId);
          const fetchedPrice = await osrsApi.fetchSingleItemPrice(itemId);
          currentPrice = fetchedPrice || 0;
          console.log('Fetched price:', currentPrice);
        }
        
        // Ensure we have an icon
        if (!itemIcon && itemId) {
          itemIcon = await osrsApi.getItemIcon(itemId);
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
        currentPrice = option.value || 0;
      }
    }

    setNewGoal({
      ...newGoal,
      name: option.name,
      currentPrice: currentPrice,
      imageUrl: itemIcon || '',
      itemId: itemId
    });
    
    console.log('Updated goal state:', {
      name: option.name,
      currentPrice,
      imageUrl: itemIcon,
      itemId
    });
  };

  const addGoal = async () => {
    if (!newGoal.name?.trim()) {
      console.log('No goal name provided');
      return;
    }

    console.log('Adding goal:', newGoal);

    let finalItemId = newGoal.itemId;
    let finalCurrentPrice = newGoal.currentPrice || 0;
    let finalImageUrl = newGoal.imageUrl;

    // If we don't have proper item data, try to fetch it
    if (!finalItemId || finalCurrentPrice === 0) {
      console.log('Missing item data, searching for item:', newGoal.name);
      
      try {
        const searchResults = await osrsApi.searchOSRSItems(newGoal.name);
        if (searchResults.length > 0) {
          const item = searchResults[0];
          finalItemId = item.id;
          finalImageUrl = item.icon;
          finalCurrentPrice = item.value || 0;
          
          console.log('Found item data:', { finalItemId, finalCurrentPrice, finalImageUrl });
        }
      } catch (error) {
        console.error('Error searching for item data:', error);
      }
    }

    // Ensure we have an icon
    if (!finalImageUrl && finalItemId) {
      try {
        finalImageUrl = await osrsApi.getItemIcon(finalItemId) || '';
      } catch (error) {
        console.error('Error getting item icon:', error);
      }
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
      imageUrl: finalImageUrl || '',
      itemId: finalItemId
    };

    console.log('Final goal to add:', goal);
    setGoals([...goals, goal]);
    
    // Reset form
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
        <GoalFormFields
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          onItemSelect={handleItemSelect}
        />

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
