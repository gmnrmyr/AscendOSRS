
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save } from "lucide-react";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

export interface BankValueManagerProps {
  selectedCharacter: string;
  bankData: Record<string, BankItem[]>;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
  formatGP: (amount: number) => string;
  getTotalBankValue: () => number;
}

export function BankValueManager({ 
  selectedCharacter, 
  bankData, 
  setBankData, 
  formatGP, 
  getTotalBankValue 
}: BankValueManagerProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const characterItems = bankData[selectedCharacter] || [];

  const startEditingPrice = (itemId: string, currentPrice: number) => {
    setEditingItem(itemId);
    setEditPrice(currentPrice);
  };

  const savePrice = () => {
    if (!editingItem) return;

    const updatedBankData = { ...bankData };
    if (updatedBankData[selectedCharacter]) {
      updatedBankData[selectedCharacter] = updatedBankData[selectedCharacter].map(item =>
        item.id === editingItem ? { ...item, estimatedPrice: editPrice } : item
      );
      setBankData(updatedBankData);
    }

    setEditingItem(null);
    setEditPrice(0);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditPrice(0);
  };

  return (
    <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <DollarSign className="h-5 w-5" />
          Bank Value Manager - {selectedCharacter}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded p-4 border">
          <p className="text-lg font-semibold">
            Total Bank Value: {formatGP(getTotalBankValue())}
          </p>
          <p className="text-sm text-muted-foreground">
            {characterItems.length} items in bank
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {characterItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity.toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {editingItem === item.id ? (
                  <>
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-24"
                      min="0"
                    />
                    <Button size="sm" onClick={savePrice} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm w-20 text-right">
                      {formatGP(item.estimatedPrice)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditingPrice(item.id, item.estimatedPrice)}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {characterItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items in bank for this character</p>
            <p className="text-sm">Add items using the form above or import bank data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
