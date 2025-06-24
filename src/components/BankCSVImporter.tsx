
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText } from "lucide-react";
import { osrsApi } from "@/services/osrsApi";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

interface BankCSVImporterProps {
  onImportBank: (items: BankItem[], character: string, isUpdate?: boolean) => void;
  characters: Array<{ id: string; name: string }>;
  bankData: Record<string, BankItem[]>;
}

export function BankCSVImporter({ onImportBank, characters, bankData }: BankCSVImporterProps) {
  const [csvData, setCsvData] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedItems, setParsedItems] = useState<{name: string; quantity: number; value: number}[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        handleParseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleParseCSV = async (data: string) => {
    try {
      const items = await osrsApi.parseBankCSV(data);
      setParsedItems(items);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setParsedItems([]);
    }
  };

  const handleImport = async () => {
    if (!selectedCharacter || parsedItems.length === 0) return;

    setIsImporting(true);
    try {
      const bankItems: BankItem[] = await Promise.all(
        parsedItems.map(async (item, index) => {
          let estimatedPrice = item.value;
          
          // If no value provided, try to fetch from OSRS API
          if (!estimatedPrice) {
            estimatedPrice = await osrsApi.getEstimatedItemValue(item.name);
          }

          return {
            id: `${Date.now()}-${index}`,
            name: item.name,
            quantity: item.quantity,
            estimatedPrice: estimatedPrice,
            category: 'stackable' as const,
            character: selectedCharacter
          };
        })
      );

      onImportBank(bankItems, selectedCharacter, isUpdate);
      setCsvData('');
      setParsedItems([]);
      setSelectedCharacter('');
    } catch (error) {
      console.error('Error importing bank data:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const currentBankValue = selectedCharacter && bankData[selectedCharacter] 
    ? bankData[selectedCharacter].reduce((total, item) => total + (item.quantity * item.estimatedPrice), 0)
    : 0;

  return (
    <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Upload className="h-5 w-5" />
          Import Bank Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Character</Label>
          <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
            <SelectTrigger className="bg-white dark:bg-slate-800">
              <SelectValue placeholder="Choose character to import bank for" />
            </SelectTrigger>
            <SelectContent>
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCharacter && bankData[selectedCharacter] && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="update-mode" 
              checked={isUpdate}
              onCheckedChange={setIsUpdate}
            />
            <Label htmlFor="update-mode">
              Replace existing bank data (Current: {currentBankValue.toLocaleString()} GP)
            </Label>
          </div>
        )}

        <div>
          <Label>Upload CSV File</Label>
          <Input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="bg-white dark:bg-slate-800"
          />
        </div>

        {parsedItems.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Preview ({parsedItems.length} items)</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
              {parsedItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.quantity.toLocaleString()}x</span>
                </div>
              ))}
              {parsedItems.length > 5 && <div className="text-gray-500">...and {parsedItems.length - 5} more</div>}
            </div>
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={!selectedCharacter || parsedItems.length === 0 || isImporting}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isImporting ? 'Importing...' : `Import ${parsedItems.length} Items`}
        </Button>
      </CardContent>
    </Card>
  );
}
