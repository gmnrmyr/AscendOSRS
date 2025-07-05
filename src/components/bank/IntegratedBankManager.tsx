import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Upload, RefreshCw, Coins, Edit, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';
import { useCharacterRefresh } from '@/hooks/useCharacterRefresh';
import { EnhancedBankManager } from './EnhancedBankManager';
import { formatGoldValue } from '@/lib/utils';

const VALUABLE_ITEMS_THRESHOLD = 10; // Show top 10 most valuable items when collapsed

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { refreshCharacter, isRefreshing } = useCharacterRefresh();

  const selectedCharacterData = characters.find(c => c.name === selectedCharacter);
  const characterBankItems = selectedCharacter ? (bankData[selectedCharacter] || []) : [];

  // Sort items by value (quantity * price)
  const sortedItems = [...characterBankItems].sort((a, b) => 
    (b.quantity * b.estimatedPrice) - (a.quantity * a.estimatedPrice)
  );

  // Get items to display based on expanded state
  const displayedItems = isExpanded ? sortedItems : sortedItems.slice(0, VALUABLE_ITEMS_THRESHOLD);
  const hiddenItemsCount = sortedItems.length - displayedItems.length;

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
    <div className="space-y-4">
      {/* Character selection */}
      <div className="flex gap-4 items-center">
        <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select character" />
          </SelectTrigger>
          <SelectContent>
            {characters.map(char => (
              <SelectItem key={char.name} value={char.name}>
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCharacterData && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCharacterRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {selectedCharacterData && (
        <>
          {/* Bank Management Section */}
          <EnhancedBankManager
            character={selectedCharacterData}
            bankItems={characterBankItems}
            onUpdateCharacter={(char) => {
              setCharacters(characters.map(c => 
                c.name === char.name ? char : c
              ));
            }}
            onUpdateBankItems={(items) => {
              setBankData({
                ...bankData,
                [selectedCharacter]: items
              });
            }}
          />

          {/* Bank Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Bank Items</span>
                <span className="text-lg text-green-600 font-bold">
                  {formatGoldValue(displayedItems.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0))}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Toggle for items visibility */}
              {sortedItems.length > VALUABLE_ITEMS_THRESHOLD && (
                <Button
                  variant="outline"
                  className="w-full mb-4"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Show {hiddenItemsCount} More Items
                    </>
                  )}
                </Button>
              )}

              {/* Items list */}
              {displayedItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items in bank</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {displayedItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(e.target.value)}
                                  className="w-32"
                                  placeholder="1m, 1b, etc"
                                />
                                <Button onClick={saveEditPrice} size="sm" variant="outline">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button onClick={cancelEditPrice} size="sm" variant="outline">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="font-mono">
                                  {formatGoldValue(item.estimatedPrice)} GP
                                </span>
                                <Button
                                  onClick={() => startEditPrice(item)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => handleRemoveItem(item.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add item form */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold mb-4">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Quantity"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Price (1m, 1b, etc)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                  />
                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle>Import Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste CSV or JSON data here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={10}
                />
                <Button onClick={handleCSVImport} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Items
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
