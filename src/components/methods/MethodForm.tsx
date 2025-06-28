
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";

interface MethodFormProps {
  characters: any[];
}

export function MethodForm({ characters }: MethodFormProps) {
  const { moneyMethods, setMoneyMethods } = useAppState();
  const [newMethod, setNewMethod] = useState({
    name: '',
    character: '',
    gpHour: 0,
    clickIntensity: 1,
    requirements: '',
    notes: '',
    category: 'skilling'
  });

  const addMethod = () => {
    if (newMethod.name && newMethod.character) {
      const method = {
        ...newMethod,
        id: crypto.randomUUID()
      };
      setMoneyMethods([...moneyMethods, method]);
      setNewMethod({
        name: '',
        character: '',
        gpHour: 0,
        clickIntensity: 1,
        requirements: '',
        notes: '',
        category: 'skilling'
      });
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800">Add New Money Making Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="method-name">Method Name</Label>
            <Input
              id="method-name"
              value={newMethod.name}
              onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
              placeholder="e.g., Fishing Sharks"
            />
          </div>
          
          <div>
            <Label htmlFor="method-character">Character</Label>
            <Select value={newMethod.character} onValueChange={(value) => setNewMethod({ ...newMethod, character: value })}>
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
            <Label htmlFor="gp-hour">GP/Hour</Label>
            <Input
              id="gp-hour"
              type="number"
              value={newMethod.gpHour}
              onChange={(e) => setNewMethod({ ...newMethod, gpHour: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="click-intensity">Click Intensity (1-5)</Label>
            <Select 
              value={newMethod.clickIntensity.toString()} 
              onValueChange={(value) => setNewMethod({ ...newMethod, clickIntensity: parseInt(value) as 1 | 2 | 3 | 4 | 5 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Low</SelectItem>
                <SelectItem value="2">2 - Low</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - High</SelectItem>
                <SelectItem value="5">5 - Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="method-category">Category</Label>
            <Select value={newMethod.category} onValueChange={(value) => setNewMethod({ ...newMethod, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="combat">Combat</SelectItem>
                <SelectItem value="skilling">Skilling</SelectItem>
                <SelectItem value="bossing">Bossing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="requirements">Requirements</Label>
          <Input
            id="requirements"
            value={newMethod.requirements}
            onChange={(e) => setNewMethod({ ...newMethod, requirements: e.target.value })}
            placeholder="e.g., 76 Fishing, Dragon Harpoon"
          />
        </div>

        <div>
          <Label htmlFor="method-notes">Notes</Label>
          <Textarea
            id="method-notes"
            value={newMethod.notes}
            onChange={(e) => setNewMethod({ ...newMethod, notes: e.target.value })}
            placeholder="Additional notes about this method..."
            rows={3}
          />
        </div>

        <Button onClick={addMethod} className="w-full bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </CardContent>
    </Card>
  );
}
