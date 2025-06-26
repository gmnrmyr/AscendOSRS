
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Upload, RefreshCw, Coins } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';
import { BankCSVImporter } from '@/components/BankCSVImporter';
import { ItemSearch } from '@/components/ItemSearch';
import { useCharacterRefresh } from '@/hooks/useCharacterRefresh';

interface IntegratedBankManagerProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
  setCharacters: (characters: Character[]) => void;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
}

export function IntegratedBankManager({
  characters,
  bankData,
  setCharacters,
  setBankData
}: IntegratedBankManagerProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [editingGold, setEditingGold] = useState(false);
  const [goldAmount, setGoldAmount] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'stackable' | 'gear' | 'materials' | 'other'>('stackable');
  
  const { refreshCharacter, isRefreshing } = useCharacterRefresh();

  const selectedCharacterData = characters.find(c => c.name === selectedCharacter);
  const characterBankItems = selectedCharacter ? (bankData[selectedCharacter] || []) : [];

  const handleCharacterRefresh = async () => {
    if (!selectedCharacterData) return;
    
    const refreshedCharacter = await refreshCharacter(selectedCharacterData);
    if (refreshedCharacter) {
      setCharacters(characters.map(c => 
        c.name === selectedCharacter ? refreshedCharacter : c
      ));
    }
  };

  const handleGoldUpdate = () => {
    if (!selectedCharacterData) return;
    
    const newGoldValue = parseInt(goldAmount) || 0;
    setCharacters(characters.map(c => 
      c.name === selectedCharacter ? { ...c, bank: newGoldValue } : c
    ));
    setEditingGold(false);
  };

  const handleAddItem = () => {
    if (!selectedCharacter || !newItemName || !newItemQuantity) return;

    const newItem: BankItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: parseInt(newItemQuantity) || 0,
      estimatedPrice: parseInt(newItemPrice) || 0,
      category: newItemCategory,
      character: selectedCharacter
    };

    const updatedBankData = {
      ...bankData,
      [selectedCharacter]: [...characterBankItems, newItem]
    };
    
    setBankData(updatedBankData);
    
    // Reset form
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemPrice('');
    setNewItemCategory('stackable');
  };

  const handleRemoveItem = (itemId: string) => {
    if (!selectedCharacter) return;
    
    const updatedItems = characterBankItems.filter(item => item.id !== itemId);
    const updatedBankData = {
      ...bankData,
      [selectedCharacter]: updatedItems
    };
    
    setBankData(updatedBankData);
  };

  const handleCSVImport = (bankItems: Array<{name: string; quantity: number; value: number}>) => {
    if (!selectedCharacter) return;

    const newItems: BankItem[] = bankItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item.name,
      quantity: item.quantity,
      estimatedPrice: item.value,
      category: 'stackable' as const,
      character: selectedCharacter
    }));

    const updatedBankData = {
      ...bankData,
      [selectedCharacter]: [...characterBankItems, ...newItems]
    };
    
    setBankData(updatedBankData);
  };

  const totalBankValue = characterBankItems.reduce((total, item) => 
    total + (item.quantity * item.estimatedPrice), 0
  );

  if (!characters.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No characters available. Please add a character first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Bank Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character Selection */}
        <div className="space-y-2">
          <Label>Select Character</Label>
          <div className="flex gap-2">
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a character..." />
              </SelectTrigger>
              <SelectContent>
                {characters.map(character => (
                  <SelectItem key={character.id} value={character.name}>
                    {character.name} (CB: {character.combatLevel}, Total: {character.totalLevel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCharacterData && (
              <Button 
                onClick={handleCharacterRefresh} 
                disabled={isRefreshing}
                variant="outline"
                size="icon"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {selectedCharacterData && (
          <>
            {/* Character Info & Gold Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Character Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <Badge variant="secondary">{selectedCharacterData.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Combat Level:</span>
                    <span>{selectedCharacterData.combatLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Level:</span>
                    <span>{selectedCharacterData.totalLevel}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Gold Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {editingGold ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={goldAmount}
                        onChange={(e) => setGoldAmount(e.target.value)}
                        placeholder="Enter gold amount"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleGoldUpdate} size="sm">Save</Button>
                        <Button 
                          onClick={() => setEditingGold(false)} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Current Gold:</span>
                        <span className="font-mono">{selectedCharacterData.bank.toLocaleString()} gp</span>
                      </div>
                      <Button 
                        onClick={() => {
                          setGoldAmount(selectedCharacterData.bank.toString());
                          setEditingGold(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Edit Gold
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bank Management Tabs */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="items">Bank Items</TabsTrigger>
                <TabsTrigger value="add">Add Items</TabsTrigger>
                <TabsTrigger value="import">Import</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Bank Items</h3>
                  <Badge variant="outline">
                    Total Value: {totalBankValue.toLocaleString()} gp
                  </Badge>
                </div>
                
                {characterBankItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No items in bank. Add items using the "Add Items" or "Import" tabs.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {characterBankItems.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity.toLocaleString()} × {item.estimatedPrice.toLocaleString()} gp
                            = {(item.quantity * item.estimatedPrice).toLocaleString()} gp
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRemoveItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                <h3 className="text-lg font-semibold">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <ItemSearch
                      value={newItemName}
                      onChange={setNewItemName}
                      placeholder="Search for an item..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Price (per item)</Label>
                    <Input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newItemCategory} onValueChange={(value: any) => setNewItemCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stackable">Stackable</SelectItem>
                        <SelectItem value="gear">Gear</SelectItem>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleAddItem}
                  disabled={!newItemName || !newItemQuantity}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </TabsContent>

              <TabsContent value="import" className="space-y-4">
                <h3 className="text-lg font-semibold">Import Bank Data</h3>
                <BankCSVImporter
                  onImport={handleCSVImport}
                  characters={characters}
                  selectedCharacter={selectedCharacter}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
