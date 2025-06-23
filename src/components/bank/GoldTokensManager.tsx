
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";

interface GoldTokensManagerProps {
  selectedCharacter: string;
  getCharacterCoins: (character: string) => number;
  getCharacterPlatTokens: (character: string) => number;
  updateGoldTokens: (character: string, type: 'coins' | 'platinum', quantity: number) => void;
  getCharacterGoldValue: (character: string) => number;
  formatGP: (amount: number) => string;
}

export function GoldTokensManager({
  selectedCharacter,
  getCharacterCoins,
  getCharacterPlatTokens,
  updateGoldTokens,
  getCharacterGoldValue,
  formatGP
}: GoldTokensManagerProps) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
        <Coins className="h-5 w-5" />
        Gold & Platinum Tokens
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Coins</Label>
          <Input
            type="number"
            value={getCharacterCoins(selectedCharacter)}
            onChange={(e) => updateGoldTokens(selectedCharacter, 'coins', Number(e.target.value))}
            placeholder="0"
            className="bg-white dark:bg-slate-800"
          />
          <p className="text-xs text-gray-500 mt-1">Value: 1 GP each</p>
        </div>
        
        <div>
          <Label>Platinum Tokens</Label>
          <Input
            type="number"
            value={getCharacterPlatTokens(selectedCharacter)}
            onChange={(e) => updateGoldTokens(selectedCharacter, 'platinum', Number(e.target.value))}
            placeholder="0"
            className="bg-white dark:bg-slate-800"
          />
          <p className="text-xs text-gray-500 mt-1">Value: 1,000 GP each</p>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded border">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Total Gold Value: {formatGP(getCharacterGoldValue(selectedCharacter))} GP
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
          You can edit these values anytime, even after CSV import
        </p>
      </div>
    </div>
  );
}
