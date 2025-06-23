
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, DollarSign } from "lucide-react";

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
  const coins = getCharacterCoins(selectedCharacter);
  const platTokens = getCharacterPlatTokens(selectedCharacter);
  const totalGoldValue = getCharacterGoldValue(selectedCharacter);

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Coins className="h-6 w-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
            Gold & Platinum Tokens
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-yellow-700 dark:text-yellow-300">
              Gold Coins
            </Label>
            <Input
              type="number"
              value={coins}
              onChange={(e) => updateGoldTokens(selectedCharacter, 'coins', Number(e.target.value))}
              placeholder="0"
              className="h-12 text-lg font-medium bg-white dark:bg-slate-800 border-yellow-300 focus:border-yellow-500"
            />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Value: 1 GP each = {formatGP(coins)} GP
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-semibold text-yellow-700 dark:text-yellow-300">
              Platinum Tokens
            </Label>
            <Input
              type="number"
              value={platTokens}
              onChange={(e) => updateGoldTokens(selectedCharacter, 'platinum', Number(e.target.value))}
              placeholder="0"
              className="h-12 text-lg font-medium bg-white dark:bg-slate-800 border-yellow-300 focus:border-yellow-500"
            />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Value: 1,000 GP each = {formatGP(platTokens * 1000)} GP
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-800 dark:text-green-200">
                Total Gold Value
              </span>
            </div>
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatGP(totalGoldValue)} GP
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-300 mt-2">
            Combined value of {formatGP(coins)} coins + {formatGP(platTokens * 1000)} platinum tokens
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
