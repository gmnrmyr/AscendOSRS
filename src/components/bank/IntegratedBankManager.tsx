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
import { Trash2, Plus, Upload, RefreshCw, Coins, Edit, Save, X, ChevronDown, ChevronRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';
import { useCharacterRefresh } from '@/hooks/useCharacterRefresh';
import { EnhancedBankManager } from './EnhancedBankManager';
import { formatGoldValue } from '@/lib/utils';
import { valueExport, ensurePrices, priceOf, type ExportItem } from '@/services/priceEngine';

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

  const [isImporting, setIsImporting] = useState(false);
  const [isPricing, setIsPricing] = useState(false);

  const cleanName = (name: string) => (name || 'Unknown Item').replace(/\s*\(Members\)\s*$/i, '').trim();

  // Reprecifica o banco do char selecionado com o preço GE ao vivo, usando o osrsId salvo no import.
  // Itens sem osrsId (adicionados à mão / CSV sem id) mantêm o preço manual.
  const handleRefreshPrices = async () => {
    if (!selectedCharacter || characterBankItems.length === 0) return;
    setIsPricing(true);
    try {
      await ensurePrices(true); // force = busca /latest fresco (ignora cache de 10min)
      let repriced = 0;
      const updatedItems = characterBankItems.map((item) => {
        if (!item.osrsId) return item;
        const unit = priceOf(item.osrsId);
        if (unit > 0 && unit !== item.estimatedPrice) repriced++;
        return unit > 0 ? { ...item, estimatedPrice: unit } : item;
      });
      setBankData({ ...bankData, [selectedCharacter]: updatedItems });
      const withId = characterBankItems.filter((i) => i.osrsId).length;
      const manual = characterBankItems.length - withId;
      alert(
        `Preços atualizados (GE ao vivo): ${repriced} itens mudaram de preço.` +
        (manual > 0 ? `\n${manual} itens sem id (manuais) foram mantidos.` : '')
      );
    } catch (error) {
      console.error('Falha ao reprecificar:', error);
      alert('Falha ao buscar preços ao vivo. Veja o console.');
    } finally {
      setIsPricing(false);
    }
  };

  // Lê o JSON do RuneLite Data Exporter ([{id,quantity,name}]) e valoriza por id com preço GE ao vivo.
  const parseAndValue = async (raw: string): Promise<BankItem[]> => {
    // Formato preferido: JSON do Data Exporter (traz id real -> preço automático)
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch { /* tenta CSV abaixo */ }

    if (Array.isArray(parsed)) {
      const exportItems: ExportItem[] = parsed
        .map((it) => ({ id: Number(it.id), quantity: parseInt(it.quantity) || 0, name: it.name || '' }))
        .filter((it) => it.quantity > 0 && Number.isFinite(it.id));

      const { valued } = await valueExport(exportItems);
      return valued.map((v) => ({
        id: Date.now().toString() + Math.random(),
        osrsId: v.id,
        name: cleanName(v.name),
        quantity: v.quantity,
        estimatedPrice: v.unit,
        category: 'stackable' as const,
        character: selectedCharacter,
      }));
    }

    // Fallback CSV manual (name,quantity,value) — preço da coluna value (ou 0)
    const lines = raw.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (...names: string[]) => names.map((n) => headers.indexOf(n)).find((i) => i !== -1) ?? -1;
    const nameIndex = idx('name', 'item');
    const quantityIndex = idx('quantity', 'qty');
    const valueIndex = idx('value', 'price');
    if (nameIndex === -1 || quantityIndex === -1) {
      throw new Error('Data must be valid JSON or CSV with name and quantity columns');
    }
    const items: BankItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const name = values[nameIndex] || '';
      const quantity = parseInt(values[quantityIndex]) || 0;
      const price = valueIndex !== -1 ? parseInt(values[valueIndex]) || 0 : 0;
      if (name && quantity > 0) {
        items.push({
          id: Date.now().toString() + Math.random(),
          name: cleanName(name),
          quantity,
          estimatedPrice: price,
          category: 'stackable',
          character: selectedCharacter,
        });
      }
    }
    return items;
  };

  const handleCSVImport = async () => {
    if (!selectedCharacter || !csvData.trim()) return;

    setIsImporting(true);
    try {
      const newItems = await parseAndValue(csvData);

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
    } finally {
      setIsImporting(false);
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
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleRefreshPrices}
                    size="sm"
                    variant="outline"
                    disabled={isPricing || characterBankItems.length === 0}
                    title="Reprecifica os itens importados com o preço GE ao vivo (OSRS Wiki)"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isPricing ? 'animate-spin' : ''}`} />
                    {isPricing ? 'Atualizando…' : 'Atualizar preços'}
                  </Button>
                  <span className="text-lg text-green-600 font-bold">
                    {formatGoldValue(displayedItems.reduce((sum, item) => sum + (Math.floor(item.quantity) * item.estimatedPrice), 0))}
                  </span>
                </div>
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
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.osrsId && (
                                <a
                                  href={`https://prices.runescape.wiki/osrs/item/${item.osrsId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Ver preço/gráfico na OSRS Wiki (mesma fonte do app)"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
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
                  placeholder="Cole aqui o JSON do RuneLite Data Exporter ([{id,quantity,name}]) — o preço é calculado automático por id"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={10}
                />
                <Button onClick={handleCSVImport} className="w-full" disabled={isImporting}>
                  <Upload className={`h-4 w-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                  {isImporting ? 'Buscando preços ao vivo...' : 'Import Items'}
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
