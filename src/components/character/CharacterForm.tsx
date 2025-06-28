
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAppState } from "@/components/AppStateProvider";

export function CharacterForm() {
  const { characters, setCharacters } = useAppState();
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    type: 'main' as 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate',
    combatLevel: 3,
    totalLevel: 32,
    bank: 0,
    notes: '',
    platTokens: 0
  });

  const addCharacter = () => {
    if (newCharacter.name) {
      const character = {
        ...newCharacter,
        id: crypto.randomUUID(),
        isActive: true
      };
      setCharacters([...characters, character]);
      setNewCharacter({
        name: '',
        type: 'main',
        combatLevel: 3,
        totalLevel: 32,
        bank: 0,
        notes: '',
        platTokens: 0
      });
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Add New Character</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="char-name">Character Name</Label>
            <Input
              id="char-name"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              placeholder="Character name"
            />
          </div>
          
          <div>
            <Label htmlFor="char-type">Account Type</Label>
            <Select 
              value={newCharacter.type} 
              onValueChange={(value: any) => setNewCharacter({ ...newCharacter, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main</SelectItem>
                <SelectItem value="alt">Alt</SelectItem>
                <SelectItem value="ironman">Ironman</SelectItem>
                <SelectItem value="hardcore">Hardcore Ironman</SelectItem>
                <SelectItem value="ultimate">Ultimate Ironman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="combat-level">Combat Level</Label>
            <Input
              id="combat-level"
              type="number"
              min="3"
              max="126"
              value={newCharacter.combatLevel}
              onChange={(e) => setNewCharacter({ ...newCharacter, combatLevel: parseInt(e.target.value) || 3 })}
            />
          </div>

          <div>
            <Label htmlFor="total-level">Total Level</Label>
            <Input
              id="total-level"
              type="number"
              min="32"
              max="2277"
              value={newCharacter.totalLevel}
              onChange={(e) => setNewCharacter({ ...newCharacter, totalLevel: parseInt(e.target.value) || 32 })}
            />
          </div>

          <div>
            <Label htmlFor="bank-value">Bank Value (GP)</Label>
            <Input
              id="bank-value"
              type="number"
              min="0"
              value={newCharacter.bank}
              onChange={(e) => setNewCharacter({ ...newCharacter, bank: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="plat-tokens">Platinum Tokens</Label>
            <Input
              id="plat-tokens"
              type="number"
              min="0"
              value={newCharacter.platTokens}
              onChange={(e) => setNewCharacter({ ...newCharacter, platTokens: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="char-notes">Notes</Label>
          <Textarea
            id="char-notes"
            value={newCharacter.notes}
            onChange={(e) => setNewCharacter({ ...newCharacter, notes: e.target.value })}
            placeholder="Any additional notes about this character..."
            rows={3}
          />
        </div>

        <Button onClick={addCharacter} className="w-full bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </CardContent>
    </Card>
  );
}
