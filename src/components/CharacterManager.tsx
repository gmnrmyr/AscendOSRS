
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, TrendingUp, Search, Trash2 } from "lucide-react";
import { AutocompleteInput } from "./AutocompleteInput";
import { osrsApi } from "@/services/osrsApi";

interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
  isActive: boolean;
}

interface CharacterManagerProps {
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
}

export function CharacterManager({ characters, setCharacters }: CharacterManagerProps) {
  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
    name: '',
    type: 'main',
    combatLevel: 3,
    totalLevel: 32,
    bank: 10000,
    notes: '',
    isActive: true
  });

  const searchPlayerStats = async (query: string) => {
    // Return mock results for autocomplete
    return [
      { id: query, name: query, subtitle: 'OSRS Player', icon: '👤', value: query, category: 'player' }
    ];
  };

  const handlePlayerSelect = async (option: any) => {
    try {
      const stats = await osrsApi.fetchPlayerStats(option.name);
      if (stats) {
        setNewCharacter({
          ...newCharacter,
          name: stats.username,
          combatLevel: stats.combat_level,
          totalLevel: stats.total_level
        });
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
      // Fallback to just setting the name
      setNewCharacter({
        ...newCharacter,
        name: option.name
      });
    }
  };

  const addCharacter = async () => {
    if (!newCharacter.name?.trim()) return;

    let finalStats = { ...newCharacter };

    // Try to fetch real stats if we haven't already
    if (!finalStats.combatLevel || finalStats.combatLevel === 3) {
      try {
        const stats = await osrsApi.fetchPlayerStats(newCharacter.name);
        if (stats) {
          finalStats = {
            ...finalStats,
            combatLevel: stats.combat_level,
            totalLevel: stats.total_level
          };
        }
      } catch (error) {
        console.error('Error fetching player stats:', error);
      }
    }

    const character: Character = {
      id: Date.now().toString(),
      name: finalStats.name!,
      type: finalStats.type || 'main',
      combatLevel: finalStats.combatLevel || 3,
      totalLevel: finalStats.totalLevel || 32,
      bank: finalStats.bank || 10000,
      notes: finalStats.notes || '',
      isActive: finalStats.isActive ?? true
    };

    setCharacters([...characters, character]);
    setNewCharacter({
      name: '',
      type: 'main',
      combatLevel: 3,
      totalLevel: 32,
      bank: 10000,
      notes: '',
      isActive: true
    });
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, ...updates } : char
    ));
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const getTypeColor = (type: Character['type']) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'alt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ironman': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'hardcore': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ultimate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const activeCharacters = characters.filter(char => char.isActive);
  const totalBank = activeCharacters.reduce((sum, char) => sum + char.bank, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{activeCharacters.length}</p>
              <p className="text-sm text-muted-foreground">Active Characters</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{totalBank.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Bank (GP)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Search className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{characters.length}</p>
              <p className="text-sm text-muted-foreground">Total Characters</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Character Form */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Plus className="h-5 w-5" />
            Add Character
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Character Name</Label>
              <AutocompleteInput
                value={newCharacter.name || ''}
                onChange={(value) => setNewCharacter({...newCharacter, name: value})}
                onSelect={handlePlayerSelect}
                placeholder="e.g., Zezima, Lynx Titan"
                searchFunction={searchPlayerStats}
                className="bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <Label>Account Type</Label>
              <Select 
                value={newCharacter.type} 
                onValueChange={(value) => setNewCharacter({...newCharacter, type: value as Character['type']})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Combat Level</Label>
              <Input
                type="number"
                value={newCharacter.combatLevel || ''}
                onChange={(e) => setNewCharacter({...newCharacter, combatLevel: Number(e.target.value)})}
                placeholder="126"
                min="3"
                max="126"
                className="bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <Label>Total Level</Label>
              <Input
                type="number"
                value={newCharacter.totalLevel || ''}
                onChange={(e) => setNewCharacter({...newCharacter, totalLevel: Number(e.target.value)})}
                placeholder="2277"
                min="32"
                max="2277"
                className="bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <Label>Bank Value (GP)</Label>
              <Input
                type="number"
                value={newCharacter.bank || ''}
                onChange={(e) => setNewCharacter({...newCharacter, bank: Number(e.target.value)})}
                placeholder="1000000"
                min="0"
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={newCharacter.notes || ''}
              onChange={(e) => setNewCharacter({...newCharacter, notes: e.target.value})}
              placeholder="Any additional notes about this character..."
              className="bg-white dark:bg-slate-800"
            />
          </div>

          <Button onClick={addCharacter} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Character
          </Button>
        </CardContent>
      </Card>

      {/* Characters List */}
      <div className="grid grid-cols-1 gap-4">
        {characters.map((character) => (
          <Card key={character.id} className={character.isActive ? '' : 'opacity-60'}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{character.name}</h3>
                    <Badge className={getTypeColor(character.type)}>
                      {character.type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={character.isActive}
                        onCheckedChange={(checked) => updateCharacter(character.id, { isActive: checked })}
                      />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Combat:</span>
                      <span className="ml-1 font-medium">{character.combatLevel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="ml-1 font-medium">{character.totalLevel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="ml-1 font-medium">{character.bank.toLocaleString()} GP</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCharacter(character.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {character.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{character.notes}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {characters.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No characters yet</h3>
            <p className="text-muted-foreground">Add your first OSRS character to get started with tracking.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
