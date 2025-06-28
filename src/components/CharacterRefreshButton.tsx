
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { osrsApi } from "@/services/osrsApi";

interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
  isActive: boolean;
}

interface CharacterRefreshButtonProps {
  character: Character;
  onUpdate: (updatedCharacter: Character) => void;
}

export function CharacterRefreshButton({ character, onUpdate }: CharacterRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshCharacterStats = async () => {
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
      console.log(`Refreshing stats for character: ${character.name}`);
      const playerStats = await osrsApi.fetchPlayerStats(character.name);
      
      if (playerStats) {
        const updatedCharacter = {
          ...character,
          combatLevel: playerStats.combat_level,
          totalLevel: playerStats.total_level
        };
        
        onUpdate(updatedCharacter);
        
        toast({
          title: "Stats Updated",
          description: `${character.name}'s stats have been refreshed from TempleOSRS/Hiscores`,
        });
      } else {
        toast({
          title: "Refresh Failed",
          description: `Could not find stats for "${character.name}". Check the name spelling or try again later.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error refreshing character stats:', error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh character stats. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={refreshCharacterStats}
      disabled={isRefreshing}
      size="sm"
      variant="outline"
      className="text-blue-600 border-blue-300 hover:bg-blue-50"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
    </Button>
  );
}
