
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface BankItemFormProps {
  characters: any[];
  onAddItem: (item: any) => void;
}

export function BankItemForm({ characters, onAddItem }: BankItemFormProps) {
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    estimatedPrice: 0,
    category: 'other' as 'stackable' | 'gear' | 'materials' | 'other',
    character: ''
  });

  const addItem = () => {
    if (newItem.name && newItem.character) {
      const item = {
        ...newItem,
        id: crypto.randomUUID()
      };
      onAddItem(item);
      setNewItem({
        name: '',
        quantity: 0,
        estimatedPrice: 0,
        category: 'other' as 'stackable' | 'gear' | 'materials' | 'other',
        character: ''
      });
    }
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800">Add Bank Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g., Dragon Sword"
            />
          </div>
          
          <div>
            <Label htmlFor="item-character">Character</Label>
            <Select value={newItem.character} onValueChange={(value) => setNewItem({ ...newItem, character: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select character" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.name}>
                    {char.name} ({char.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="item-quantity">Quantity</Label>
            <Input
              id="item-quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="item-price">Estimated Price (Each)</Label>
            <Input
              id="item-price"
              type="number"
              value={newItem.estimatedPrice}
              onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="item-category">Category</Label>
            <Select 
              value={newItem.category} 
              onValueChange={(value: 'stackable' | 'gear' | 'materials' | 'other') => setNewItem({ ...newItem, category: value })}
            >
              <SelectTrigger>
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

        <Button onClick={addItem} className="w-full bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}
