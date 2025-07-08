import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, CloudDownload, Cloud, Upload, AlertTriangle, RefreshCw, History, Shield, Clock, Database } from "lucide-react";
import { CloudDataService } from "@/services/cloudDataService";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  
  // New state for data protection and versioning
  const [showDataProtectionDialog, setShowDataProtectionDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [restoringSnapshot, setRestoringSnapshot] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [verifyingMigration, setVerifyingMigration] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  
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
      
      // Handle data protection error
      if (error.message?.includes('DATA_PROTECTION')) {
        setShowDataProtectionDialog(true);
        toast({
          title: "🛡️ Data Protection Active",
          description: "Your data is protected from accidental deletion. Check the confirmation dialog.",
          duration: 5000
        });
      } else {
        toast({
          title: "Cloud Save Failed",
          description: `Failed to save data to the cloud: ${error.message}`,
          variant: "destructive"
        });
      }
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

  // NEW METHODS FOR DATA PROTECTION AND VERSIONING

  const forceOverwriteData = async () => {
    if (!user) return;

    setIsCloudSaving(true);
    setShowDataProtectionDialog(false);
    
    try {
      console.log('🚨 User confirmed force overwrite...');
      
      const result = await CloudDataService.forceOverwriteUserData(
        characters,
        moneyMethods,
        purchaseGoals,
        bankData,
        hoursPerDay
      );
      
      toast({
        title: "🚨 Force Save Completed",
        description: "Data has been forcefully saved. Previous data was backed up automatically.",
        duration: 8000
      });
    } catch (error) {
      console.error('Force overwrite failed:', error);
      toast({
        title: "Force Save Failed",
        description: `Failed to force save: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCloudSaving(false);
    }
  };

  const loadSnapshots = async () => {
    if (!user) return;

    setLoadingSnapshots(true);
    try {
      console.log('📜 Loading available snapshots...');
      const snapshotList = await CloudDataService.listSnapshots();
      setSnapshots(snapshotList);
      console.log('📜 Loaded snapshots:', snapshotList);
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      
      // Show helpful message if versioning system isn't set up
      if (error.message?.includes('MIGRATION_REQUIRED') || 
          error.message?.includes('versioning system') || 
          error.message?.includes('migration')) {
        toast({
          title: "📋 Database Migration Required",
          description: "The data protection system needs to be set up. Please check the MIGRATION_INSTRUCTIONS.md file or run the SQL script in your Supabase dashboard.",
          duration: 12000
        });
      } else {
        toast({
          title: "Failed to Load Versions",
          description: `Could not load version history: ${error.message}`,
          variant: "destructive"
        });
      }
    } finally {
      setLoadingSnapshots(false);
    }
  };

  const restoreFromSnapshot = async (snapshotId: string) => {
    if (!user) return;

    setRestoringSnapshot(true);
    try {
      console.log('🔄 Restoring from snapshot:', snapshotId);
      const restoredData = await CloudDataService.restoreFromSnapshot(snapshotId);
      
      // Update app state with restored data
      setAllData({
        characters: restoredData.characters || [],
        moneyMethods: restoredData.moneyMethods || [],
        purchaseGoals: restoredData.purchaseGoals || [],
        bankData: restoredData.bankData || {},
        hoursPerDay: restoredData.hoursPerDay || 10
      });

      setShowVersionDialog(false);
      
      // Count restored items for feedback
      const totalBankItems = Object.values(restoredData.bankData || {}).flat().length;
      
      toast({
        title: "✅ Data Restored Successfully!",
        description: `Restored ${restoredData.characters?.length || 0} characters and ${totalBankItems} bank items from backup`,
        duration: 8000
      });
    } catch (error) {
      console.error('Restore failed:', error);
      toast({
        title: "Restore Failed",
        description: `Failed to restore data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setRestoringSnapshot(false);
    }
  };

  const createManualSnapshot = async () => {
    if (!user) return;

    setCreatingSnapshot(true);
    try {
      console.log('📸 Creating manual snapshot...');
      const snapshot = await CloudDataService.createManualSnapshot();
      
      toast({
        title: "📸 Snapshot Created",
        description: "Manual backup created successfully. You can restore from this backup anytime.",
        duration: 5000
      });
      
      // Refresh snapshots list if dialog is open
      if (showVersionDialog) {
        await loadSnapshots();
      }
    } catch (error) {
      console.error('Manual snapshot failed:', error);
      
      // Show helpful message if versioning system isn't set up
      if (error.message?.includes('MIGRATION_REQUIRED') || 
          error.message?.includes('versioning system') || 
          error.message?.includes('migration')) {
        toast({
          title: "📋 Database Migration Required",
          description: "The data protection system needs to be set up first. Please check the MIGRATION_INSTRUCTIONS.md file or run the SQL script in your Supabase dashboard.",
          duration: 12000
        });
      } else {
        toast({
          title: "Snapshot Failed",
          description: `Failed to create backup: ${error.message}`,
          variant: "destructive"
        });
      }
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const openVersionDialog = async () => {
    setShowVersionDialog(true);
    await loadSnapshots();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Migration SQL for easy copy-paste
  const migrationSQL = `-- Data Protection System Migration
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Create data snapshots table
CREATE TABLE IF NOT EXISTS public.data_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  snapshot_type text NOT NULL CHECK (snapshot_type IN ('manual', 'auto', 'chunked')),
  snapshot_data jsonb NOT NULL,
  data_summary jsonb,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, version_number)
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS data_snapshots_user_id_created_at_idx ON public.data_snapshots (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS data_snapshots_user_id_version_idx ON public.data_snapshots (user_id, version_number DESC);

-- Step 3: Enable RLS
ALTER TABLE public.data_snapshots ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "Users can view own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can view own snapshots" ON public.data_snapshots FOR SELECT USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can create own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can create own snapshots" ON public.data_snapshots FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can update own snapshots" ON public.data_snapshots FOR UPDATE USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can delete own snapshots" ON public.data_snapshots FOR DELETE USING ((select auth.uid()) = user_id);

-- Step 5: Create snapshot function
CREATE OR REPLACE FUNCTION public.create_data_snapshot_before_save(target_user_id uuid, snapshot_type text DEFAULT 'auto') RETURNS uuid AS $$
DECLARE snapshot_id uuid; next_version integer; current_data jsonb; summary_data jsonb; total_bank_items integer; total_characters integer; total_methods integer; total_goals integer;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version FROM public.data_snapshots WHERE user_id = target_user_id;
  WITH char_data AS (SELECT jsonb_agg(jsonb_build_object('id', id, 'name', name, 'type', type, 'combatLevel', combat_level, 'totalLevel', total_level, 'bank', bank, 'notes', notes, 'isActive', COALESCE(is_active, true), 'platTokens', COALESCE(plat_tokens, 0))) as data FROM public.characters WHERE user_id = target_user_id), method_data AS (SELECT jsonb_agg(jsonb_build_object('id', id, 'name', name, 'character', character, 'gpHour', gp_hour, 'clickIntensity', click_intensity, 'requirements', requirements, 'notes', notes, 'category', category, 'isActive', COALESCE(is_active, true), 'membership', CASE WHEN COALESCE(is_member, false) THEN 'p2p' ELSE 'f2p' END)) as data FROM public.money_methods WHERE user_id = target_user_id), goal_data AS (SELECT jsonb_agg(jsonb_build_object('id', id, 'name', name, 'currentPrice', current_price, 'targetPrice', target_price, 'quantity', quantity, 'priority', priority, 'category', category, 'notes', notes, 'imageUrl', image_url)) as data FROM public.purchase_goals WHERE user_id = target_user_id), bank_data AS (SELECT jsonb_object_agg(character, character_items) as data FROM (SELECT character, jsonb_agg(jsonb_build_object('id', id, 'name', name, 'quantity', quantity, 'estimatedPrice', estimated_price, 'category', category, 'character', character)) as character_items FROM public.bank_items WHERE user_id = target_user_id GROUP BY character) grouped_items), settings_data AS (SELECT hours_per_day FROM public.user_settings WHERE user_id = target_user_id LIMIT 1)
  SELECT jsonb_build_object('characters', COALESCE(char_data.data, '[]'::jsonb), 'moneyMethods', COALESCE(method_data.data, '[]'::jsonb), 'purchaseGoals', COALESCE(goal_data.data, '[]'::jsonb), 'bankData', COALESCE(bank_data.data, '{}'::jsonb), 'hoursPerDay', COALESCE(settings_data.hours_per_day, 10)) INTO current_data FROM char_data, method_data, goal_data, bank_data, settings_data;
  SELECT COUNT(*) INTO total_characters FROM public.characters WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO total_methods FROM public.money_methods WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO total_goals FROM public.purchase_goals WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO total_bank_items FROM public.bank_items WHERE user_id = target_user_id;
  SELECT jsonb_build_object('totalCharacters', total_characters, 'totalMethods', total_methods, 'totalGoals', total_goals, 'totalBankItems', total_bank_items, 'snapshotType', snapshot_type, 'hasData', (total_characters > 0 OR total_methods > 0 OR total_goals > 0 OR total_bank_items > 0)) INTO summary_data;
  IF (current_data->>'characters' != '[]' OR current_data->>'moneyMethods' != '[]' OR current_data->>'purchaseGoals' != '[]' OR current_data->>'bankData' != '{}') THEN
    INSERT INTO public.data_snapshots (user_id, version_number, snapshot_type, snapshot_data, data_summary) VALUES (target_user_id, next_version, snapshot_type, current_data, summary_data) RETURNING id INTO snapshot_id;
    DELETE FROM public.data_snapshots WHERE user_id = target_user_id AND version_number < (next_version - 20);
    RETURN snapshot_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create restore function
CREATE OR REPLACE FUNCTION public.restore_from_snapshot(snapshot_id uuid) RETURNS jsonb AS $$
DECLARE snapshot_record record;
BEGIN
  SELECT * INTO snapshot_record FROM public.data_snapshots WHERE id = snapshot_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Snapshot not found or access denied'; END IF;
  RETURN snapshot_record.snapshot_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

  const copyMigrationSQL = async () => {
    try {
      await navigator.clipboard.writeText(migrationSQL);
      toast({
        title: "📋 Migration SQL Copied!",
        description: "Paste this into your Supabase SQL Editor and click Run.",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the SQL from the dialog.",
        variant: "destructive"
      });
    }
  };

  const verifyMigration = async () => {
    if (!user) return;

    setVerifyingMigration(true);
    try {
      console.log('🔍 Verifying migration...');
      const status = await CloudDataService.verifyMigration();
      setMigrationStatus(status);
      
      if (status.canCreateSnapshot) {
        toast({
          title: "✅ Migration Successful!",
          description: "Data protection system is ready. You can now use version history and create backups.",
          duration: 8000
        });
      } else {
        toast({
          title: "❌ Migration Incomplete",
          description: `Issues found: ${status.errors.join(', ')}. Please check the migration script.`,
          variant: "destructive",
          duration: 10000
        });
      }
    } catch (error) {
      console.error('Migration verification failed:', error);
      toast({
        title: "Verification Failed",
        description: `Could not verify migration: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setVerifyingMigration(false);
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

        {/* NEW VERSIONING AND PROTECTION SECTION */}
        <Separator />
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Data Protection & Version Management
          </h4>
          
          {/* Migration Required Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-amber-800">📋 Database Migration Required</h5>
                <p className="text-xs text-amber-700 mt-1">
                  To enable data protection and version history, run the migration script in your Supabase dashboard.
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button 
                    size="sm"
                    onClick={async () => {
                      try {
                        setVerifyingMigration(true);
                        console.log('🧪 Testing Edge Function...');
                        const result = await CloudDataService.testEdgeFunction();
                        console.log('Test result:', result);
                        toast({
                          title: "✅ Edge Function Test Successful",
                          description: `Connected! ${result.message}`,
                          duration: 3000,
                        });
                      } catch (error) {
                        console.error('Test failed:', error);
                        toast({
                          title: "❌ Edge Function Test Failed",
                          description: `Error: ${error.message}`,
                          variant: "destructive",
                          duration: 5000,
                        });
                      } finally {
                        setVerifyingMigration(false);
                      }
                    }}
                    disabled={verifyingMigration}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    {verifyingMigration ? "🧪 Testing..." : "🧪 Test Function"}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={verifyMigration}
                    disabled={verifyingMigration}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    {verifyingMigration ? "🔍 Checking..." : "🔍 Verify Migration"}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowMigrationDialog(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    📋 Get Migration SQL
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={copyMigrationSQL}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                  >
                    📋 Copy SQL
                  </Button>
                </div>
                
                {/* Migration Status Display */}
                {migrationStatus && (
                  <div className={`mt-2 p-2 rounded text-xs ${
                    migrationStatus.canCreateSnapshot 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="font-medium mb-1">
                      {migrationStatus.canCreateSnapshot ? '✅ Migration Status: Complete' : '❌ Migration Status: Incomplete'}
                    </div>
                    <div className="space-y-1">
                      <div>📋 Table exists: {migrationStatus.tableExists ? '✅' : '❌'}</div>
                      <div>⚙️ Function exists: {migrationStatus.functionExists ? '✅' : '❌'}</div>
                      <div>🔧 Can create snapshots: {migrationStatus.canCreateSnapshot ? '✅' : '❌'}</div>
                      {migrationStatus.errors.length > 0 && (
                        <div className="mt-1">
                          <div className="font-medium">Errors:</div>
                          {migrationStatus.errors.map((error, i) => (
                            <div key={i} className="text-xs opacity-80">• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={openVersionDialog}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <History className="h-4 w-4 mr-2" />
              Version History
            </Button>

            <Button 
              onClick={createManualSnapshot}
              disabled={creatingSnapshot}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Database className="h-4 w-4 mr-2" />
              {creatingSnapshot ? "Creating..." : "Create Backup"}
            </Button>
          </div>
          
          <p className="text-xs text-gray-600">
            🛡️ Data Protection: Prevents accidental data loss | 📜 Version History: Restore from previous saves | 📸 Create Backup: Manual snapshots
          </p>
        </div>

        {/* DATA PROTECTION CONFIRMATION DIALOG */}
        <AlertDialog open={showDataProtectionDialog} onOpenChange={setShowDataProtectionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                🛡️ Data Protection Warning
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 font-medium">⚠️ You are about to save empty data!</p>
                  <p className="text-red-700 text-sm mt-1">
                    This action would erase all your existing characters, money methods, goals, and bank items.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-blue-800 font-medium">✅ Your data is protected!</p>
                  <p className="text-blue-700 text-sm mt-1">
                    A backup has been automatically created before this operation. You can restore it anytime.
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-700 font-medium">What would you like to do?</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• <strong>Cancel:</strong> Keep your existing data safe (recommended)</li>
                    <li>• <strong>Load from Version History:</strong> Restore from a previous backup</li>
                    <li>• <strong>Force Save:</strong> Proceed with clearing all data (⚠️ not recommended)</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={() => setShowDataProtectionDialog(false)}>
                ✅ Cancel (Keep Data Safe)
              </AlertDialogCancel>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDataProtectionDialog(false);
                  openVersionDialog();
                }}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <History className="h-4 w-4 mr-2" />
                Load from History
              </Button>
              <AlertDialogAction 
                onClick={forceOverwriteData}
                className="bg-red-600 hover:bg-red-700"
              >
                🚨 Force Save (Clear All Data)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* VERSION HISTORY DIALOG */}
        <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                📜 Version History & Data Recovery
              </DialogTitle>
              <DialogDescription>
                Choose a previous version to restore. Your data is automatically backed up before each save.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-96">
              {loadingSnapshots ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Loading versions...</span>
                </div>
              ) : snapshots.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No backup versions found.</p>
                  <p className="text-sm">Backups are created automatically when you save data.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {snapshots.map((snapshot, index) => (
                    <div key={snapshot.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Version {snapshot.version_number}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              snapshot.snapshot_type === 'manual' ? 'bg-green-100 text-green-700' :
                              snapshot.snapshot_type === 'auto' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {snapshot.snapshot_type === 'manual' ? '📸 Manual' : 
                               snapshot.snapshot_type === 'auto' ? '🔄 Auto' : '📦 Chunked'}
                            </span>
                            {index === 0 && (
                              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">Latest</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatDate(snapshot.created_at)}
                          </div>
                          {snapshot.data_summary && (
                            <div className="text-xs text-gray-500 mt-1">
                              {snapshot.data_summary.totalCharacters || 0} characters, {' '}
                              {snapshot.data_summary.totalMethods || 0} methods, {' '}
                              {snapshot.data_summary.totalGoals || 0} goals, {' '}
                              {snapshot.data_summary.totalBankItems || 0} bank items
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => restoreFromSnapshot(snapshot.id)}
                          disabled={restoringSnapshot}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {restoringSnapshot ? "Restoring..." : "Restore"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
                Close
              </Button>
              <Button onClick={createManualSnapshot} disabled={creatingSnapshot}>
                <Database className="h-4 w-4 mr-2" />
                {creatingSnapshot ? "Creating..." : "Create New Backup"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MIGRATION SQL DIALOG */}
        <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                📋 Database Migration SQL
              </DialogTitle>
              <DialogDescription>
                Copy this SQL script and paste it into your Supabase SQL Editor, then click "Run".
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">🚀 Quick Setup Steps:</h4>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Go to your <a href="https://supabase.com/dashboard/project/hulnpsulovzyqcmroxir" target="_blank" className="underline">Supabase Dashboard</a></li>
                  <li>2. Click "SQL Editor" in the left sidebar</li>
                  <li>3. Copy the SQL below and paste it in the editor</li>
                  <li>4. Click "Run" to execute the migration</li>
                  <li>5. Refresh this app to use the new features</li>
                </ol>
              </div>
              
              <div className="relative">
                <ScrollArea className="h-96 w-full rounded border bg-gray-50">
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                    {migrationSQL}
                  </pre>
                </ScrollArea>
                <Button 
                  onClick={copyMigrationSQL}
                  className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  📋 Copy All
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMigrationDialog(false)}>
                Close
              </Button>
              <Button onClick={copyMigrationSQL} className="bg-blue-600 hover:bg-blue-700 text-white">
                📋 Copy SQL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
