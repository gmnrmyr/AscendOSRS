
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileDown } from "lucide-react";

interface LocalOperationsProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  setCharacters: (characters: any[]) => void;
  setMoneyMethods: (methods: any[]) => void;
  setPurchaseGoals: (goals: any[]) => void;
  setBankData: (bankData: Record<string, any[]>) => void;
  setHoursPerDay: (hours: number) => void;
}

export function LocalOperations({
  characters,
  moneyMethods,
  purchaseGoals,
  bankData,
  hoursPerDay,
  setCharacters,
  setMoneyMethods,
  setPurchaseGoals,
  setBankData,
  setHoursPerDay
}: LocalOperationsProps) {
  const [importData, setImportData] = useState("");
  const { toast } = useToast();

  const exportData = () => {
    const data = {
      characters,
      moneyMethods,
      purchaseGoals,
      bankData,
      hoursPerDay,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `osrs-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully"
    });
  };

  const importFromText = () => {
    if (!importData.trim()) {
      toast({
        title: "Error",
        description: "Please paste your data first",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsed = JSON.parse(importData);
      
      if (parsed.characters) setCharacters(parsed.characters);
      if (parsed.moneyMethods) setMoneyMethods(parsed.moneyMethods);
      if (parsed.purchaseGoals) setPurchaseGoals(parsed.purchaseGoals);
      if (parsed.bankData) setBankData(parsed.bankData);
      if (parsed.hoursPerDay) setHoursPerDay(parsed.hoursPerDay);

      setImportData("");
      toast({
        title: "Data Imported",
        description: "Your data has been imported successfully"
      });
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid data format. Please check your JSON.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    const data = {
      characters,
      moneyMethods,
      purchaseGoals,
      bankData,
      hoursPerDay,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({
      title: "Copied to Clipboard",
      description: "Data has been copied to your clipboard"
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-600">
            Download your data as a JSON file or copy to clipboard
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={exportData} className="bg-green-600 hover:bg-green-700 text-white">
              <FileDown className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
            <Button onClick={copyToClipboard} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              Copy to Clipboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-orange-600">
            Paste your exported JSON data to restore your dashboard
          </p>
          <Textarea
            placeholder="Paste your exported JSON data here..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={4}
            className="bg-white border-orange-300"
          />
          <Button onClick={importFromText} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
