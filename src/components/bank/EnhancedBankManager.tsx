
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, DollarSign, Edit, Save, X } from 'lucide-react';
import { Character, BankItem } from '@/hooks/useAppData';

interface EnhancedBankManagerProps {
  character: Character;
  bankItems: BankItem[];
  onUpdateCharacter: (character: Character) => void;
  onUpdateBankItems: (items: BankItem[]) => void;
  formatGP: (amount: number) => string;
}

export function EnhancedBankManager({
  character,
  bankItems,
  onUpdateCharacter,
  onUpdateBankItems,
  formatGP
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
    return Math.max(0, character.bank - goldValue);
  };

  const getTotalBankValue = () => {
    return getCoins() + (getPlatTokens() * 1000) + getBankValueMinusGold();
  };

  const startEdit = (field: 'coins' | 'plat' | 'bankValue') => {
    setEditingField(field);
    if (field === 'coins') {
      setEditValue(getCoins().toString());
    } else if (field === 'plat') {
      setEditValue(getPlatTokens().toString());
    } else if (field === 'bankValue') {
      setEditValue(getBankValueMinusGold().toString());
    }
  };

  const saveEdit = () => {
    const value = parseInt(editValue) || 0;
    
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
    const coins = getCoins();
    const platTokens = getPlatTokens();
    const goldValue = coins + (platTokens * 1000);
    const totalBank = newBankValue + goldValue;
    
    onUpdateCharacter({ ...character, bank: totalBank });
  };

  const updateCharacterBank = (items: BankItem[]) => {
    const coins = items.find(item => item.name.toLowerCase().includes('coin'))?.quantity || 0;
    const platTokens = items.find(item => item.name.toLowerCase().includes('platinum'))?.quantity || 0;
    const goldValue = coins + (platTokens * 1000);
    const bankValue = getBankValueMinusGold();
    const totalBank = goldValue + bankValue;
    
    onUpdateCharacter({ ...character, bank: totalBank });
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-600" />
          {character.name} - Bank Management
          <Badge variant="secondary">{character.type}</Badge>
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
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32"
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
                <span className="font-mono text-lg">{formatGP(getCoins())}</span>
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
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32"
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
                <span className="font-mono text-lg">{formatGP(getPlatTokens())}</span>
                <Button onClick={() => startEdit('plat')} size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bank Value (minus gold) Row */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border">
          <div className="flex-1">
            <Label className="text-base font-semibold">Bank Value (Items)</Label>
            <p className="text-sm text-muted-foreground">Excluding coins & tokens</p>
          </div>
          <div className="flex items-center gap-2">
            {editingField === 'bankValue' ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32"
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
                <span className="font-mono text-lg">{formatGP(getBankValueMinusGold())}</span>
                <Button onClick={() => startEdit('bankValue')} size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Total Bank Value */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-800 dark:text-green-200">
                Total Bank Value
              </span>
            </div>
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatGP(getTotalBankValue())} GP
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-300 mt-2">
            {formatGP(getCoins())} coins + {formatGP(getPlatTokens() * 1000)} tokens + {formatGP(getBankValueMinusGold())} items
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
