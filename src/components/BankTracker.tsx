import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw } from "lucide-react";
import { BankCSVImporter } from "./BankCSVImporter";
import { BankSummary } from "./bank/BankSummary";
import { GoldTokensManager } from "./bank/GoldTokensManager";
import { BankItemForm } from "./bank/BankItemForm";
import { CharacterBankDisplay } from "./bank/CharacterBankDisplay";
import { useBankTracker, useBankCalculations } from "./bank/BankTrackerLogic";

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
  const {
    selectedCharacter,
    setSelectedCharacter,
    newItem,
    setNewItem,
    isRefreshing,
    addItem,
    removeItem,
    updateItem,
    addQuickItems,
    refreshAllPrices,
    updateGoldTokens
  } = useBankTracker({ bankData, setBankData });

  const {
    formatGP,
    getCharacterBankValue,
    getCharacterGoldValue,
    getTotalBankValue,
    getTotalGoldValue,
    getCharacterCoins,
    getCharacterPlatTokens,
    getCategoryColor
  } = useBankCalculations(bankData);

  const handleImportBank = (items: BankItem[], character: string, isUpdate?: boolean) => {
    if (isUpdate) {
      setBankData({
        ...bankData,
        [character]: items
      });
    } else {
      setBankData({
        ...bankData,
        [character]: [...(bankData[character] || []), ...items]
      });
    }
  };

  return (
    <div className="space-y-6">
      <BankCSVImporter 
        onImportBank={handleImportBank}
        characters={characters}
        bankData={bankData}
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
