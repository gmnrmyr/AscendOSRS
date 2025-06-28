
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface GoalFormProps {
  goals: any[];
  setGoals: (goals: any[]) => void;
}

export function GoalForm({ goals, setGoals }: GoalFormProps) {
  const [newGoal, setNewGoal] = useState({
    name: '',
    currentPrice: 0,
    targetPrice: 0,
    quantity: 1,
    priority: 'A' as 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-',
    category: 'gear' as 'gear' | 'consumables' | 'materials' | 'other',
    notes: '',
    imageUrl: ''
  });

  const addGoal = () => {
    if (newGoal.name) {
      const goal = {
        ...newGoal,
        id: crypto.randomUUID()
      };
      setGoals([...goals, goal]);
      setNewGoal({
        name: '',
        currentPrice: 0,
        targetPrice: 0,
        quantity: 1,
        priority: 'A' as 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-',
        category: 'gear' as 'gear' | 'consumables' | 'materials' | 'other',
        notes: '',
        imageUrl: ''
      });
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800">Add New Purchase Goal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="goal-name">Item Name</Label>
            <Input
              id="goal-name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              placeholder="e.g., Dragon Claws"
            />
          </div>
          
          <div>
            <Label htmlFor="current-price">Current Price (GP)</Label>
            <Input
              id="current-price"
              type="number"
              value={newGoal.currentPrice}
              onChange={(e) => setNewGoal({ ...newGoal, currentPrice: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="target-price">Target Price (GP)</Label>
            <Input
              id="target-price"
              type="number"
              value={newGoal.targetPrice}
              onChange={(e) => setNewGoal({ ...newGoal, targetPrice: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={newGoal.quantity}
              onChange={(e) => setNewGoal({ ...newGoal, quantity: parseInt(e.target.value) || 1 })}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={newGoal.priority} 
              onValueChange={(value: 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-') => setNewGoal({ ...newGoal, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S+">S+ - Highest</SelectItem>
                <SelectItem value="S">S - Very High</SelectItem>
                <SelectItem value="S-">S- - High+</SelectItem>
                <SelectItem value="A+">A+ - High</SelectItem>
                <SelectItem value="A">A - Medium-High</SelectItem>
                <SelectItem value="A-">A- - Medium</SelectItem>
                <SelectItem value="B+">B+ - Medium-Low</SelectItem>
                <SelectItem value="B">B - Low</SelectItem>
                <SelectItem value="B-">B- - Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="goal-category">Category</Label>
            <Select 
              value={newGoal.category} 
              onValueChange={(value: 'gear' | 'consumables' | 'materials' | 'other') => setNewGoal({ ...newGoal, category: value })}
            >
              <SelectTrigger>
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

        <div>
          <Label htmlFor="image-url">Image URL (Optional)</Label>
          <Input
            id="image-url"
            value={newGoal.imageUrl}
            onChange={(e) => setNewGoal({ ...newGoal, imageUrl: e.target.value })}
            placeholder="https://example.com/image.png"
          />
        </div>

        <div>
          <Label htmlFor="goal-notes">Notes</Label>
          <Textarea
            id="goal-notes"
            value={newGoal.notes}
            onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
            placeholder="Additional notes about this goal..."
            rows={3}
          />
        </div>

        <Button onClick={addGoal} className="w-full bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </CardContent>
    </Card>
  );
}
