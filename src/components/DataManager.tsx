import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Download, Upload, X, Cloud, CloudUpload, CloudDownload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CloudDataService } from "@/services/cloudDataService";
import { useAuth } from "@/hooks/useAuth";

interface DataManagerProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  setCharacters: (data: any[]) => void;
  setMoneyMethods: (data: any[]) => void;
  setPurchaseGoals: (data: any[]) => void;
  setBankData: (data: Record<string, any[]>) => void;
  setHoursPerDay: (hours: number) => void;
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
  setHoursPerDay
}: DataManagerProps) {
  const [importData, setImportData] = useState('');
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
        description: "Your OSRS tracker data has been saved to the cloud"
      });
    } catch (error) {
      console.error('Cloud save error:', error);
      toast({
        title: "Cloud Save Failed",
        description: "Failed to save data to cloud. Please try again.",
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

    if (!window.confirm("This will replace all your current data with data from the cloud. Are you sure?")) {
      return;
    }

    setIsCloudLoading(true);
    try {
      const cloudData = await CloudDataService.loadUserData();
      
      setCharacters(cloudData.characters);
      setMoneyMethods(cloudData.moneyMethods);
      setPurchaseGoals(cloudData.purchaseGoals);
      setBankData(cloudData.bankData);
      setHoursPerDay(cloudData.hoursPerDay);

      toast({
        title: "Cloud Load Successful",
        description: "Your OSRS tracker data has been loaded from the cloud"
      });
    } catch (error) {
      console.error('Cloud load error:', error);
      toast({
        title: "Cloud Load Failed",
        description: "Failed to load data from cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const exportData = () => {
    const dataToExport = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osrs-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your OSRS tracker data has been exported successfully"
    });
  };

  const importDataFromFile = () => {
    try {
      const parsed = JSON.parse(importData);
      
      if (!parsed.data) {
        throw new Error("Invalid data format - missing 'data' property");
      }

      const { data } = parsed;
      
      if (data.characters) setCharacters(data.characters);
      if (data.moneyMethods) setMoneyMethods(data.moneyMethods);
      if (data.purchaseGoals) setPurchaseGoals(data.purchaseGoals);
      if (data.bankData) setBankData(data.bankData);
      if (data.hoursPerDay) setHoursPerDay(data.hoursPerDay);

      setImportData('');
      
      toast({
        title: "Data Imported",
        description: `Successfully imported data from ${parsed.timestamp ? new Date(parsed.timestamp).toLocaleDateString() : 'backup'}`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid JSON format or corrupted data",
        variant: "destructive"
      });
      console.error('Import error:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setImportData(text);
      } catch (error) {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      setCharacters([]);
      setMoneyMethods([]);
      setPurchaseGoals([]);
      setBankData({});
      setHoursPerDay(10);
      
      // Also clear localStorage
      localStorage.removeItem('osrs-dashboard-data');
      
      toast({
        title: "Data Cleared",
        description: "All data has been cleared successfully",
        variant: "destructive"
      });
    }
  };

  const getDataSummary = () => {
    const totalBankValue = Object.keys(bankData).reduce((total, character) => {
      const items = bankData[character] || [];
      return total + items.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
    }, 0);

    const totalGoalValue = purchaseGoals.reduce((sum, goal) => {
      return sum + ((goal.targetPrice || goal.currentPrice) * goal.quantity);
    }, 0);

    return { totalBankValue, totalGoalValue };
  };

  const { totalBankValue, totalGoalValue } = getDataSummary();

  const formatGP = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Settings className="h-5 w-5" />
            Data Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {characters.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {moneyMethods.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Money Methods</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {purchaseGoals.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Purchase Goals</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatGP(totalBankValue)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bank Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Save/Load */}
      {user && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Cloud className="h-5 w-5" />
              Cloud Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Save your data to the cloud and access it from any device. Your data is securely stored 
              and synchronized with your account.
            </p>
            
            <div className="flex gap-4">
              <Button 
                onClick={saveToCloud}
                disabled={isCloudSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCloudSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <CloudUpload className="h-4 w-4 mr-2" />
                )}
                {isCloudSaving ? 'Saving...' : 'Save to Cloud'}
              </Button>
              
              <Button 
                onClick={loadFromCloud}
                disabled={isCloudLoading}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {isCloudLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                ) : (
                  <CloudDownload className="h-4 w-4 mr-2" />
                )}
                {isCloudLoading ? 'Loading...' : 'Load from Cloud'}
              </Button>
            </div>
            
            <p className="text-sm text-blue-600 dark:text-blue-300">
              💡 Your data is automatically saved locally. Use cloud storage to sync across devices.
            </p>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              🔒 Log in to enable cloud storage and sync your data across devices.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Export Data */}
      <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Download className="h-5 w-5" />
            Export Data (Data Exporter Compatible)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Download your complete OSRS tracker data as a JSON file. This backup is compatible with 
            the OSRS Data Exporter plugin format and includes all characters, money-making methods, 
            purchase goals, and bank data.
          </p>
          
          <div className="flex gap-4">
            <Button onClick={exportData} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Backup
            </Button>
            
            <Badge variant="outline" className="flex items-center gap-2">
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Upload className="h-5 w-5" />
            Import Data (Data Exporter Compatible)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Import data from a previously exported JSON file or from the OSRS Data Exporter plugin. 
            This will merge with your existing data or replace it entirely.
          </p>
          
          <div>
            <Label>Upload JSON File</Label>
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <Label>Or Paste JSON Data</Label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your exported JSON data here..."
              className="h-32 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={importDataFromFile} 
              disabled={!importData.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            {importData && (
              <Button 
                onClick={() => setImportData('')} 
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Settings className="h-5 w-5" />
            Settings & Advanced
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Hours per Day</Label>
            <Input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              min="1"
              max="24"
              className="w-32 bg-white dark:bg-slate-800"
            />
            <p className="text-sm text-gray-500 mt-1">
              Used for time calculations across the dashboard
            </p>
          </div>

          <div className="border-t pt-4">
            <Button 
              onClick={clearAllData} 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
            <p className="text-sm text-red-500 mt-2">
              ⚠️ This will permanently delete all your data. Export a backup first!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Storage Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            💾 Data Storage Information
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Your data is stored locally in your browser and automatically saved. Use cloud storage 
            to sync across devices. Regular exports are recommended as backups. This app works 
            completely offline once loaded.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
