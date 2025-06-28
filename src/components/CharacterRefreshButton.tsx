
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
        let accountType = character.type;
        
        // Map account type from API response
        if (playerStats.account_type) {
          const apiType = playerStats.account_type.toLowerCase();
          if (apiType.includes('ironman')) {
            accountType = 'ironman';
          } else if (apiType.includes('hardcore')) {
            accountType = 'hardcore';
          } else if (apiType.includes('ultimate')) {
            accountType = 'ultimate';
          }
        }
        
        const updatedCharacter = {
          ...character,
          combatLevel: playerStats.combat_level,
          totalLevel: playerStats.total_level,
          type: accountType
        };
        
        onUpdate(updatedCharacter);
        
        toast({
          title: "Stats Updated",
          description: `${character.name}'s stats refreshed: CB ${playerStats.combat_level}, Total ${playerStats.total_level}`,
        });
        
        console.log('Character stats updated successfully:', updatedCharacter);
      } else {
        toast({
          title: "Refresh Failed",
          description: `Could not find stats for "${character.name}". Check the spelling or try again later.`,
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
      className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
    </Button>
  );
}
