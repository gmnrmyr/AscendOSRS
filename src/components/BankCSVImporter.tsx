import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { osrsApi } from "@/services/osrsApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [csvData, setCsvData] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [previewItems, setPreviewItems] = useState<Array<{name: string; quantity: number; value: number}>>([]);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const { toast } = useToast();

  const handleCSVParse = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data",
        variant: "destructive"
      });
      return;
    }

    try {
      const items = osrsApi.parseBankCSV(csvData);
      setPreviewItems(items);
      
      toast({
        title: "Success",
        description: `Parsed ${items.length} items from CSV`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const handleImport = () => {
    if (!selectedCharacter) {
      toast({
        title: "Error",
        description: "Please select a character",
        variant: "destructive"
      });
      return;
    }

    if (previewItems.length === 0) {
      toast({
        title: "Error",
        description: "No items to import",
        variant: "destructive"
      });
      return;
    }

    // Check if character already has bank data
    const existingItems = bankData[selectedCharacter];
    if (existingItems && existingItems.length > 0) {
      setShowUpdateDialog(true);
      return;
    }

    performImport(false);
  };

  const performImport = (isUpdate: boolean) => {
    const bankItems: BankItem[] = previewItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item.name,
      quantity: item.quantity,
      estimatedPrice: Math.floor(item.value / item.quantity) || 0,
      category: determineCategory(item.name),
      character: selectedCharacter
    }));

    onImportBank(bankItems, selectedCharacter, isUpdate);
    
    toast({
      title: "Success",
      description: `${isUpdate ? 'Updated' : 'Imported'} ${bankItems.length} items to ${selectedCharacter}'s bank`
    });

    // Reset form
    setCsvData("");
    setPreviewItems([]);
    setShowUpdateDialog(false);
  };

  const determineCategory = (itemName: string): 'stackable' | 'gear' | 'materials' | 'other' => {
    const name = itemName.toLowerCase();
    
    if (name.includes('coin') || name.includes('gp')) return 'stackable';
    if (name.includes('potion') || name.includes('food') || name.includes('rune') || name.includes('arrow') || name.includes('bolt')) return 'stackable';
    if (name.includes('chestplate') || name.includes('platebody') || name.includes('helmet') || name.includes('boots') || name.includes('gloves') || name.includes('ring') || name.includes('amulet') || name.includes('weapon') || name.includes('sword') || name.includes('bow') || name.includes('staff')) return 'gear';
    if (name.includes('ore') || name.includes('bar') || name.includes('log') || name.includes('hide') || name.includes('essence')) return 'materials';
    
    return 'other';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  const existingItemsCount = bankData[selectedCharacter]?.length || 0;

  return (
    <>
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Upload className="h-5 w-5" />
            Import Bank via CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">RuneLite Bank Export Instructions:</span>
            </div>
            <ol className="text-sm text-blue-700 space-y-1 ml-4">
              <li>1. Install the "Bank Value" plugin in RuneLite</li>
              <li>2. Open your bank in-game</li>
              <li>3. Right-click the plugin panel and select "Export bank"</li>
              <li>4. Copy the CSV data and paste it below</li>
            </ol>
          </div>

          <div>
            <Label>Select Character</Label>
            <select 
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Select a character...</option>
              {characters.map(char => (
                <option key={char.id} value={char.name}>
                  {char.name} {bankData[char.name]?.length ? `(${bankData[char.name].length} items)` : ''}
                </option>
              ))}
            </select>
            {selectedCharacter && existingItemsCount > 0 && (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                This character already has {existingItemsCount} items in their bank
              </p>
            )}
          </div>

          <div>
            <Label>Bank CSV Data</Label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your bank CSV data here..."
              className="h-32 bg-white"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCSVParse} variant="outline">
              Parse CSV
            </Button>
            
            {previewItems.length > 0 && (
              <Button onClick={handleImport} className="bg-amber-600 hover:bg-amber-700">
                {existingItemsCount > 0 ? 'Update' : 'Import'} {previewItems.length} Items
              </Button>
            )}
          </div>

          {previewItems.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Preview ({previewItems.length} items)</span>
              </div>
              {previewItems.slice(0, 10).map((item, index) => (
                <div key={index} className="px-3 py-2 border-b border-gray-100 last:border-b-0 bg-white">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">
                      {item.quantity.toLocaleString()} × {formatValue(item.value)}
                    </span>
                  </div>
                </div>
              ))}
              {previewItems.length > 10 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center bg-gray-50">
                  ... and {previewItems.length - 10} more items
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Existing Bank Data?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCharacter} already has {existingItemsCount} items in their bank. 
              Do you want to replace the existing data with this new import?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => performImport(true)}>
              Yes, Update Bank
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
