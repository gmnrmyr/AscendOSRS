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
import { ensurePrices, priceOfVariant } from '@/services/priceEngine';

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

  const updateItemPrices = async () => {
    setIsUpdatingPrices(true);
    try {
      // Preço GE ao vivo pelo osrsId (OSRS Wiki realtime) — sem tabela hardcoded nem json estático.
      await ensurePrices(true); // /latest fresco (ignora cache de 10min)

      let updatedCount = 0;
      const updatedItems = bankItems.map(item => {
        if (!item.osrsId) return item; // sem id (manual/CSV) -> mantém preço manual
        const unit = priceOfVariant(item.osrsId, item.name).unit; // vivo por id, com variante->base
        if (unit !== item.estimatedPrice) {
          updatedCount++;
          return { ...item, estimatedPrice: unit };
        }
        return item;
      });

      onUpdateBankItems(updatedItems);
      updateCharacterBank(updatedItems);

      toast({
        title: "Preços atualizados!",
        description: `${updatedCount} itens reprecificados com o GE ao vivo.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: "Falha ao atualizar",
        description: "Não deu pra buscar os preços ao vivo. Tente de novo.",
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
      .reduce((total, item) => total + (Math.floor(item.quantity) * item.estimatedPrice), 0);
    
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
    const currentTotalValue = nonGoldItems.reduce((sum, item) => sum + (Math.floor(item.quantity) * item.estimatedPrice), 0);
    
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
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
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
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
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
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
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
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
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
