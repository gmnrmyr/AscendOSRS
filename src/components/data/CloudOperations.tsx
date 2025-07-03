
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, CloudDownload, Cloud, Upload } from "lucide-react";
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
      console.log('Starting cloud save...');
      console.log('User ID:', user.id);
      console.log('Data being saved:', {
        characters: characters.length,
        moneyMethods: moneyMethods.length,
        purchaseGoals: purchaseGoals.length,
        bankData: Object.keys(bankData).length,
        hoursPerDay
      });
      
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

      await CloudDataService.saveUserData(
        validatedData.characters,
        validatedData.moneyMethods,
        validatedData.purchaseGoals,
        validatedData.bankData,
        validatedData.hoursPerDay
      );
      
      toast({
        title: "Cloud Save 2 Successful",
        description: "Your data has been saved to the cloud with enhanced validation"
      });
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
      console.log('Starting cloud load...');
      console.log('User ID:', user.id);
      
      const cloudData = await CloudDataService.loadUserData();
      
      console.log('Cloud data loaded:', {
        characters: cloudData.characters?.length || 0,
        moneyMethods: cloudData.moneyMethods?.length || 0,
        purchaseGoals: cloudData.purchaseGoals?.length || 0,
        bankData: Object.keys(cloudData.bankData || {}).length,
        hoursPerDay: cloudData.hoursPerDay
      });
      
      setAllData(cloudData);
      
      toast({
        title: "Cloud Load Successful",
        description: "Your data has been loaded from the cloud"
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
            onClick={saveToCloud2} 
            disabled={isCloudSaving2}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isCloudSaving2 ? "Saving..." : "Save to Cloud 2"}
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
          Cloud storage automatically syncs your data when you make changes. Use "Save to Cloud 2" for enhanced validation.
        </p>
      </CardContent>
    </Card>
  );
}
