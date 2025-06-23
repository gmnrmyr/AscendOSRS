
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BankCSVImporter } from "./BankCSVImporter";
import { BankSummary } from "./bank/BankSummary";
import { GoldTokensManager } from "./bank/GoldTokensManager";
import { BankItemForm } from "./bank/BankItemForm";
import { CharacterBankDisplay } from "./bank/CharacterBankDisplay";
import { osrsApi } from "@/services/osrsApi";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

interface BankTrackerProps {
  bankData: Record<string, BankItem[]>;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
  characters: Array<{ id: string; name: string }>;
}

export function BankTracker({ bankData, setBankData, characters }: BankTrackerProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [newItem, setNewItem] = useState<Partial<BankItem>>({
    name: '',
    quantity: 1,
    estimatedPrice: 0,
    category: 'other'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    if (!selectedCharacter) {
      toast({
        title: "Error",
        description: "Please select a character first",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.name?.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    const item: BankItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity || 1,
      estimatedPrice: newItem.estimatedPrice || 0,
      category: newItem.category || 'other',
      character: selectedCharacter
    };

    const currentItems = bankData[selectedCharacter] || [];
    setBankData({
      ...bankData,
      [selectedCharacter]: [...currentItems, item]
    });

    setNewItem({
      name: '',
      quantity: 1,
      estimatedPrice: 0,
      category: 'other'
    });
    
    toast({
      title: "Success",
      description: `${item.name} added to ${selectedCharacter}'s bank`
    });
  };

  const removeItem = (character: string, itemId: string) => {
    const itemToRemove = bankData[character]?.find(item => item.id === itemId);
    setBankData({
      ...bankData,
      [character]: (bankData[character] || []).filter(item => item.id !== itemId)
    });
    
    toast({
      title: "Item Removed",
      description: `${itemToRemove?.name} removed from ${character}'s bank`
    });
  };

  const updateItem = (character: string, itemId: string, field: keyof BankItem, value: any) => {
    setBankData({
      ...bankData,
      [character]: (bankData[character] || []).map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const addQuickItems = () => {
    if (!selectedCharacter) return;
    
    const quickItems = [
      { name: "Coins", quantity: 0, estimatedPrice: 1, category: "stackable" },
      { name: "Platinum Tokens", quantity: 0, estimatedPrice: 1000, category: "stackable" },
      { name: "Prayer Potions(4)", quantity: 0, estimatedPrice: 12000, category: "stackable" },
      { name: "Super Combat Potions(4)", quantity: 0, estimatedPrice: 15000, category: "stackable" },
      { name: "Ranging Potions(4)", quantity: 0, estimatedPrice: 8000, category: "stackable" },
      { name: "Magic Potions(4)", quantity: 0, estimatedPrice: 1200, category: "stackable" }
    ];

    const newItems = quickItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      ...item,
      category: item.category as BankItem['category'],
      character: selectedCharacter
    }));

    const currentItems = bankData[selectedCharacter] || [];
    setBankData({
      ...bankData,
      [selectedCharacter]: [...currentItems, ...newItems]
    });

    toast({
      title: "Quick Items Added",
      description: `Added common stackable items to ${selectedCharacter}'s bank`
    });
  };

  const handleImportBank = (items: BankItem[], character: string) => {
    setBankData({
      ...bankData,
      [character]: [...(bankData[character] || []), ...items]
    });
  };

  const refreshAllPrices = async () => {
    if (Object.keys(bankData).length === 0) {
      toast({
        title: "No Bank Data",
        description: "No items to refresh prices for",
        variant: "destructive"
      });
      return;
    }

    setIsRefreshing(true);
    let totalUpdated = 0;
    let totalItems = 0;

    const updatedBankData = { ...bankData };

    for (const [character, items] of Object.entries(bankData)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        totalItems++;

        // Skip coins and platinum tokens
        if (item.name.toLowerCase().includes('coin') || item.name.toLowerCase().includes('platinum')) {
          continue;
        }

        try {
          // Try to get a price estimate
          const newPrice = await osrsApi.getEstimatedItemValue(item.name);
          if (newPrice && newPrice !== item.estimatedPrice) {
            updatedBankData[character][i] = { ...item, estimatedPrice: newPrice };
            totalUpdated++;
          }
        } catch (error) {
          console.error(`Failed to update price for ${item.name}:`, error);
        }
      }
    }

    setBankData(updatedBankData);
    setIsRefreshing(false);

    toast({
      title: "Prices Refreshed",
      description: `Updated ${totalUpdated} out of ${totalItems} item prices`
    });
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const getCharacterBankValue = (character: string) => {
    const items = bankData[character] || [];
    return items.reduce((total, item) => total + (item.quantity * item.estimatedPrice), 0);
  };

  const getCharacterGoldValue = (character: string) => {
    const items = bankData[character] || [];
    const coins = items.find(item => item.name.toLowerCase().includes('coin'))?.quantity || 0;
    const platTokens = items.find(item => item.name.toLowerCase().includes('platinum'))?.quantity || 0;
    return coins + (platTokens * 1000);
  };

  const getTotalBankValue = () => {
    return Object.keys(bankData).reduce((total, character) => total + getCharacterBankValue(character), 0);
  };

  const getTotalGoldValue = () => {
    return Object.keys(bankData).reduce((total, character) => total + getCharacterGoldValue(character), 0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stackable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'gear': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'materials': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateGoldTokens = (character: string, type: 'coins' | 'platinum', quantity: number) => {
    const currentItems = bankData[character] || [];
    const itemName = type === 'coins' ? 'Coins' : 'Platinum Tokens';
    const itemPrice = type === 'coins' ? 1 : 1000;
    
    const existingItemIndex = currentItems.findIndex(item => 
      item.name.toLowerCase().includes(type === 'coins' ? 'coin' : 'platinum')
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: quantity
      };
      setBankData({
        ...bankData,
        [character]: updatedItems
      });
    } else {
      const newItem: BankItem = {
        id: Date.now().toString(),
        name: itemName,
        quantity: quantity,
        estimatedPrice: itemPrice,
        category: 'stackable',
        character: character
      };
      setBankData({
        ...bankData,
        [character]: [...currentItems, newItem]
      });
    }
  };

  const getCharacterCoins = (character: string) => {
    const items = bankData[character] || [];
    return items.find(item => item.name.toLowerCase().includes('coin'))?.quantity || 0;
  };

  const getCharacterPlatTokens = (character: string) => {
    const items = bankData[character] || [];
    return items.find(item => item.name.toLowerCase().includes('platinum'))?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      <BankCSVImporter 
        onImportBank={handleImportBank}
        characters={characters}
      />

      <BankSummary 
        totalBankValue={getTotalBankValue()}
        totalGoldValue={getTotalGoldValue()}
        charactersCount={characters.length}
        formatGP={formatGP}
      />

      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Plus className="h-5 w-5" />
              Bank Management
            </CardTitle>
            {Object.keys(bankData).length > 0 && (
              <Button
                onClick={refreshAllPrices}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isRefreshing ? 'Refreshing...' : 'Refresh All Prices'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Character</Label>
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue placeholder="Choose a character to manage bank" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCharacter && (
            <>
              <GoldTokensManager 
                selectedCharacter={selectedCharacter}
                getCharacterCoins={getCharacterCoins}
                getCharacterPlatTokens={getCharacterPlatTokens}
                updateGoldTokens={updateGoldTokens}
                getCharacterGoldValue={getCharacterGoldValue}
                formatGP={formatGP}
              />

              <BankItemForm 
                newItem={newItem}
                setNewItem={setNewItem}
                onAddItem={addItem}
                onAddQuickItems={addQuickItems}
              />
            </>
          )}
        </CardContent>
      </Card>

      <CharacterBankDisplay 
        characters={characters}
        bankData={bankData}
        getCharacterBankValue={getCharacterBankValue}
        getCharacterGoldValue={getCharacterGoldValue}
        formatGP={formatGP}
        getCategoryColor={getCategoryColor}
        removeItem={removeItem}
        updateItem={updateItem}
      />
    </div>
  );
}
