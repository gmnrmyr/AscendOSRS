
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Save, FileDown, Cloud, CloudDownload } from "lucide-react";
import { CloudDataService } from "@/services/cloudDataService";
import { useAuth } from "@/hooks/useAuth";

interface DataManagerProps {
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
  setAllData: (data: {
    characters: any[];
    moneyMethods: any[];
    purchaseGoals: any[];
    bankData: Record<string, any[]>;
    hoursPerDay: number;
  }) => void;
}

export function DataManager({
  characters,
  moneyMethods,
  purchaseGoals,
  bankData,
  hoursPerDay,
  setCharacters,
  setMoneyMethods,
  setPurchaseGoals,
  setBankData,
  setHoursPerDay,
  setAllData
}: DataManagerProps) {
  const [importData, setImportData] = useState("");
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      if (parsed.bankData) setB;
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

  const saveToCloud = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save data to the cloud",
        variant: "destructive"
      });
      return;
    }

    setIsCloudSaving(true);
    try {
      await CloudDataService.saveUserData(
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay
      );
      
      toast({
        title: "Cloud Save Successful",
        description: "Your data has been saved to the cloud"
      });
    } catch (error) {
      console.error('Cloud save failed:', error);
      toast({
        title: "Cloud Save Failed",
        description: "Failed to save data to the cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCloudSaving(false);
    }
  };

  const loadFromCloud = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to load data from the cloud",
        variant: "destructive"
      });
      return;
    }

    setIsCloudLoading(true);
    try {
      const cloudData = await CloudDataService.loadUserData();
      
      setAllData(cloudData);
      
      toast({
        title: "Cloud Load Successful",
        description: "Your data has been loaded from the cloud"
      });
    } catch (error) {
      console.error('Cloud load failed:', error);
      toast({
        title: "Cloud Load Failed",
        description: "Failed to load data from the cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCloudLoading(false);
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2">Data Management</h2>
        <p className="text-amber-600">Export, import, and manage your OSRS dashboard data</p>
      </div>

      {/* Cloud Operations */}
      {user && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Cloud className="h-5 w-5" />
              Cloud Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={saveToCloud} 
                disabled={isCloudSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCloudSaving ? "Saving..." : "Save to Cloud"}
              </Button>
              
              <Button 
                onClick={loadFromCloud} 
                disabled={isCloudLoading}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <CloudDownload className="h-4 w-4 mr-2" />
                {isCloudLoading ? "Loading..." : "Load from Cloud"}
              </Button>
            </div>
            <p className="text-sm text-blue-600">
              Cloud storage automatically syncs your data when you make changes
            </p>
          </CardContent>
        </Card>
      )}

      {/* Local Export/Import */}
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

      {/* Data Summary */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800">Current Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-amber-700">{characters.length}</div>
              <div className="text-sm text-amber-600">Characters</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-amber-700">{moneyMethods.length}</div>
              <div className="text-sm text-amber-600">Money Methods</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-amber-700">{purchaseGoals.length}</div>
              <div className="text-sm text-amber-600">Purchase Goals</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-amber-700">
                {Object.values(bankData).reduce((sum, items) => sum + items.length, 0)}
              </div>
              <div className="text-sm text-amber-600">Bank Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
