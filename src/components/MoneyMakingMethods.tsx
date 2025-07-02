import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Coins, TrendingUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AutocompleteInput } from "./AutocompleteInput";
import { osrsApi } from "@/services/osrsApi";

interface MoneyMethod {
  id: string;
  name: string;
  character: string;
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  requirements: string;
  notes: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  membership?: 'f2p' | 'p2p';
  isActive?: boolean;
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
    category: 'combat',
    isActive: false
  });
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const { toast } = useToast();

  // Enhanced: Show all methods from OSRS Wiki, with F2P/P2P distinction and all categories
  const searchMoneyMakers = async (query: string) => {
    // Use the API to get all methods, not just filtered
    const allMethods = await osrsApi.getDefaultMoneyMakers();
    // Filter by query (if any)
    const filtered = query
      ? allMethods.filter(method => method.name.toLowerCase().includes(query.toLowerCase()))
      : allMethods;
    return filtered.map(method => ({
      id: method.name,
      name: method.name,
      subtitle: `${method.profit?.toLocaleString()} GP/hr - ${typeof method.membership === 'string' ? method.membership.toUpperCase() : (method.membership ? 'P2P' : 'F2P')} - Intensity ${method.difficulty}/5 - ${method.category}`,
      category: method.category,
      membership: method.membership
    }));
  };

  const handleMethodSelect = async (option: any) => {
    const defaultMethods = await osrsApi.getDefaultMoneyMakers();
    const defaultMethod = defaultMethods.find(m => m.name === option.name);
    if (defaultMethod) {
      setNewMethod({
        ...newMethod,
        name: option.name,
        gpHour: defaultMethod.profit || defaultMethod.gpHour,
        clickIntensity: defaultMethod.difficulty as (1 | 2 | 3 | 4 | 5),
        requirements: Array.isArray(defaultMethod.requirements) ? defaultMethod.requirements.join(', ') : defaultMethod.requirements,
        notes: defaultMethod.description || defaultMethod.notes,
        category: defaultMethod.category,
        membership: typeof defaultMethod.membership === 'boolean' ? (defaultMethod.membership ? 'p2p' : 'f2p') : (defaultMethod.membership as 'f2p' | 'p2p')
      });
    }
  };

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
      category: newMethod.category || 'combat',
      membership: newMethod.membership || 'p2p',
      isActive: false
    };

    setMethods([...methods, method]);
    setNewMethod({
      name: '',
      character: '',
      gpHour: 0,
      clickIntensity: 3,
      requirements: '',
      notes: '',
      category: 'combat',
      membership: 'p2p',
      isActive: false
    });
    
    toast({
      title: "Success",
      description: `Method ${method.name} added successfully`
    });
  };

  const toggleMethodActive = (methodId: string) => {
    const method = methods.find(m => m.id === methodId);
    if (!method) return;

    // If activating a method, deactivate all other methods for the same character
    if (!method.isActive && method.character) {
      const updatedMethods = methods.map(m => {
        if (m.character === method.character && m.id !== methodId) {
          return { ...m, isActive: false };
        }
        if (m.id === methodId) {
          return { ...m, isActive: true };
        }
        return m;
      });
      setMethods(updatedMethods);
      
      toast({
        title: "Method Activated",
        description: `${method.name} is now active for ${method.character}`,
      });
    } else {
      // Just toggle the method
      const updatedMethods = methods.map(m => 
        m.id === methodId ? { ...m, isActive: !m.isActive } : m
      );
      setMethods(updatedMethods);
      
      toast({
        title: method.isActive ? "Method Deactivated" : "Method Activated",
        description: `${method.name} ${method.isActive ? 'deactivated' : 'activated'}`,
      });
    }
  };

  const updateMoneyPerHour = async () => {
    setIsUpdatingPrices(true);
    let updatedCount = 0;

    try {
      const updatedMethods = await Promise.all(
        methods.map(async (method) => {
          try {
            const searchResults = await osrsApi.searchMoneyMakers(method.name);
            const matchingMethod = searchResults.find(m => 
              m.name.toLowerCase() === method.name.toLowerCase()
            );
            
            if (matchingMethod && (matchingMethod.profit || matchingMethod.gpHour) !== method.gpHour) {
              updatedCount++;
              return { ...method, gpHour: matchingMethod.profit || matchingMethod.gpHour };
            }
            return method;
          } catch (error) {
            console.error(`Failed to update ${method.name}:`, error);
            return method;
          }
        })
      );

      setMethods(updatedMethods);
      toast({
        title: "Prices Updated",
        description: `Updated ${updatedCount} out of ${methods.length} methods`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update money per hour rates",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPrices(false);
    }
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

  const getMembershipColor = (membership?: string) => {
    switch (membership) {
      case 'f2p': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'p2p': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const activeMethods = methods.filter(m => m.isActive);
  const inactiveMethods = methods.filter(m => !m.isActive);

  return (
    <div className="space-y-6">
      {/* Add New Method */}
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Plus className="h-5 w-5" />
              Add Money-Making Method
            </CardTitle>
            {methods.length > 0 && (
              <Button
                onClick={updateMoneyPerHour}
                disabled={isUpdatingPrices}
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {isUpdatingPrices ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isUpdatingPrices ? 'Updating...' : 'Update GP/H'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Method Name (Auto-fills from OSRS Wiki Money Makers)</Label>
              <AutocompleteInput
                value={newMethod.name || ''}
                onChange={(value) => setNewMethod({...newMethod, name: value})}
                onSelect={handleMethodSelect}
                placeholder="Start typing method name..."
                searchFunction={searchMoneyMakers}
                className="bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <Label>Assign to Character</Label>
              <Select 
                value={newMethod.character} 
                onValueChange={(value) => setNewMethod({...newMethod, character: value})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select character (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {characters.map((char) => (
                    <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-filled display fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>GP per Hour (From Wiki)</Label>
              <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {newMethod.gpHour ? formatGP(newMethod.gpHour) : 'Select method to auto-fill'}
              </div>
            </div>

            <div>
              <Label>Category (From Wiki)</Label>
              <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {newMethod.category ? newMethod.category : 'Auto-filled from selection'}
              </div>
            </div>

            <div>
              <Label>Membership (From Wiki)</Label>
              <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {newMethod.membership ? newMethod.membership.toUpperCase() : 'Auto-filled from selection'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Requirements (From Wiki)</Label>
              <div className="bg-gray-100 dark:bg-gray-800 border rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
                {newMethod.requirements || 'Auto-filled from selection'}
              </div>
            </div>

            <div>
              <Label>Personal Notes (Optional)</Label>
              <Input
                value={newMethod.notes || ''}
                onChange={(e) => setNewMethod({...newMethod, notes: e.target.value})}
                placeholder="Add your own notes..."
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <Button onClick={addMethod} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </CardContent>
      </Card>

      {/* Active Methods */}
      {activeMethods.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Methods ({activeMethods.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeMethods
              .sort((a, b) => b.gpHour - a.gpHour)
              .map((method) => (
              <MethodCard 
                key={method.id}
                method={method}
                characters={characters}
                onToggleActive={() => toggleMethodActive(method.id)}
                onRemove={() => removeMethod(method.id)}
                onUpdate={updateMethod}
                formatGP={formatGP}
                getCategoryColor={getCategoryColor}
                getIntensityColor={getIntensityColor}
                getMembershipColor={getMembershipColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Methods */}
      {inactiveMethods.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Inactive Methods ({inactiveMethods.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {inactiveMethods
              .sort((a, b) => b.gpHour - a.gpHour)
              .map((method) => (
              <MethodCard 
                key={method.id}
                method={method}
                characters={characters}
                onToggleActive={() => toggleMethodActive(method.id)}
                onRemove={() => removeMethod(method.id)}
                onUpdate={updateMethod}
                formatGP={formatGP}
                getCategoryColor={getCategoryColor}
                getIntensityColor={getIntensityColor}
                getMembershipColor={getMembershipColor}
              />
            ))}
          </div>
        </div>
      )}

      {methods.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Coins className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No money-making methods yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Search for OSRS Wiki money-making methods to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Extract MethodCard component to keep main component smaller
interface MethodCardProps {
  method: MoneyMethod;
  characters: any[];
  onToggleActive: () => void;
  onRemove: () => void;
  onUpdate: (id: string, field: keyof MoneyMethod, value: any) => void;
  formatGP: (amount: number) => string;
  getCategoryColor: (category: string) => string;
  getIntensityColor: (intensity: number) => string;
  getMembershipColor: (membership?: string) => string;
}

function MethodCard({ 
  method, 
  characters, 
  onToggleActive, 
  onRemove, 
  onUpdate, 
  formatGP,
  getCategoryColor,
  getIntensityColor,
  getMembershipColor
}: MethodCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
            {method.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
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
          {method.membership && (
            <Badge className={getMembershipColor(method.membership)}>
              {method.membership.toUpperCase()}
            </Badge>
          )}
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20">
            {formatGP(method.gpHour)}/hr
          </Badge>
          <Badge 
            className={`cursor-pointer ${method.isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={onToggleActive}
          >
            {method.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs text-gray-500">Character Assignment</Label>
          <Select 
            value={method.character} 
            onValueChange={(value) => onUpdate(method.id, 'character', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="None assigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {method.requirements && (
          <div>
            <Label className="text-xs text-gray-500">Requirements</Label>
            <div className="bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-xs max-h-16 overflow-y-auto">
              {method.requirements}
            </div>
          </div>
        )}

        {method.notes && (
          <div>
            <Label className="text-xs text-gray-500">Personal Notes</Label>
            <Input
              value={method.notes}
              onChange={(e) => onUpdate(method.id, 'notes', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
