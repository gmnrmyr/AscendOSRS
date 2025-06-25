
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Clipboard } from "lucide-react";
import { osrsApi } from "@/services/osrsApi";

interface BankCSVImporterProps {
  onImportBank: (bankItems: Array<{name: string; quantity: number; value: number}>) => void;
  characters: any[];
}

export function BankCSVImporter({ onImportBank, characters }: BankCSVImporterProps) {
  const [csvText, setCsvText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setCsvText(text);
      toast({
        title: "File Loaded",
        description: "CSV file content has been loaded. Click Import to process."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive"
      });
    }
  };

  const processCSVData = async () => {
    if (!csvText.trim()) {
      toast({
        title: "Error",
        description: "Please provide CSV data either by pasting text or uploading a file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const parsedItems = await osrsApi.parseBankCSV(csvText);
      
      if (parsedItems.length === 0) {
        toast({
          title: "No Items Found",
          description: "No valid items found in the CSV data",
          variant: "destructive"
        });
        return;
      }

      onImportBank(parsedItems);
      setCsvText("");
      toast({
        title: "Success",
        description: `Imported ${parsedItems.length} items`
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: "Import Error",
        description: "Failed to process CSV data. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
          <Upload className="h-5 w-5" />
          Import Bank Data (CSV)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload CSV File
            </Label>
            <Input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="bg-white dark:bg-slate-800"
            />
          </div>

          <div className="text-center text-sm text-gray-500">or</div>

          <div>
            <Label className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Paste CSV Data
            </Label>
            <Textarea
              placeholder="Paste your CSV data here..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              className="bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Supported formats:</strong></p>
          <p>• RuneLite Bank Export (CSV)</p>
          <p>• OSRS Data Exporter (JSON)</p>
          <p>• Custom CSV: Item Name, Quantity, Value</p>
        </div>

        <Button 
          onClick={processCSVData} 
          disabled={isProcessing || !csvText.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isProcessing ? "Processing..." : "Import Bank Data"}
        </Button>
      </CardContent>
    </Card>
  );
}
