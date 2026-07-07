import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileDown, Copy } from "lucide-react";

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

const GOLD = { color: "hsl(var(--gold))" };

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

  const buildPayload = () => ({
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    exportedAt: new Date().toISOString(),
    version: "1.0"
  });

  const exportData = () => {
    const jsonString = JSON.stringify(buildPayload(), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `osrs-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Data Exported", description: "Your data has been exported successfully" });
  };

  const importFromText = () => {
    if (!importData.trim()) {
      toast({ title: "Error", description: "Please paste your data first", variant: "destructive" });
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
      toast({ title: "Data Imported", description: "Your data has been imported successfully" });
    } catch {
      toast({ title: "Import Error", description: "Invalid data format. Please check your JSON.", variant: "destructive" });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
    toast({ title: "Copied to Clipboard", description: "Data has been copied to your clipboard" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="osrs-card p-6">
        <h3 className="osrs-title text-xl flex items-center gap-2 mb-3">
          <Download className="h-5 w-5" style={GOLD} />
          Export Data
        </h3>
        <p className="osrs-muted text-sm mb-4">
          Download the full dashboard as JSON (backup / move between machines)
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportData} className="pixel-button-primary">
            <FileDown className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button onClick={copyToClipboard} className="osrs-button-secondary">
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
        </div>
      </div>

      <div className="osrs-card p-6">
        <h3 className="osrs-title text-xl flex items-center gap-2 mb-3">
          <Upload className="h-5 w-5" style={GOLD} />
          Import Data
        </h3>
        <p className="osrs-muted text-sm mb-4">
          Paste an exported JSON to restore the dashboard (replaces current data)
        </p>
        <Textarea
          placeholder="Paste your exported JSON data here..."
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          rows={4}
          className="pixel-input w-full font-mono text-sm mb-3"
        />
        <Button onClick={importFromText} className="pixel-button-primary">
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>
      </div>
    </div>
  );
}
