
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, CloudDownload, Cloud } from "lucide-react";
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
      console.log('Starting cloud load...');
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
  );
}
