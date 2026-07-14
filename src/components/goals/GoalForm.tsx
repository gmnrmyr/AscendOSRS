
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { uid } from "@/lib/utils";
import { itemImageUrlByName } from "@/services/priceEngine";
import { ItemSearchInput } from "./ItemSearchInput";

interface GoalFormProps {
  goals: any[];
  setGoals: (goals: any[]) => void;
  onAddDefaultGoals?: () => Promise<void>;
}

export function GoalForm({ goals, setGoals, onAddDefaultGoals }: GoalFormProps) {
  const [newGoal, setNewGoal] = useState({
    name: '',
    currentPrice: 0,
    targetPrice: 0,
    quantity: 1,
    priority: 'A' as 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-',
    category: 'gear' as 'gear' | 'consumables' | 'materials' | 'other',
    notes: '',
    imageUrl: '',
    itemId: null as number | null
  });
  // Conquista (Infernal cape, Torso...): o item não se compra, mas os supplies custam GP (em M)
  const [isAchievement, setIsAchievement] = useState(false);
  const [suppliesM, setSuppliesM] = useState('');

  const handleItemSelect = (item: any) => {
    console.log('Selected OSRS item:', item);
    setNewGoal({
      ...newGoal,
      name: item.name,
      currentPrice: item.value || 0,
      targetPrice: item.value || 0,
      imageUrl: item.icon || '',
      itemId: item.id || null
    });
  };

  const addGoal = () => {
    if (newGoal.name) {
      const goal = {
        ...newGoal,
        id: uid(),
        // Sem imagem da busca (untradeable digitado à mão) — thumb pela Wiki por nome
        imageUrl: newGoal.imageUrl || itemImageUrlByName(newGoal.name),
        ...(isAchievement
          ? { buyable: false, suppliesCost: Math.max(0, parseFloat(suppliesM) || 0) * 1_000_000 }
          : {})
      };
      setGoals([...goals, goal]);
      setIsAchievement(false);
      setSuppliesM('');
      setNewGoal({
        name: '',
        currentPrice: 0,
        targetPrice: 0,
        quantity: 1,
        priority: 'A' as 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-',
        category: 'gear' as 'gear' | 'consumables' | 'materials' | 'other',
        notes: '',
        imageUrl: '',
        itemId: null
      });
    }
  };

  return (
    <Card className="osrs-card">
      <CardHeader>
        <CardTitle className="osrs-title flex items-center justify-between">
          Add New Purchase Goal
          {onAddDefaultGoals && (
            <Button onClick={onAddDefaultGoals} variant="outline" size="sm">
              Add Popular Goals
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="goal-name">OSRS Item Name</Label>
            <ItemSearchInput
              value={newGoal.name}
              onChange={(value) => setNewGoal({ ...newGoal, name: value })}
              onItemSelect={handleItemSelect}
              placeholder="Search OSRS items with prices..."
            />
          </div>
          
          <div>
            <Label htmlFor="current-price">Current Price (GP)</Label>
            <div className="bg-muted border rounded px-3 py-2 text-sm">
              {newGoal.currentPrice > 0 ? (
                <span className="text-green-600 font-medium">
                  {newGoal.currentPrice.toLocaleString()} GP
                </span>
              ) : (
                <span className="text-muted-foreground">Select an OSRS item to fetch current price</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="target-price">Target Price (GP)</Label>
            <Input
              id="target-price"
              type="number"
              value={newGoal.targetPrice}
              onChange={(e) => setNewGoal({ ...newGoal, targetPrice: parseInt(e.target.value) || 0, targetCustom: true } as any)}
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

        {newGoal.imageUrl && (
          <div className="flex items-center gap-2">
            <Label>Preview:</Label>
            <img 
              src={newGoal.imageUrl} 
              alt={newGoal.name} 
              className="w-8 h-8 object-cover rounded"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-sm text-gray-600">{newGoal.name}</span>
          </div>
        )}

        {/* Conquista: item de preço zero (Infernal, Quiver, Torso...) — o custo vira o de supplies */}
        <div className="flex flex-wrap items-center gap-4 rounded border border-border bg-muted/40 px-3 py-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Switch checked={isAchievement} onCheckedChange={setIsAchievement} />
            <span className="text-sm font-medium">🏆 Conquista (não se compra no GE)</span>
          </label>
          {isAchievement && (
            <div className="flex items-center gap-2">
              <Label htmlFor="supplies-cost" className="text-sm whitespace-nowrap">Custo supplies</Label>
              <Input
                id="supplies-cost"
                type="number"
                min="0"
                step="0.5"
                value={suppliesM}
                onChange={(e) => setSuppliesM(e.target.value)}
                placeholder="0"
                className="h-8 w-24"
                title="Estimativa em milhões de GP gastos em supplies pra tirar essa conquista"
              />
              <span className="text-sm text-muted-foreground">M GP</span>
            </div>
          )}
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

        <Button onClick={addGoal} className="osrs-button w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </CardContent>
    </Card>
  );
}
