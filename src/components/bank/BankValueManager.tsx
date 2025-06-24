
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

interface BankValueManagerProps {
  selectedCharacter: string;
  bankData: Record<string, BankItem[]>;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
  formatGP: (amount: number) => string;
  getTotalBankValue: (character: string) => number;
}

export function BankValueManager({
  selectedCharacter,
  bankData,
  setBankData,
  formatGP,
  getTotalBankValue
}: BankValueManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const { toast } = useToast();

  const items = bankData[selectedCharacter] || [];
  const totalValue = getTotalBankValue(selectedCharacter);

  const startEditing = (item: BankItem) => {
    setEditingItem(item.id);
    setEditPrice(item.estimatedPrice);
  };

  const saveEdit = (itemId: string) => {
    const updatedBankData = { ...bankData };
    const characterItems = updatedBankData[selectedCharacter] || [];
    
    const itemIndex = characterItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      characterItems[itemIndex] = {
        ...characterItems[itemIndex],
        estimatedPrice: editPrice
      };
      updatedBankData[selectedCharacter] = characterItems;
      setBankData(updatedBankData);
      
      toast({
        title: "Item Updated",
        description: `Price updated to ${formatGP(editPrice)} GP`
      });
    }
    
    setEditingItem(null);
    setEditPrice(0);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditPrice(0);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-800 dark:text-blue-200">
          <span>Bank Value Manager</span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Items
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Bank Item Values - {selectedCharacter}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-32"
                            placeholder="Price per item"
                          />
                          <Button
                            size="sm"
                            onClick={() => saveEdit(item.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">
                            {formatGP(item.estimatedPrice)} GP
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatGP(totalValue)} GP
            </div>
            <p className="text-blue-600 dark:text-blue-400">
              Total Bank Value (Items Only)
            </p>
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400 text-center">
            {items.length} items • Click "Edit Items" to manually adjust prices
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
