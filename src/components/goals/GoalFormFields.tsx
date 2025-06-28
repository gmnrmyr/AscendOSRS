
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemSearchInput } from "./ItemSearchInput";

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

interface GoalFormFieldsProps {
  newGoal: Partial<PurchaseGoal>;
  setNewGoal: (goal: Partial<PurchaseGoal>) => void;
  onItemSelect: (item: any) => void;
}

export function GoalFormFields({ newGoal, setNewGoal, onItemSelect }: GoalFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Item Name</Label>
          <ItemSearchInput
            value={newGoal.name || ''}
            onChange={(value) => setNewGoal({...newGoal, name: value})}
            onItemSelect={onItemSelect}
          />
        </div>
        
        <div>
          <Label>Current Price (GP)</Label>
          <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm">
            {newGoal.currentPrice ? (
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                {newGoal.currentPrice.toLocaleString()} GP
              </span>
            ) : (
              <span className="text-gray-500">Select an item to fetch price</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </>
  );
}
