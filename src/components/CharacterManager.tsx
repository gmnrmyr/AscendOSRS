import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@/hooks/useAppData";
import { CharacterRefreshButton } from "./CharacterRefreshButton";

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

  const { toast } = useToast();

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
      type: newCharacter.type || 'main',
      combatLevel: newCharacter.combatLevel || 3,
      totalLevel: newCharacter.totalLevel || 32,
      bank: newCharacter.bank || 0,
      notes: newCharacter.notes || '',
      isActive: true
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
      title: "Character Added",
      description: `${character.name} has been added successfully`
    });
  };

  const removeCharacter = (id: string) => {
    const character = characters.find(c => c.id === id);
    setCharacters(characters.filter(c => c.id !== id));
    
    toast({
      title: "Character Removed",
      description: `${character?.name} has been removed`
    });
  };

  const updateCharacter = (id: string, field: keyof Character, value: any) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  const refreshCharacter = (updatedCharacter: Character) => {
    setCharacters(characters.map(char => 
      char.id === updatedCharacter.id ? updatedCharacter : char
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'alt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ironman': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'hardcore': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ultimate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">Character Manager</h2>
        <p className="text-amber-600 dark:text-amber-400">Manage your OSRS characters and track their progress</p>
      </div>

      {/* Add New Character */}
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Plus className="h-5 w-5" />
            Add New Character
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Character Name</Label>
              <Input
                value={newCharacter.name || ''}
                onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                placeholder="Enter OSRS username"
                className="bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <Label>Account Type</Label>
              <Select 
                value={newCharacter.type} 
                onValueChange={(value: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate') => setNewCharacter({...newCharacter, type: value})}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={newCharacter.notes || ''}
              onChange={(e) => setNewCharacter({...newCharacter, notes: e.target.value})}
              placeholder="Additional notes about this character..."
              className="bg-white dark:bg-slate-800"
            />
          </div>

          <Button onClick={addCharacter} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Character
          </Button>
        </CardContent>
      </Card>

      {/* Characters List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card key={character.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                    {character.name}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCharacter(character.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(character.type)}>
                  {character.type}
                </Badge>
                <CharacterRefreshButton 
                  character={character} 
                  onUpdate={refreshCharacter}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400">Combat Level</Label>
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
                <Label className="text-xs text-gray-500 dark:text-gray-400">Total Level</Label>
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

              {character.notes && (
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Notes</Label>
                  <Textarea
                    value={character.notes}
                    onChange={(e) => updateCharacter(character.id, 'notes', e.target.value)}
                    className="text-sm min-h-[60px]"
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
              Add your OSRS characters to start tracking their progress and bank values
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
