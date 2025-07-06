import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, DollarSign, Edit, Save, X, RefreshCw } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';
import { formatGoldValue, parseGoldInput } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBankManagerProps {
  character: Character;
  bankItems: BankItem[];
  onUpdateCharacter: (character: Character) => void;
  onUpdateBankItems: (items: BankItem[]) => void;
}

export function EnhancedBankManager({
  character,
  bankItems,
  onUpdateCharacter,
  onUpdateBankItems,
}: EnhancedBankManagerProps) {
  const [editingField, setEditingField] = useState<'none' | 'coins' | 'plat' | 'bankValue'>('none');
  const [editValue, setEditValue] = useState('');
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const { toast } = useToast();

  // Enhanced fallback prices for common items
  const fallbackPrices: Record<string, number> = {
    "amethyst arrow": 150,
    "bandos tassets": 28000000,
    "dragon dagger": 17000,
    "lockpick": 50,
    "ancient rune armour set (lg)": 500000,
    "runite bar": 12000,
    "runite ore": 11000,
    "bandos chestplate": 25000000,
    "armadyl chestplate": 35000000,
    "armadyl chainskirt": 30000000,
    "dragon arrow": 300,
    "rune arrow": 100,
    "adamant arrow": 50,
    "mithril arrow": 25,
    "steel arrow": 15,
    "iron arrow": 10,
    "bronze arrow": 5,
    "abyssal whip": 2500000,
    "dragon scimitar": 100000,
    "dragon longsword": 60000,
    "dragon boots": 220000,
    "dragon gloves": 130000,
    "berserker ring": 2500000,
    "warrior ring": 65000,
    "seers ring": 50000,
    "archers ring": 45000,
    "dragon defender": 0, // Untradeable
    "fire cape": 0, // Untradeable
    "barrows gloves": 0, // Untradeable
    "void knight top": 0, // Untradeable
    "void knight bottom": 0, // Untradeable
    "void knight gloves": 0, // Untradeable
    "void knight helm": 0, // Untradeable
    "granite maul": 35000,
    "dragon warhammer": 45000000,
    "twisted bow": 1200000000,
    "scythe of vitur": 800000000,
    "sang staff": 120000000,
    "avernic defender": 120000000,
    "primordial boots": 32000000,
    "pegasian boots": 35000000,
    "eternal boots": 4500000,
    "dragon hunter lance": 85000000,
    "dragon hunter crossbow": 130000000,
    "toxic blowpipe": 4500000,
    "trident of the seas": 180000,
    "trident of the swamp": 800000,
    "occult necklace": 1200000,
    "anguish": 15000000,
    "tormented bracelet": 12000000,
    "zenyte": 12000000,
    "onyx": 2700000,
    "zenyte shard": 200000,
    "dragon bones": 2800,
    "superior dragon bones": 8500,
    "prayer potion(4)": 10000,
    "super combat potion(4)": 15000,
    "ranging potion(4)": 8000,
    "magic potion(4)": 1200,
    "stamina potion(4)": 12000,
    "saradomin brew(4)": 6000,
    "super restore(4)": 12000,
    "antifire potion(4)": 2000,
    "extended antifire(4)": 8000,
    "shark": 800,
    "manta ray": 1400,
    "karambwan": 1200,
    "anglerfish": 1800,
    "dark crab": 1100,
    "tuna potato": 2500,
    "monkfish": 400,
    "lobster": 180,
    "swordfish": 320,
    "tuna": 120,
    "salmon": 80,
    "trout": 25,
    "coal": 150,
    "iron ore": 100,
    "gold ore": 300,
    "mithril ore": 180,
    "adamantite ore": 1000,
    "tin ore": 50,
    "copper ore": 60,
    "silver ore": 80,
    "clay": 150,
    "limestone": 10,
    "sandstone": 50,
    "granite": 50,
    "pure essence": 4,
    "rune essence": 20,
    "nature rune": 180,
    "law rune": 200,
    "death rune": 220,
    "blood rune": 350,
    "soul rune": 180,
    "cosmic rune": 120,
    "chaos rune": 100,
    "air rune": 5,
    "water rune": 5,
    "earth rune": 5,
    "fire rune": 5,
    "mind rune": 4,
    "body rune": 4,
    "astral rune": 150,
    "wrath rune": 400,
    "logs": 100,
    "oak logs": 50,
    "willow logs": 15,
    "maple logs": 25,
    "yew logs": 300,
    "magic logs": 1000,
    "redwood logs": 400,
    "teak logs": 120,
    "mahogany logs": 400,
    "raw shark": 600,
    "raw manta ray": 1200,
    "raw karambwan": 800,
    "raw anglerfish": 1500,
    "raw dark crab": 900,
    "raw monkfish": 300,
    "raw lobster": 150,
    "raw swordfish": 250,
    "raw tuna": 100,
    "raw salmon": 60,
    "raw trout": 20
  };

  const updateItemPrices = async () => {
    setIsUpdatingPrices(true);
    try {
      let osrsItems: any[] = [];
      let priceMap = new Map<string, number>();

      // Try to load OSRS items database
      try {
        const response = await fetch('/osrs_items.json');
        if (response.ok) {
          osrsItems = await response.json();
          // Create price lookup map
          osrsItems.forEach(item => {
            if (item.current_price > 0) {
              priceMap.set(item.name.toLowerCase(), item.current_price);
            }
          });
        }
      } catch (error) {
        console.log('Could not load OSRS items database, using fallback prices');
      }

      // Update bank items with correct prices
      let updatedCount = 0;
      const updatedItems = bankItems.map(item => {
        // Skip gold items
        if (item.name.toLowerCase().includes('coin') || item.name.toLowerCase().includes('platinum')) {
          return item;
        }

        // Only update items with 0 price
        if (item.estimatedPrice === 0 || item.estimatedPrice === null || item.estimatedPrice === undefined) {
          const itemName = item.name.toLowerCase();
          
          // Try to get price from OSRS database first
          let newPrice = priceMap.get(itemName);
          
          // If not found, try fallback prices
          if (!newPrice) {
            newPrice = fallbackPrices[itemName];
          }

          if (newPrice && newPrice > 0) {
            updatedCount++;
            return {
              ...item,
              estimatedPrice: newPrice
            };
          }
        }

        return item;
      });

      // Update the bank items
      onUpdateBankItems(updatedItems);
      updateCharacterBank(updatedItems);

      // Show success message
      toast({
        title: "Prices Updated!",
        description: `Updated ${updatedCount} items with current market prices.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: "Update Failed",
        description: "Could not update item prices. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const getCoins = () => {
    const coinsItem = bankItems.find(item => item.name.toLowerCase().includes('coin'));
    return coinsItem?.quantity || 0;
  };

  const getPlatTokens = () => {
    const platItem = bankItems.find(item => item.name.toLowerCase().includes('platinum'));
    return platItem?.quantity || 0;
  };

  const getBankValueMinusGold = () => {
    const coins = getCoins();
    const platTokens = getPlatTokens();
    const goldValue = coins + (platTokens * 1000);
    
    // Calculate from actual bank items first
    const bankItemsValue = bankItems
      .filter(item => !item.name.toLowerCase().includes('coin') && !item.name.toLowerCase().includes('platinum'))
      .reduce((total, item) => total + (item.quantity * item.estimatedPrice), 0);
    
    return bankItemsValue;
  };

  const getTotalBankValue = () => {
    return getBankValueMinusGold() + getCoins() + (getPlatTokens() * 1000);
  };

  const startEdit = (field: 'coins' | 'plat' | 'bankValue') => {
    setEditingField(field);
    if (field === 'coins') {
      setEditValue(formatGoldValue(getCoins()));
    } else if (field === 'plat') {
      setEditValue(formatGoldValue(getPlatTokens()));
    } else if (field === 'bankValue') {
      setEditValue(formatGoldValue(getBankValueMinusGold()));
    }
  };

  const saveEdit = () => {
    const value = parseGoldInput(editValue);
    console.log('Saving edit:', editingField, 'value:', value, 'parsed from:', editValue);
    
    if (editingField === 'coins') {
      updateCoins(value);
    } else if (editingField === 'plat') {
      updatePlatTokens(value);
    } else if (editingField === 'bankValue') {
      updateBankValue(value);
    }
    
    setEditingField('none');
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField('none');
    setEditValue('');
  };

  const updateCoins = (quantity: number) => {
    const updatedItems = [...bankItems];
    const coinsIndex = updatedItems.findIndex(item => item.name.toLowerCase().includes('coin'));
    
    if (coinsIndex >= 0) {
      updatedItems[coinsIndex] = { ...updatedItems[coinsIndex], quantity };
    } else {
      updatedItems.push({
        id: Date.now().toString(),
        name: 'Coins',
        quantity,
        estimatedPrice: 1,
        category: 'stackable',
        character: character.name
      });
    }
    
    onUpdateBankItems(updatedItems);
    updateCharacterBank(updatedItems);
  };

  const updatePlatTokens = (quantity: number) => {
    const updatedItems = [...bankItems];
    const platIndex = updatedItems.findIndex(item => item.name.toLowerCase().includes('platinum'));
    
    if (platIndex >= 0) {
      updatedItems[platIndex] = { ...updatedItems[platIndex], quantity };
    } else {
      updatedItems.push({
        id: Date.now().toString(),
        name: 'Platinum Tokens',
        quantity,
        estimatedPrice: 1000,
        category: 'stackable',
        character: character.name
      });
    }
    
    onUpdateBankItems(updatedItems);
    updateCharacterBank(updatedItems);
  };

  const updateBankValue = (newBankValue: number) => {
    // Get non-gold items
    const nonGoldItems = bankItems.filter(
      item => !item.name.toLowerCase().includes('coin') && !item.name.toLowerCase().includes('platinum')
    );

    if (nonGoldItems.length === 0) {
      // If no items exist, create a placeholder item to represent the bank value
      const placeholderItem: BankItem = {
        id: Date.now().toString(),
        name: 'Bank Value (Items)',
        quantity: 1,
        estimatedPrice: newBankValue,
        category: 'other',
        character: character.name
      };
      
      const updatedItems = [...bankItems, placeholderItem];
      onUpdateBankItems(updatedItems);
      updateCharacterBank(updatedItems);
      return;
    }

    // Calculate current total value of non-gold items
    const currentTotalValue = nonGoldItems.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
    
    // If current total is 0, distribute the new value equally among items
    if (currentTotalValue === 0) {
      const valuePerItem = Math.round(newBankValue / nonGoldItems.length);
      const updatedItems = bankItems.map(item => {
        if (item.name.toLowerCase().includes('coin') || item.name.toLowerCase().includes('platinum')) {
          return item;
        }
        return {
          ...item,
          estimatedPrice: valuePerItem
        };
      });
      
      onUpdateBankItems(updatedItems);
      updateCharacterBank(updatedItems);
      return;
    }
    
    // Calculate the ratio to adjust all items
    const ratio = newBankValue / currentTotalValue;
    
    // Update all non-gold items with the new ratio
    const updatedItems = bankItems.map(item => {
      if (item.name.toLowerCase().includes('coin') || item.name.toLowerCase().includes('platinum')) {
        return item;
      }
      return {
        ...item,
        estimatedPrice: Math.round(item.estimatedPrice * ratio)
      };
    });

    onUpdateBankItems(updatedItems);
    updateCharacterBank(updatedItems);
  };

  const updateCharacterBank = (items: BankItem[]) => {
    const totalBank = getTotalBankValue();
    onUpdateCharacter({ ...character, bank: totalBank });
  };

  // Count items with 0 price
  const itemsWithZeroPrice = bankItems.filter(item => 
    !item.name.toLowerCase().includes('coin') && 
    !item.name.toLowerCase().includes('platinum') && 
    (item.estimatedPrice === 0 || item.estimatedPrice === null || item.estimatedPrice === undefined)
  ).length;

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-600" />
          Bank Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Update Prices Button */}
        {itemsWithZeroPrice > 0 && (
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex-1">
              <Label className="text-base font-semibold text-orange-800 dark:text-orange-200">
                {itemsWithZeroPrice} items need price updates
              </Label>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                Click to automatically update items showing 0 GP
              </p>
            </div>
            <Button 
              onClick={updateItemPrices}
              disabled={isUpdatingPrices}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isUpdatingPrices ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Prices
                </>
              )}
            </Button>
          </div>
        )}

        {/* Coins Row */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border">
          <div className="flex-1">
            <Label className="text-base font-semibold">Gold Coins</Label>
            <p className="text-sm text-muted-foreground">1 GP each</p>
          </div>
          <div className="flex items-center gap-2">
            {editingField === 'coins' ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32"
                  placeholder="1m, 1b, etc"
                />
                <Button onClick={saveEdit} size="sm" variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
                <Button onClick={cancelEdit} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{formatGoldValue(getCoins())}</span>
                <Button onClick={() => startEdit('coins')} size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Platinum Tokens Row */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border">
          <div className="flex-1">
            <Label className="text-base font-semibold">Platinum Tokens</Label>
            <p className="text-sm text-muted-foreground">1,000 GP each</p>
          </div>
          <div className="flex items-center gap-2">
            {editingField === 'plat' ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32"
                  placeholder="1k, 1m, etc"
                />
                <Button onClick={saveEdit} size="sm" variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
                <Button onClick={cancelEdit} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{formatGoldValue(getPlatTokens())}</span>
                <Button onClick={() => startEdit('plat')} size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bank Value Row */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border">
          <div className="flex-1">
            <Label className="text-base font-semibold">Bank Value (Items)</Label>
            <p className="text-sm text-muted-foreground">Total value of all items excluding gold</p>
          </div>
          <div className="flex items-center gap-2">
            {editingField === 'bankValue' ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32"
                  placeholder="1m, 1b, etc"
                />
                <Button onClick={saveEdit} size="sm" variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
                <Button onClick={cancelEdit} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{formatGoldValue(getBankValueMinusGold())}</span>
                <Button onClick={() => startEdit('bankValue')} size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Total Bank Value */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border">
          <div className="flex-1">
            <Label className="text-base font-semibold">Total Bank Value</Label>
            <p className="text-sm text-muted-foreground">Including gold and items</p>
          </div>
          <span className="font-mono text-lg text-green-600">{formatGoldValue(getTotalBankValue())}</span>
        </div>
      </CardContent>
    </Card>
  );
}
