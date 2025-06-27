
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { osrsApi } from "@/services/osrsApi";
import { Character } from "@/hooks/useAppData";

interface CharacterRefreshButtonProps {
  character: Character;
  onRefresh: (updatedCharacter: Character) => void;
}

export function CharacterRefreshButton({ character, onRefresh }: CharacterRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (!character.name) {
      toast({
        title: "Error",
        description: "Character name is required to refresh stats",
        variant: "destructive"
      });
      return;
    }

    setIsRefreshing(true);
    try {
      const stats = await osrsApi.fetchPlayerStats(character.name);
      if (stats) {
        const updatedCharacter = {
          ...character,
          combatLevel: stats.combat_level,
          totalLevel: stats.total_level,
          type: stats.account_type === 'ironman' ? 'ironman' as const : 
                stats.account_type === 'hardcore' ? 'hardcore' as const :
                stats.account_type === 'ultimate' ? 'ultimate' as const : character.type
        };
        
        onRefresh(updatedCharacter);
        toast({
          title: "Character Refreshed",
          description: `Updated stats for ${character.name}`
        });
      } else {
        toast({
          title: "Refresh Failed",
          description: `Could not find stats for ${character.name}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error refreshing character:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh character stats",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
}
