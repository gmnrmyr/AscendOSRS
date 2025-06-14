import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { osrsApi } from "@/services/osrsApi";

interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
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
    bank: 0,
    notes: ''
  });
  const [fetchingStats, setFetchingStats] = useState(false);
  const { toast } = useToast();

  const fetchPlayerStats = async () => {
    if (!newCharacter.name?.trim()) {
      toast({
        title: "Error",
        description: "Enter a character name first",
        variant: "destructive"
      });
      return;
    }

    setFetchingStats(true);
    try {
      const stats = await osrsApi.fetchPlayerStats(newCharacter.name);
      
      if (stats) {
        setNewCharacter({
          ...newCharacter,
          combatLevel: stats.combat_level,
          totalLevel: stats.total_level,
          type: stats.account_type === 'regular' ? 'main' : 
                stats.account_type === 'ironman' ? 'ironman' :
                stats.account_type === 'hardcore' ? 'hardcore' :
                stats.account_type === 'ultimate' ? 'ultimate' : 'main'
        });
        
        toast({
          title: "Success",
          description: `Fetched stats for ${stats.name}: Combat ${stats.combat_level}, Total ${stats.total_level}`
        });
      } else {
        toast({
          title: "Player Not Found",
          description: "Could not find player stats. Please check the username or enter manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch player stats",
        variant: "destructive"
      });
    } finally {
      setFetchingStats(false);
    }
  };

  const addCharacter = () => {
    if (!newCharacter.name?.trim()) {
      toast({
        title: "Error",
        description: "Character name is required",
        variant: "destructive"
      });
      return;
    }

    const character: Character = {
      id: Date.now().toString(),
      name: newCharacter.name,
      type: newCharacter.type as Character['type'],
      combatLevel: newCharacter.combatLevel || 3,
      totalLevel: newCharacter.totalLevel || 32,
      bank: newCharacter.bank || 0,
      notes: newCharacter.notes || ''
    };

    setCharacters([...characters, character]);
    setNewCharacter({
      name: '',
      type: 'main',
      combatLevel: 3,
      totalLevel: 32,
      bank: 0,
      notes: ''
    });
    
    toast({
      title: "Success",
      description: `Character ${character.name} added successfully`
    });
  };

  const removeCharacter = (id: string) => {
    const characterToRemove = characters.find(c => c.id === id);
    setCharacters(characters.filter(c => c.id !== id));
    
    toast({
      title: "Character Removed",
      description: `${characterToRemove?.name} has been removed`
    });
  };

  const updateCharacter = (id: string, field: keyof Character, value: any) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  const getTypeColor = (type: Character['type']) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'alt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ironman': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'hardcore': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ultimate': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGold = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Add New Character */}
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Plus className="h-5 w-5" />
            Add New Character
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Character Name</Label>
              <div className="flex gap-2">
                <Input
                  value={newCharacter.name || ''}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  placeholder="Enter OSRS username"
                  className="bg-white dark:bg-slate-800"
                />
                <Button
                  onClick={fetchPlayerStats}
                  disabled={fetchingStats || !newCharacter.name?.trim()}
                  variant="outline"
                  size="sm"
                >
                  {fetchingStats ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click search to auto-fetch stats from OSRS Hiscores
              </p>
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

            <div>
              <Label>Combat Level</Label>
              <Input
                type="number"
                value={newCharacter.combatLevel || ''}
                onChange={(e) => setNewCharacter({...newCharacter, combatLevel: Number(e.target.value)})}
                placeholder="3"
                min="3"
                max="126"
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Total Level</Label>
              <Input
                type="number"
                value={newCharacter.totalLevel || ''}
                onChange={(e) => setNewCharacter({...newCharacter, totalLevel: Number(e.target.value)})}
                placeholder="32"
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
                placeholder="0"
                className="bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={newCharacter.notes || ''}
                onChange={(e) => setNewCharacter({...newCharacter, notes: e.target.value})}
                placeholder="Optional notes"
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <Button onClick={addCharacter} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Character
          </Button>
        </CardContent>
      </Card>

      {/* Character List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card key={character.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                  {character.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCharacter(character.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Badge className={getTypeColor(character.type)}>
                {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Combat Level</Label>
                  <Input
                    type="number"
                    value={character.combatLevel}
                    onChange={(e) => updateCharacter(character.id, 'combatLevel', Number(e.target.value))}
                    className="h-8 text-sm"
                    min="3"
                    max="126"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Total Level</Label>
                  <Input
                    type="number"
                    value={character.totalLevel}
                    onChange={(e) => updateCharacter(character.id, 'totalLevel', Number(e.target.value))}
                    className="h-8 text-sm"
                    min="32"
                    max="2277"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Bank Value</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={character.bank}
                    onChange={(e) => updateCharacter(character.id, 'bank', Number(e.target.value))}
                    className="h-8 text-sm flex-1"
                  />
                  <Badge variant="outline" className="text-xs">
                    {formatGold(character.bank)}gp
                  </Badge>
                </div>
              </div>

              {character.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Notes</Label>
                  <Input
                    value={character.notes}
                    onChange={(e) => updateCharacter(character.id, 'notes', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Notes"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {characters.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No characters yet</h3>
            <p className="text-gray-400 text-center">
              Add your first character to start tracking your OSRS progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
