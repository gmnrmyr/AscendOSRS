import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Users, Search, RefreshCcw, Tag } from "lucide-react";
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
    bank: 0,
    notes: '',
    isActive: true
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

  const toggleCharacterType = (id: string) => {
    const typeOrder: Character['type'][] = ['main', 'alt', 'ironman', 'hardcore', 'ultimate'];
    const character = characters.find(c => c.id === id);
    if (!character) return;

    const currentIndex = typeOrder.indexOf(character.type);
    const nextIndex = (currentIndex + 1) % typeOrder.length;
    const newType = typeOrder[nextIndex];

    updateCharacter(id, 'type', newType);
    
    toast({
      title: "Character Type Updated",
      description: `${character.name} is now a ${newType} account`
    });
  };

  const toggleCharacterActive = (id: string) => {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    updateCharacter(id, 'isActive', !character.isActive);
    
    toast({
      title: character.isActive ? "Character Deactivated" : "Character Activated",
      description: `${character.name} ${character.isActive ? 'will not count towards bank totals' : 'will count towards bank totals'}`
    });
  };

  const refreshCharacterStats = async (id: string) => {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    setFetchingStats(true);
    try {
      const stats = await osrsApi.fetchPlayerStats(character.name);
      
      if (stats) {
        updateCharacter(id, 'combatLevel', stats.combat_level);
        updateCharacter(id, 'totalLevel', stats.total_level);
        
        // Update type if it changed
        const newType = stats.account_type === 'regular' ? 'main' : 
                       stats.account_type === 'ironman' ? 'ironman' :
                       stats.account_type === 'hardcore' ? 'hardcore' :
                       stats.account_type === 'ultimate' ? 'ultimate' : 'main';
        
        if (newType !== character.type) {
          updateCharacter(id, 'type', newType);
        }
        
        toast({
          title: "Stats Refreshed",
          description: `Updated ${character.name}: Combat ${stats.combat_level}, Total ${stats.total_level}`
        });
      } else {
        toast({
          title: "Player Not Found",
          description: "Could not refresh player stats. Player may be banned or name changed.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh player stats",
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
      notes: '',
      isActive: true
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
      <Card className="osrs-card">
        <CardHeader>
          <CardTitle className="osrs-title flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Character
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="osrs-label">Character Name</Label>
              <div className="flex gap-2">
                <Input
                  value={newCharacter.name || ''}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  placeholder="Enter OSRS username"
                  className="osrs-input"
                />
                <Button
                  onClick={fetchPlayerStats}
                  disabled={fetchingStats || !newCharacter.name?.trim()}
                  variant="outline"
                  size="sm"
                  className="osrs-button-secondary"
                >
                  {fetchingStats ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-amber-700 mt-1 opacity-80">
                Click search to auto-fetch stats from OSRS Hiscores
              </p>
            </div>
            
            <div>
              <Label className="osrs-label">Account Type</Label>
              <Select 
                value={newCharacter.type} 
                onValueChange={(value) => setNewCharacter({...newCharacter, type: value as Character['type']})}
              >
                <SelectTrigger className="osrs-input">
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
              <Label className="osrs-label">Combat Level</Label>
              <Input
                type="number"
                value={newCharacter.combatLevel || ''}
                readOnly
                placeholder="Auto-fetched"
                className="osrs-input bg-amber-50 cursor-not-allowed"
                min="3"
                max="126"
              />
              <p className="text-xs text-amber-700 mt-1 opacity-80">
                Automatically fetched from Hiscores
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="osrs-label">Total Level</Label>
              <Input
                type="number"
                value={newCharacter.totalLevel || ''}
                readOnly
                placeholder="Auto-fetched"
                className="osrs-input bg-amber-50 cursor-not-allowed"
                min="32"
                max="2277"
              />
              <p className="text-xs text-amber-700 mt-1 opacity-80">
                Automatically fetched from Hiscores
              </p>
            </div>

            <div>
              <Label className="osrs-label">Bank Value (GP)</Label>
              <Input
                type="number"
                value={newCharacter.bank || ''}
                onChange={(e) => setNewCharacter({...newCharacter, bank: Number(e.target.value)})}
                placeholder="0"
                className="osrs-input"
              />
              <p className="text-xs text-amber-700 mt-1 opacity-80">
                Manual entry - can't be fetched automatically
              </p>
            </div>

            <div>
              <Label className="osrs-label">Notes</Label>
              <Input
                value={newCharacter.notes || ''}
                onChange={(e) => setNewCharacter({...newCharacter, notes: e.target.value})}
                placeholder="Optional notes"
                className="osrs-input"
              />
            </div>
          </div>

          <Button onClick={addCharacter} className="osrs-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Character
          </Button>
        </CardContent>
      </Card>

      {/* Character List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card key={character.id} className={`osrs-card ${!character.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="osrs-title text-lg">
                  {character.name}
                  {!character.isActive && (
                    <Badge variant="outline" className="ml-2 text-xs bg-red-100 text-red-800">
                      Inactive
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshCharacterStats(character.id)}
                    disabled={fetchingStats}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-1"
                    title="Refresh stats from OSRS Hiscores"
                  >
                    <RefreshCcw className={`h-4 w-4 ${fetchingStats ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCharacter(character.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  className={`${getTypeColor(character.type)} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                  onClick={() => toggleCharacterType(character.id)}
                  title="Click to cycle through account types"
                >
                  <Tag className="h-3 w-3" />
                  {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-amber-700">Active:</Label>
                  <Switch
                    checked={character.isActive}
                    onCheckedChange={() => toggleCharacterActive(character.id)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="osrs-label text-xs">Combat Level</Label>
                  <Input
                    type="number"
                    value={character.combatLevel}
                    readOnly
                    className="osrs-input h-8 text-sm bg-amber-50 cursor-not-allowed"
                    min="3"
                    max="126"
                  />
                </div>
                
                <div>
                  <Label className="osrs-label text-xs">Total Level</Label>
                  <Input
                    type="number"
                    value={character.totalLevel}
                    readOnly
                    className="osrs-input h-8 text-sm bg-amber-50 cursor-not-allowed"
                    min="32"
                    max="2277"
                  />
                </div>
              </div>

              <div>
                <Label className="osrs-label text-xs">Bank Value</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={character.bank}
                    onChange={(e) => updateCharacter(character.id, 'bank', Number(e.target.value))}
                    className="osrs-input h-8 text-sm flex-1"
                  />
                  <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800">
                    {formatGold(character.bank)}gp
                  </Badge>
                </div>
              </div>

              {character.notes && (
                <div>
                  <Label className="osrs-label text-xs">Notes</Label>
                  <Input
                    value={character.notes}
                    onChange={(e) => updateCharacter(character.id, 'notes', e.target.value)}
                    className="osrs-input h-8 text-sm"
                    placeholder="Notes"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {characters.length === 0 && (
        <Card className="osrs-card border-dashed border-amber-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="osrs-title text-lg mb-2">No characters yet</h3>
            <p className="text-amber-700 text-center opacity-80">
              Add your first character to start tracking your OSRS progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
