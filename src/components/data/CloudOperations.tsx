import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, CloudDownload, Cloud, Upload, AlertTriangle, RefreshCw } from "lucide-react";
import { CloudDataService } from "@/services/cloudDataService";
import { useAuth } from "@/hooks/useAuth";

interface CloudOperationsProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  setAllData: (data: {
    characters: any[];
    moneyMethods: any[];
    purchaseGoals: any[];
    bankData: Record<string, any[]>;
    hoursPerDay: number;
  }) => void;
}

export function CloudOperations({
  characters,
  moneyMethods,
  purchaseGoals,
  bankData,
  hoursPerDay,
  setAllData
}: CloudOperationsProps) {
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isCloudSaving2, setIsCloudSaving2] = useState(false);
  const [isCloudSavingChunked, setIsCloudSavingChunked] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [lastSyncWarning, setLastSyncWarning] = useState<string | null>(null);
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number; phase: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate total bank items for recommendations
  const totalBankItems = Object.values(bankData).flat().length;
  const isLargeDataset = totalBankItems > 500;

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
    setLastSyncWarning(null);
    
    try {
      console.log('Starting cloud save...');
      console.log('User ID:', user.id);
      console.log('Data being saved:', {
        characters: characters.length,
        moneyMethods: moneyMethods.length,
        purchaseGoals: purchaseGoals.length,
        bankData: Object.keys(bankData).length,
        hoursPerDay
      });
      
      const result = await CloudDataService.saveUserData(
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay
      );
      
      // Check for warnings or partial sync
      if (result?.warning || result?.partialSync) {
        setLastSyncWarning(result.warning || 'Some data may not have synced completely');
        
        toast({
          title: "Cloud Save - Warning",
          description: result.warning || "Some items may not have synced properly. Check the sync status below.",
          variant: "destructive",
          duration: 8000
        });
      } else {
        toast({
          title: "Cloud Save Successful",
          description: "Your data has been saved to the cloud"
        });
      }
    } catch (error) {
      console.error('Cloud save failed:', error);
      toast({
        title: "Cloud Save Failed",
        description: `Failed to save data to the cloud: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCloudSaving(false);
    }
  };

  const saveToCloud2 = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save data to the cloud",
        variant: "destructive"
      });
      return;
    }

    setIsCloudSaving2(true);
    setLastSyncWarning(null);
    
    try {
      console.log('Starting cloud save 2...');
      
      // Enhanced validation before saving
      const validatedData = {
        characters: characters.map(char => ({
          ...char,
          type: char.type || 'main',
          combatLevel: Math.max(3, Math.min(126, parseInt(String(char.combatLevel)) || 3)),
          totalLevel: Math.max(32, Math.min(2277, parseInt(String(char.totalLevel)) || 32)),
          bank: Math.max(0, parseInt(String(char.bank)) || 0),
          platTokens: Math.max(0, parseInt(String(char.platTokens)) || 0)
        })),
        moneyMethods: moneyMethods.map(method => ({
          ...method,
          gpHour: Math.max(0, parseInt(String(method.gpHour)) || 0),
          clickIntensity: Math.min(Math.max(parseInt(String(method.clickIntensity)) || 1, 1), 5),
          category: ['combat', 'skilling', 'bossing', 'other'].includes(method.category) ? method.category : 'other'
        })),
        purchaseGoals: purchaseGoals.map(goal => ({
          ...goal,
          currentPrice: Math.max(0, parseInt(String(goal.currentPrice)) || 0),
          quantity: Math.max(1, parseInt(String(goal.quantity)) || 1),
          priority: ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(goal.priority) ? goal.priority : 'A',
          category: ['gear', 'consumables', 'materials', 'other'].includes(goal.category) ? goal.category : 'other'
        })),
        bankData: Object.fromEntries(
          Object.entries(bankData).map(([character, items]) => [
            character,
            items.map(item => ({
              ...item,
              quantity: Math.max(0, parseInt(String(item.quantity)) || 0),
              estimatedPrice: Math.max(0, parseInt(String(item.estimatedPrice)) || 0),
              category: ['stackable', 'gear', 'materials', 'other'].includes(item.category) ? item.category : 'other'
            }))
          ])
        ),
        hoursPerDay
      };

      const result = await CloudDataService.saveUserData(
        validatedData.characters,
        validatedData.moneyMethods,
        validatedData.purchaseGoals,
        validatedData.bankData,
        validatedData.hoursPerDay
      );
      
      // Check for warnings or partial sync
      if (result?.warning || result?.partialSync) {
        setLastSyncWarning(result.warning || 'Some data may not have synced completely');
        
        toast({
          title: "Cloud Save 2 - Warning",
          description: result.warning || "Some items may not have synced properly with enhanced validation.",
          variant: "destructive",
          duration: 8000
        });
      } else {
        toast({
          title: "Cloud Save 2 Successful",
          description: "Your data has been saved to the cloud with enhanced validation"
        });
      }
    } catch (error) {
      console.error('Cloud save 2 failed:', error);
      toast({
        title: "Cloud Save 2 Failed",
        description: "Failed to save data to the cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCloudSaving2(false);
    }
  };

  const saveToCloudChunked = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save data to the cloud",
        variant: "destructive"
      });
      return;
    }

    setIsCloudSavingChunked(true);
    setLastSyncWarning(null);
    setChunkProgress({ current: 0, total: 4, phase: 'Starting chunked save...' });
    
    try {
      console.log('Starting chunked cloud save...');
      console.log('User ID:', user.id);
      console.log('Large dataset detected:', {
        bankItems: totalBankItems,
        characters: characters.length,
        moneyMethods: moneyMethods.length,
        purchaseGoals: purchaseGoals.length
      });
      
      const result = await CloudDataService.saveUserDataChunked(
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay,
        (progress) => {
          setChunkProgress(progress);
          console.log('Chunked save progress:', progress);
        }
      );
      
      setChunkProgress(null);
      
      // Check for warnings or partial sync
      if (result?.warning || result?.partialSync) {
        setLastSyncWarning(result.warning || 'Some data may not have synced completely');
        
        toast({
          title: "Chunked Save - Warning",
          description: result.warning || "Some items may not have synced properly using chunked method.",
          variant: "destructive",
          duration: 10000
        });
      } else {
        toast({
          title: "Chunked Save Successful",
          description: `Large dataset saved successfully using chunked method. ${totalBankItems} items processed.`
        });
      }
    } catch (error) {
      console.error('Chunked cloud save failed:', error);
      setChunkProgress(null);
      toast({
        title: "Chunked Save Failed",
        description: `Failed to save large dataset: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCloudSavingChunked(false);
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
    setLastSyncWarning(null);
    
    try {
      console.log('Loading data from cloud...');
      const data = await CloudDataService.loadUserData();
      
      console.log('Loaded data:', data);
      
      // Update all data
      setAllData({
        characters: data.characters || [],
        moneyMethods: data.moneyMethods || [],
        purchaseGoals: data.purchaseGoals || [],
        bankData: data.bankData || {},
        hoursPerDay: data.hoursPerDay || 10
      });
      
      // Count loaded items for user feedback
      const totalBankItems = Object.values(data.bankData || {}).flat().length;
      const totalCharacters = Object.keys(data.bankData || {}).length;
      
      toast({
        title: "Cloud Load Successful",
        description: `Loaded ${data.characters?.length || 0} characters, ${data.moneyMethods?.length || 0} methods, ${data.purchaseGoals?.length || 0} goals, and ${totalBankItems} bank items across ${totalCharacters} characters`
      });
    } catch (error) {
      console.error('Cloud load failed:', error);
      toast({
        title: "Cloud Load Failed",
        description: `Failed to load data from the cloud: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const recoverFromBrowser = () => {
    try {
      console.log('🔄 Attempting to recover data from browser localStorage...');
      
      const savedData = localStorage.getItem('osrs-dashboard-data');
      if (!savedData) {
        toast({
          title: "No Browser Data Found",
          description: "No data found in browser storage. Your data may have been lost.",
          variant: "destructive"
        });
        return;
      }

      const parsed = JSON.parse(savedData);
      console.log('📦 Found browser data:', parsed);
      
      const recoveredData = {
        characters: parsed.characters || [],
        moneyMethods: parsed.moneyMethods || [],
        purchaseGoals: parsed.purchaseGoals || [],
        bankData: parsed.bankData || {},
        hoursPerDay: parsed.hoursPerDay || 10
      };

      // Count items for feedback
      const totalBankItems = Object.values(recoveredData.bankData).flat().length;
      const totalCharacters = Object.keys(recoveredData.bankData).length;

      console.log('📊 Recovery summary:', {
        characters: recoveredData.characters.length,
        bankItems: totalBankItems,
        charactersWithBanks: totalCharacters
      });

      // Update app state
      setAllData(recoveredData);

      toast({
        title: "Data Recovered Successfully! 🎉",
        description: `Recovered ${recoveredData.characters.length} characters and ${totalBankItems} bank items from browser storage!`,
        duration: 8000
      });

      console.log('✅ Data recovery completed successfully!');
      
    } catch (error) {
      console.error('Recovery failed:', error);
      toast({
        title: "Recovery Failed",
        description: "Failed to recover data from browser storage",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Cloud className="h-5 w-5" />
          Cloud Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emergency Data Recovery Alert */}
        {(totalBankItems === 0 && characters.length === 0) && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 text-lg">🚨 Data Recovery Needed</h4>
                <p className="text-red-700 mt-1">
                  Your data appears to be missing. This may have happened due to a sync issue.
                </p>
                <p className="text-red-600 text-sm mt-2 font-medium">
                  ✅ Click "🚨 Recover from Browser" below to restore your data from browser storage!
                </p>
                <p className="text-red-500 text-xs mt-1">
                  Your bank items, characters, and other data should still be saved in your browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Large Dataset Warning */}
        {isLargeDataset && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Large Dataset Detected</h4>
                <p className="text-sm text-amber-700 mt-1">
                  You have {totalBankItems.toLocaleString()} bank items. For better reliability with large datasets, use "Chunked Save".
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Chunked save processes items in smaller batches and prioritizes your most valuable items first.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sync Warning Alert */}
        {lastSyncWarning && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Sync Warning</h4>
                <p className="text-sm text-orange-700 mt-1">{lastSyncWarning}</p>
                <div className="bg-orange-100 rounded p-2 mt-2 text-xs text-orange-800">
                  <p><strong>💡 Understanding the results:</strong></p>
                  <p>• <strong>90%+ success rate is excellent!</strong> Your most valuable items (Twisted Bow, Scythe, etc.) are saved first</p>
                  <p>• Failed items are typically the least valuable ones (low-value materials, consumables)</p>
                  <p>• Each character's bank is saved separately to overcome database limits</p>
                  <p>• Check browser console for detailed per-character breakdown</p>
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  <strong>Next steps:</strong> Try saving again, or check individual characters if needed. Your most valuable items are secure!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chunked Save Progress */}
        {chunkProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">Saving Large Dataset - Character by Character</h4>
                <p className="text-sm text-blue-700">{chunkProgress.phase}</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(chunkProgress.current / chunkProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Step {chunkProgress.current} of {chunkProgress.total} - Each character saved separately
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={saveToCloud} 
            disabled={isCloudSaving || isCloudSavingChunked}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCloudSaving ? "Saving..." : "Save to Cloud"}
          </Button>

          <Button 
            onClick={saveToCloud2} 
            disabled={isCloudSaving2 || isCloudSavingChunked}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isCloudSaving2 ? "Saving..." : "Save to Cloud 2"}
          </Button>

          {/* Fixed Chunked Save Button */}
          <Button 
            onClick={saveToCloudChunked} 
            disabled={isCloudSavingChunked || isCloudSaving || isCloudSaving2}
            className={`${isLargeDataset 
              ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-300" 
              : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isCloudSavingChunked ? "Saving..." : "True Chunked Save"}
            {isLargeDataset && <span className="ml-1 text-xs">✅</span>}
          </Button>
          
          <Button 
            onClick={loadFromCloud} 
            disabled={isCloudLoading || isCloudSavingChunked}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <CloudDownload className="h-4 w-4 mr-2" />
            {isCloudLoading ? "Loading..." : "Load from Cloud"}
          </Button>

          {/* Emergency Recovery Button */}
          <Button 
            onClick={recoverFromBrowser} 
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            🚨 Recover from Browser
          </Button>
        </div>
        
        <div className="text-sm text-blue-600 space-y-1">
          <p>Cloud storage automatically syncs your data when you make changes.</p>
                  {isLargeDataset && (
          <p className="text-green-600 font-medium">
            ✅ True Chunked Save recommended for {totalBankItems.toLocaleString()} items - saves each character separately with most valuable items first
          </p>
        )}
          <p className="text-xs text-gray-500">
            Regular Save: Fast, may timeout with large datasets | 
            Enhanced Save: Better validation | 
            True Chunked Save: Character-by-character saves, overcomes 1000-item limit | 
            🚨 Recovery: Restores data from browser storage
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
