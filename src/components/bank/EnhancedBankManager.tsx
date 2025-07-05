import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, DollarSign, Edit, Save, X } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';
import { parseGoldInput, formatGoldValue } from '@/lib/utils';

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

    if (nonGoldItems.length === 0) return;

    // Calculate current total value of non-gold items
    const currentTotalValue = nonGoldItems.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
    
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

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-600" />
          Bank Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
