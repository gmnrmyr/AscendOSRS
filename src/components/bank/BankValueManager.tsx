
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Edit3, Save, X } from "lucide-react";

interface BankValueManagerProps {
  selectedCharacter: string;
  getCharacterBankValue: (character: string) => number;
  getCharacterGoldValue: (character: string) => number;
  formatGP: (amount: number) => string;
  onManualBankValueUpdate?: (character: string, value: number) => void;
}

export function BankValueManager({
  selectedCharacter,
  getCharacterBankValue,
  getCharacterGoldValue,
  formatGP,
  onManualBankValueUpdate
}: BankValueManagerProps) {
  const [isEditingManualValue, setIsEditingManualValue] = useState(false);
  const [manualBankValue, setManualBankValue] = useState(0);

  const totalBankValue = getCharacterBankValue(selectedCharacter);
  const goldValue = getCharacterGoldValue(selectedCharacter);
  const itemsValue = totalBankValue - goldValue;

  const handleSaveManualValue = () => {
    if (onManualBankValueUpdate) {
      onManualBankValueUpdate(selectedCharacter, manualBankValue);
    }
    setIsEditingManualValue(false);
  };

  const handleCancelEdit = () => {
    setIsEditingManualValue(false);
    setManualBankValue(itemsValue);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
            Bank Value Summary
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Items Value</Label>
              <div className="flex items-center justify-between mt-2">
                {isEditingManualValue ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      type="number"
                      value={manualBankValue}
                      onChange={(e) => setManualBankValue(Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleSaveManualValue} className="h-8 w-8 p-0">
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-bold text-blue-600">{formatGP(itemsValue)}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setManualBankValue(itemsValue);
                        setIsEditingManualValue(true);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Excluding gold & plat</p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gold Value</Label>
              <p className="text-lg font-bold text-yellow-600 mt-2">{formatGP(goldValue)}</p>
              <p className="text-xs text-gray-500 mt-1">Coins + Plat tokens</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200">
              <Label className="text-sm font-medium text-green-700 dark:text-green-300">Total Bank Value</Label>
              <p className="text-xl font-bold text-green-800 dark:text-green-200 mt-2">{formatGP(totalBankValue)}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Items + Gold + Plat</p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Auto-calculated from bank items
            </Badge>
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              Click edit to override item values
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
