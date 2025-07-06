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
      console.log('Current character state:', character);
      
      const playerStats = await osrsApi.fetchPlayerStats(character.name);
      console.log('Raw API response:', playerStats);
      
      if (playerStats) {
        // Validate the API response values
        const combatLevel = Math.max(3, Math.min(126, parseInt(playerStats.combat_level) || 3));
        const totalLevel = Math.max(32, Math.min(2277, parseInt(playerStats.total_level) || 32));
        
        console.log('Validated levels:', { combatLevel, totalLevel });
        console.log('Original API values:', { 
          combat_level: playerStats.combat_level, 
          total_level: playerStats.total_level 
        });
        
        // Additional safety check
        if (combatLevel < 3 || combatLevel > 126 || totalLevel < 32 || totalLevel > 2277) {
          console.error('Invalid levels detected after validation:', { combatLevel, totalLevel });
          toast({
            title: "Invalid Data",
            description: `API returned invalid levels: Combat ${combatLevel}, Total ${totalLevel}`,
            variant: "destructive"
          });
          return;
        }
        
        let accountType = character.type;
        
        // Map account type from API response more accurately
        if (playerStats.account_type) {
          const apiType = playerStats.account_type.toLowerCase();
          if (apiType.includes('ultimate')) {
            accountType = 'ultimate';
          } else if (apiType.includes('hardcore')) {
            accountType = 'hardcore';
          } else if (apiType.includes('ironman')) {
            accountType = 'ironman';
          } else if (apiType === 'main' || apiType === 'regular') {
            accountType = 'main';
          }
        }
        
        const updatedCharacter = {
          ...character,
          combatLevel: combatLevel,
          totalLevel: totalLevel,
          type: accountType
        };
        
        console.log('Final updated character:', updatedCharacter);
        
        onUpdate(updatedCharacter);
        
        // Show detailed success message
        const accountTypeText = accountType === 'main' ? 'Main' : 
                               accountType === 'ironman' ? 'Ironman' :
                               accountType === 'hardcore' ? 'Hardcore Ironman' :
                               accountType === 'ultimate' ? 'Ultimate Ironman' : 'Unknown';
        
        toast({
          title: "Stats Updated Successfully",
          description: `${character.name} (${accountTypeText}): Combat Level ${combatLevel}, Total Level ${totalLevel}`,
        });
        
        console.log('Character stats updated successfully');
      } else {
        // Enhanced error message with suggestions
        toast({
          title: "Refresh Failed",
          description: `Could not find stats for "${character.name}". Please check:\n• Username spelling\n• Account privacy settings\n• Try again in a few moments`,
          variant: "destructive"
        });
        
        console.warn(`Failed to fetch stats for ${character.name}`);
      }
    } catch (error) {
      console.error('Error refreshing character stats:', error);
      
      toast({
        title: "Network Error",
        description: "Failed to connect to OSRS hiscores. Please check your internet connection and try again.",
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
