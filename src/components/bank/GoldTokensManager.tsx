
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Coins, DollarSign, RefreshCw, Zap } from "lucide-react";

interface GoldTokensManagerProps {
  selectedCharacter: string;
  getCharacterCoins: (character: string) => number;
  getCharacterPlatTokens: (character: string) => number;
  updateGoldTokens: (character: string, type: 'coins' | 'platinum', quantity: number) => void;
  getCharacterGoldValue: (character: string) => number;
  formatGP: (amount: number) => string;
  refreshGoldValue?: (character: string) => Promise<void>;
  autoInputGoldValue?: (character: string, totalValue: number) => void;
  isRefreshing?: boolean;
  isAutoInputEnabled?: boolean;
  setIsAutoInputEnabled?: (enabled: boolean) => void;
}

export function GoldTokensManager({
  selectedCharacter,
  getCharacterCoins,
  getCharacterPlatTokens,
  updateGoldTokens,
  getCharacterGoldValue,
  formatGP,
  refreshGoldValue,
  autoInputGoldValue,
  isRefreshing = false,
  isAutoInputEnabled = false,
  setIsAutoInputEnabled
}: GoldTokensManagerProps) {
  const [autoInputValue, setAutoInputValue] = useState<string>('');
  
  const coins = getCharacterCoins(selectedCharacter);
  const platTokens = getCharacterPlatTokens(selectedCharacter);
  const totalGoldValue = getCharacterGoldValue(selectedCharacter);

  const handleRefresh = () => {
    if (refreshGoldValue) {
      refreshGoldValue(selectedCharacter);
    }
  };

  const handleAutoInput = () => {
    const value = parseInt(autoInputValue.replace(/,/g, ''));
    if (!isNaN(value) && value > 0 && autoInputGoldValue) {
      autoInputGoldValue(selectedCharacter, value);
      setAutoInputValue('');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Coins className="h-6 w-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
              Gold & Platinum Tokens
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            
            {setIsAutoInputEnabled && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={isAutoInputEnabled}
                  onCheckedChange={setIsAutoInputEnabled}
                />
                <span className="text-sm text-yellow-700">Auto Input</span>
              </div>
            )}
          </div>
        </div>
        
        {isAutoInputEnabled && (
          <div className="mb-6 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <Label className="text-base font-semibold text-amber-800 dark:text-amber-200">
                Auto Input Total Gold Value
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="text"
                value={autoInputValue}
                onChange={(e) => setAutoInputValue(e.target.value)}
                placeholder="Enter total GP value (e.g., 1000000)"
                className="bg-white dark:bg-slate-800"
              />
              <Button
                onClick={handleAutoInput}
                disabled={!autoInputValue.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto Set
              </Button>
            </div>
            
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              This will automatically distribute the total value between platinum tokens and coins
            </p>
          </div>
        )}
        
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
