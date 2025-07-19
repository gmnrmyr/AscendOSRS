import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, Upload, RefreshCw, Coins, Edit, Save, X, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<BankItem[]>([]);
  
  const { refreshCharacter, isRefreshing } = useCharacterRefresh();

  const selectedCharacterData = characters.find(c => c.name === selectedCharacter);
  const characterBankItems = selectedCharacter ? (bankData[selectedCharacter] || []) : [];

  // Sort items by value (quantity * price)
  const sortedItems = [...characterBankItems].sort((a, b) => 
    (Math.floor(b.quantity) * b.estimatedPrice) - (Math.floor(a.quantity) * a.estimatedPrice)
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

  const parseCSVData = (csvData: string): BankItem[] => {
    let newItems: BankItem[] = [];
    
    try {
      const jsonData = JSON.parse(csvData);
      if (Array.isArray(jsonData)) {
        // Handle OSRS bank export JSON format - Fix: Ensure category is a valid type
        newItems = jsonData.map(item => ({
          id: Date.now().toString() + Math.random(),
          name: item.name || 'Unknown Item',
          quantity: parseInt(item.quantity) || 0,
          estimatedPrice: 0, // Will be looked up later
          category: 'stackable' as const, // Fix: Explicitly type as valid BankItem category
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
        throw new Error('Data must be valid JSON or CSV with name and quantity columns');
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
              category: 'stackable' as const, // Fix: Explicitly type as valid BankItem category
              character: selectedCharacter
            });
          }
        }
      }
    }
    
    return newItems;
  };

  const handleCSVImport = () => {
    if (!selectedCharacter || !csvData.trim()) return;

    try {
      const newItems = parseCSVData(csvData);
      
      if (newItems.length === 0) {
        alert('No valid items found in the data');
        return;
      }

      // Check if character already has bank items
      if (characterBankItems.length > 0) {
        setPendingImportData(newItems);
        setShowImportDialog(true);
      } else {
        // No existing items, import directly
        performImport(newItems, false);
      }
    } catch (error) {
      console.error('Error parsing data:', error);
      alert('Error parsing data. Please check the format.');
    }
  };

  const performImport = (newItems: BankItem[], replaceExisting: boolean) => {
    const updatedBankData = {
      ...bankData,
      [selectedCharacter]: replaceExisting ? newItems : [...characterBankItems, ...newItems]
    };
    
    setBankData(updatedBankData);
    setCsvData('');
    setShowImportDialog(false);
    setPendingImportData([]);
    
    const action = replaceExisting ? 'replaced' : 'imported';
    alert(`Successfully ${action} ${newItems.length} items!`);
  };

  const handleImportReplace = () => {
    performImport(pendingImportData, true);
  };

  const handleImportAppend = () => {
    performImport(pendingImportData, false);
  };

  const totalBankValue = characterBankItems.reduce((total, item) => 
    total + (Math.floor(item.quantity) * item.estimatedPrice), 0
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
      {/* Bank Management Section - Moved to top */}
      {selectedCharacterData && (
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
      )}

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

      {selectedCharacter && (
        <>
          {/* Toggle for items visibility - Moved to top */}
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

          {/* Bank Items Section - Simplified */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Bank Items</span>
                <span className="text-lg text-green-600 font-bold">
                  {formatGoldValue(displayedItems.reduce((sum, item) => sum + (Math.floor(item.quantity) * item.estimatedPrice), 0))}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Items list */}
              {displayedItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items in bank</p>
              ) : (
                <div className="space-y-2">
                  {displayedItems.map((item) => (
                    <Card key={item.id} className="p-3">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {Math.floor(item.quantity).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Item Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="item-quantity">Quantity</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="item-price">Price (GP)</Label>
                  <Input
                    id="item-price"
                    type="text"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="1m, 1b, etc"
                  />
                </div>
                
                <div>
                  <Label htmlFor="item-category">Category</Label>
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
              
              <Button onClick={handleAddItem} className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
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

          {/* Import Confirmation Dialog */}
          <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Import Bank Items
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="space-y-2">
                    <p>
                      This character already has <strong>{characterBankItems.length}</strong> items in their bank.
                    </p>
                    <p>
                      You're about to import <strong>{pendingImportData.length}</strong> new items.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Choose how you want to handle the import:
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <p><strong>Replace:</strong> Remove all existing items and import new ones</p>
                      <p><strong>Add:</strong> Keep existing items and add new ones</p>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleImportReplace} className="bg-orange-600 hover:bg-orange-700">
                  Replace All Items
                </AlertDialogAction>
                <AlertDialogAction onClick={handleImportAppend} className="bg-green-600 hover:bg-green-700">
                  Add to Existing
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
