
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Upload, RefreshCw, Coins, Edit, Save, X } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';
import { useCharacterRefresh } from '@/hooks/useCharacterRefresh';
import { EnhancedBankManager } from './EnhancedBankManager';

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
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'stackable' | 'gear' | 'materials' | 'other'>('stackable');
  const [csvData, setCsvData] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  
  const { refreshCharacter, isRefreshing } = useCharacterRefresh();

  const selectedCharacterData = characters.find(c => c.name === selectedCharacter);
  const characterBankItems = selectedCharacter ? (bankData[selectedCharacter] || []) : [];

  const formatGP = (amount: number) => {
    const safeAmount = Number(amount) || 0;
    
    if (safeAmount >= 1000000000) {
      return `${(safeAmount / 1000000000).toFixed(1)}B`;
    } else if (safeAmount >= 1000000) {
      return `${(safeAmount / 1000000).toFixed(1)}M`;
    } else if (safeAmount >= 1000) {
      return `${(safeAmount / 1000).toFixed(0)}K`;
    }
    return safeAmount.toLocaleString();
  };

  const handleCharacterRefresh = async () => {
    if (!selectedCharacterData) return;
    
    const refreshedCharacter = await refreshCharacter(selectedCharacterData);
    if (refreshedCharacter) {
      setCharacters(characters.map(c => 
        c.name === selectedCharacter ? refreshedCharacter : c
      ));
    }
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

  const startEditPrice = (item: BankItem) => {
    setEditingItemId(item.id);
    setEditingPrice(item.estimatedPrice.toString());
  };

  const saveEditPrice = () => {
    if (!selectedCharacter || !editingItemId) return;
    
    const newPrice = parseInt(editingPrice) || 0;
    const updatedItems = characterBankItems.map(item => 
      item.id === editingItemId 
        ? { ...item, estimatedPrice: newPrice }
        : item
    );
    
    const updatedBankData = {
      ...bankData,
      [selectedCharacter]: updatedItems
    };
    
    setBankData(updatedBankData);
    setEditingItemId(null);
    setEditingPrice('');
  };

  const cancelEditPrice = () => {
    setEditingItemId(null);
    setEditingPrice('');
  };

  const handleCSVImport = () => {
    if (!selectedCharacter || !csvData.trim()) return;

    try {
      // First try to parse as JSON (OSRS bank export format)
      let newItems: BankItem[] = [];
      
      try {
        const jsonData = JSON.parse(csvData);
        if (Array.isArray(jsonData)) {
          // Handle OSRS bank export JSON format
          newItems = jsonData.map(item => ({
            id: Date.now().toString() + Math.random(),
            name: item.name || 'Unknown Item',
            quantity: parseInt(item.quantity) || 0,
            estimatedPrice: 0, // Will be looked up later
            category: 'stackable',
            character: selectedCharacter
          })).filter(item => item.name && item.quantity > 0);
        }
      } catch (jsonError) {
        // If JSON parsing fails, try CSV parsing
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const nameIndex = headers.indexOf('name') || headers.indexOf('item');
        const quantityIndex = headers.indexOf('quantity') || headers.indexOf('qty');
        const valueIndex = headers.indexOf('value') || headers.indexOf('price');

        if (nameIndex === -1 || quantityIndex === -1) {
          alert('Data must be valid JSON or CSV with name and quantity columns');
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 2) {
            const name = values[nameIndex] || '';
            const quantity = parseInt(values[quantityIndex]) || 0;
            const price = valueIndex !== -1 ? parseInt(values[valueIndex]) || 0 : 0;
            
            if (name && quantity > 0) {
              newItems.push({
                id: Date.now().toString() + Math.random(),
                name,
                quantity,
                estimatedPrice: price,
                category: 'stackable',
                character: selectedCharacter
              });
            }
          }
        }
      }

      if (newItems.length > 0) {
        const updatedBankData = {
          ...bankData,
          [selectedCharacter]: [...characterBankItems, ...newItems]
        };
        setBankData(updatedBankData);
        setCsvData('');
        alert(`Successfully imported ${newItems.length} items!`);
      } else {
        alert('No valid items found in the data');
      }
    } catch (error) {
      console.error('Error parsing data:', error);
      alert('Error parsing data. Please check the format.');
    }
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
    <div className="space-y-6">
      {/* Character Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Bank Management
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {selectedCharacterData && (
        <>
          {/* Enhanced Bank Manager with editable gold/plat/bank value */}
          <EnhancedBankManager
            character={selectedCharacterData}
            bankItems={characterBankItems}
            onUpdateCharacter={(updatedCharacter) => {
              setCharacters(characters.map(c => 
                c.name === selectedCharacter ? updatedCharacter : c
              ));
            }}
            onUpdateBankItems={(updatedItems) => {
              setBankData({
                ...bankData,
                [selectedCharacter]: updatedItems
              });
            }}
            formatGP={formatGP}
          />

          {/* Bank Management Tabs */}
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="items">Bank Items</TabsTrigger>
              <TabsTrigger value="add">Add Items</TabsTrigger>
              <TabsTrigger value="import">Import Data</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bank Items</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Total Value: {totalBankValue.toLocaleString()} gp
                  </Badge>
                  {characterBankItems.length > 0 && (
                    <Button
                      onClick={() => {
                        const newPrice = prompt('Enter default price for all items (0 to skip):');
                        if (newPrice !== null) {
                          const price = parseInt(newPrice) || 0;
                          if (price > 0) {
                            const updatedItems = characterBankItems.map(item => ({
                              ...item,
                              estimatedPrice: price
                            }));
                            const updatedBankData = {
                              ...bankData,
                              [selectedCharacter]: updatedItems
                            };
                            setBankData(updatedBankData);
                          }
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Set All Prices
                    </Button>
                  )}
                </div>
              </div>
              
              {characterBankItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No items in bank. Add items using the "Add Items" or "Import CSV" tabs.
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
                          Qty: {item.quantity.toLocaleString()} × 
                          {editingItemId === item.id ? (
                            <div className="inline-flex items-center gap-2 ml-1">
                              <Input
                                type="number"
                                value={editingPrice}
                                onChange={(e) => setEditingPrice(e.target.value)}
                                className="w-20 h-6 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditPrice();
                                  if (e.key === 'Escape') cancelEditPrice();
                                }}
                              />
                              <Button onClick={saveEditPrice} size="sm" variant="outline" className="h-6 px-2">
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button onClick={cancelEditPrice} size="sm" variant="outline" className="h-6 px-2">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span 
                              className="cursor-pointer hover:text-blue-600 ml-1"
                              onClick={() => startEditPrice(item)}
                            >
                              {item.estimatedPrice.toLocaleString()} gp
                            </span>
                          )}
                          = {(item.quantity * item.estimatedPrice).toLocaleString()} gp
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {editingItemId !== item.id && (
                          <Button
                            onClick={() => startEditPrice(item)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemoveItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name..."
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
              <div className="space-y-4">
                <div>
                  <Label>Bank Data (JSON or CSV)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Paste JSON bank export or CSV data with columns: name, quantity, value (optional)
                  </p>
                  <Textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="Paste your bank export JSON or CSV data here...&#10;&#10;JSON format: [{'id': 995, 'quantity': 1000000, 'name': 'Coins'}]&#10;CSV format: name,quantity,value&#10;Coins,1000000,1"
                    rows={8}
                  />
                </div>
                <Button 
                  onClick={handleCSVImport}
                  disabled={!csvData.trim()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Bank Data
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
