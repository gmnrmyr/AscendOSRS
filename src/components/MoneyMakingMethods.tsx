
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Coins, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoneyMethod {
  id: string;
  name: string;
  character: string;
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  requirements: string;
  notes: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
}

interface MoneyMakingMethodsProps {
  methods: MoneyMethod[];
  setMethods: (methods: MoneyMethod[]) => void;
  characters: any[];
}

export function MoneyMakingMethods({ methods, setMethods, characters }: MoneyMakingMethodsProps) {
  const [newMethod, setNewMethod] = useState<Partial<MoneyMethod>>({
    name: '',
    character: '',
    gpHour: 0,
    clickIntensity: 3,
    requirements: '',
    notes: '',
    category: 'combat'
  });
  const { toast } = useToast();

  // Default methods based on your spreadsheet
  const defaultMethods = [
    { name: "Brutal Black Dragons", gpHour: 1000000, clickIntensity: 3, requirements: "Tbow", category: "combat" },
    { name: "Rune Dragons", gpHour: 1200000, clickIntensity: 4, requirements: "High stats, gear", category: "combat" },
    { name: "Sapphire Ring Crafting (F2P)", gpHour: 120000, clickIntensity: 2, requirements: "None", category: "skilling" },
    { name: "Fletching Maple (u)", gpHour: 150000, clickIntensity: 1, requirements: "None", category: "skilling" },
    { name: "Cannonballs", gpHour: 150000, clickIntensity: 1, requirements: "Dwarf Cannon quest, 35 smithing", category: "skilling" },
    { name: "Magic Tabs", gpHour: 225000, clickIntensity: 2, requirements: "Magic level", category: "skilling" },
    { name: "Anglerfish", gpHour: 190000, clickIntensity: 1, requirements: "Piscarilius favour", category: "skilling" },
    { name: "Amethyst Mining", gpHour: 250000, clickIntensity: 1, requirements: "Dragon pickaxe", category: "skilling" },
    { name: "Kurasks", gpHour: 400000, clickIntensity: 3, requirements: "High slayer, quests, gear", category: "combat" },
    { name: "Sacred Eels", gpHour: 290000, clickIntensity: 1, requirements: "Cooking levels", category: "skilling" },
    { name: "Zulrah", gpHour: 2500000, clickIntensity: 5, requirements: "Tbow, high stats", category: "bossing" },
    { name: "Rune Smithing", gpHour: 400000, clickIntensity: 2, requirements: "99 smithing", category: "skilling" },
    { name: "Gargoyles", gpHour: 567000, clickIntensity: 3, requirements: "High slayer, gear", category: "combat" },
    { name: "Magic Logs", gpHour: 112500, clickIntensity: 1, requirements: "Hosidius favour", category: "skilling" },
    { name: "Giant Mole", gpHour: 800000, clickIntensity: 2, requirements: "Tbow recommended", category: "bossing" },
    { name: "Yew Logs (F2P)", gpHour: 80000, clickIntensity: 1, requirements: "None", category: "skilling" },
    { name: "Steel/Iron Smithing (F2P)", gpHour: 80000, clickIntensity: 2, requirements: "None", category: "skilling" },
    { name: "Adamant Ore (F2P)", gpHour: 80000, clickIntensity: 2, requirements: "None", category: "skilling" },
    { name: "Wyverns", gpHour: 600000, clickIntensity: 3, requirements: "High slayer, quests", category: "combat" }
  ];

  const addMethod = () => {
    if (!newMethod.name?.trim()) {
      toast({
        title: "Error",
        description: "Method name is required",
        variant: "destructive"
      });
      return;
    }

    const method: MoneyMethod = {
      id: Date.now().toString(),
      name: newMethod.name,
      character: newMethod.character || '',
      gpHour: newMethod.gpHour || 0,
      clickIntensity: newMethod.clickIntensity || 3,
      requirements: newMethod.requirements || '',
      notes: newMethod.notes || '',
      category: newMethod.category || 'combat'
    };

    setMethods([...methods, method]);
    setNewMethod({
      name: '',
      character: '',
      gpHour: 0,
      clickIntensity: 3,
      requirements: '',
      notes: '',
      category: 'combat'
    });
    
    toast({
      title: "Success",
      description: `Method ${method.name} added successfully`
    });
  };

  const addDefaultMethods = () => {
    const newMethods = defaultMethods.map(method => ({
      id: Date.now().toString() + Math.random(),
      ...method,
      character: '',
      clickIntensity: method.clickIntensity as 1 | 2 | 3 | 4 | 5,
      category: method.category as 'combat' | 'skilling' | 'bossing' | 'other'
    }));
    
    setMethods([...methods, ...newMethods]);
    toast({
      title: "Success",
      description: `Added ${newMethods.length} default money-making methods`
    });
  };

  const removeMethod = (id: string) => {
    const methodToRemove = methods.find(m => m.id === id);
    setMethods(methods.filter(m => m.id !== id));
    
    toast({
      title: "Method Removed",
      description: `${methodToRemove?.name} has been removed`
    });
  };

  const updateMethod = (id: string, field: keyof MoneyMethod, value: any) => {
    setMethods(methods.map(method => 
      method.id === id ? { ...method, [field]: value } : method
    ));
  };

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 4: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 5: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'skilling': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'bossing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Add New Method */}
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Plus className="h-5 w-5" />
            Add Money-Making Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Method Name</Label>
              <Input
                value={newMethod.name || ''}
                onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                placeholder="e.g., Zulrah, Vorkath, etc."
                className="bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <Label>Assigned Character</Label>
              <Select 
                value={newMethod.character} 
                onValueChange={(value) => setNewMethod({...newMethod, character: value})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select character (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {characters.map((char) => (
                    <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>GP per Hour</Label>
              <Input
                type="number"
                value={newMethod.gpHour || ''}
                onChange={(e) => setNewMethod({...newMethod, gpHour: Number(e.target.value)})}
                placeholder="1000000"
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Click Intensity (1-5)</Label>
              <Select 
                value={newMethod.clickIntensity?.toString()} 
                onValueChange={(value) => setNewMethod({...newMethod, clickIntensity: Number(value) as 1 | 2 | 3 | 4 | 5})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very AFK</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select 
                value={newMethod.category} 
                onValueChange={(value) => setNewMethod({...newMethod, category: value as MoneyMethod['category']})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
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

            <div>
              <Label>Requirements</Label>
              <Input
                value={newMethod.requirements || ''}
                onChange={(e) => setNewMethod({...newMethod, requirements: e.target.value})}
                placeholder="Stats, quests, gear..."
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Input
              value={newMethod.notes || ''}
              onChange={(e) => setNewMethod({...newMethod, notes: e.target.value})}
              placeholder="Additional notes..."
              className="bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={addMethod} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
            
            {methods.length === 0 && (
              <Button onClick={addDefaultMethods} variant="outline">
                Add Default Methods
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Methods List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {methods
          .sort((a, b) => b.gpHour - a.gpHour)
          .map((method) => (
          <Card key={method.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                  {method.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMethod(method.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(method.category)}>
                  {method.category}
                </Badge>
                <Badge className={getIntensityColor(method.clickIntensity)}>
                  Intensity {method.clickIntensity}
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20">
                  {formatGP(method.gpHour)}/hr
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">GP per Hour</Label>
                <Input
                  type="number"
                  value={method.gpHour}
                  onChange={(e) => updateMethod(method.id, 'gpHour', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Character</Label>
                <Select 
                  value={method.character} 
                  onValueChange={(value) => updateMethod(method.id, 'character', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="None assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {characters.map((char) => (
                      <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {method.requirements && (
                <div>
                  <Label className="text-xs text-gray-500">Requirements</Label>
                  <Input
                    value={method.requirements}
                    onChange={(e) => updateMethod(method.id, 'requirements', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              )}

              {method.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Notes</Label>
                  <Input
                    value={method.notes}
                    onChange={(e) => updateMethod(method.id, 'notes', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {methods.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Coins className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No money-making methods yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Add your preferred money-making methods to track profitability
            </p>
            <Button onClick={addDefaultMethods} variant="outline">
              Add Default Methods
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
