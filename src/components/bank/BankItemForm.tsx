
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

interface BankItemFormProps {
  newItem: Partial<BankItem>;
  setNewItem: (item: Partial<BankItem>) => void;
  onAddItem: () => void;
  onAddQuickItems: () => void;
}

export function BankItemForm({ newItem, setNewItem, onAddItem, onAddQuickItems }: BankItemFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Item Name</Label>
          <Input
            value={newItem.name || ''}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            placeholder="e.g., Prayer Potion(4)"
            className="bg-white dark:bg-slate-800"
          />
        </div>
        
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={newItem.quantity || ''}
            onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
            placeholder="1"
            className="bg-white dark:bg-slate-800"
          />
        </div>

        <div>
          <Label>Price Each (GP)</Label>
          <Input
            type="number"
            value={newItem.estimatedPrice || ''}
            onChange={(e) => setNewItem({...newItem, estimatedPrice: Number(e.target.value)})}
            placeholder="0"
            className="bg-white dark:bg-slate-800"
          />
        </div>

        <div>
          <Label>Category</Label>
          <Select 
            value={newItem.category} 
            onValueChange={(value) => setNewItem({...newItem, category: value as BankItem['category']})}
          >
            <SelectTrigger className="bg-white dark:bg-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stackable">Stackable</SelectItem>
              <SelectItem value="gear">Gear</SelectItem>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onAddItem} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
        
        <Button onClick={onAddQuickItems} variant="outline">
          Add Common Items
        </Button>
      </div>
    </>
  );
}
