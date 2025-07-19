import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
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
  onUpdate: (character: Character) => void;
}

// Enhanced username validation for OSRS names
const validateOSRSUsername = (username: string): { isValid: boolean; message?: string } => {
  if (!username || username.trim().length === 0) {
    return { isValid: false, message: "Username cannot be empty" };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < 1 || trimmed.length > 12) {
    return { isValid: false, message: "OSRS usernames must be 1-12 characters long" };
  }
  
  // OSRS username rules: only letters, numbers, spaces, hyphens, underscores
  const validChars = /^[a-zA-Z0-9 _-]+$/;
  if (!validChars.test(trimmed)) {
    return { isValid: false, message: "Username contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores are allowed." };
  }
  
  // No leading/trailing spaces (though we trim anyway)
  if (trimmed !== username) {
    return { isValid: false, message: "Username cannot have leading or trailing spaces" };
  }
  
  return { isValid: true };
};

// Enhanced error classification for better user feedback
const classifyRefreshError = (character: Character, error: any): { title: string; description: string; suggestions: string[] } => {
  const username = character.name;
  
  // Network/API errors
  if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('fetch')) {
    return {
      title: "🌐 Network Connection Issue",
      description: "Unable to connect to OSRS servers",
      suggestions: [
        "Check your internet connection",
        "Try again in a few moments",
        "OSRS servers might be experiencing issues"
      ]
    };
  }
  
  // Rate limiting
  if (error?.message?.toLowerCase().includes('rate') || error?.message?.toLowerCase().includes('429')) {
    return {
      title: "⏱️ Too Many Requests",
      description: "OSRS API rate limit exceeded",
      suggestions: [
        "Wait 30-60 seconds before trying again",
        "Avoid refreshing multiple characters rapidly"
      ]
    };
  }
  
  // Player not found scenarios
  if (error?.message?.toLowerCase().includes('not found') || error?.message?.toLowerCase().includes('404')) {
    return {
      title: "👤 Player Not Found",
      description: `"${username}" was not found on OSRS hiscores`,
      suggestions: [
        "Check username spelling and capitalization",
        "Ensure the player has logged in recently",
        "Some accounts may be private or not on hiscores",
        "F2P accounts might not appear on some hiscore tables"
      ]
    };
  }
  
  // Private/hidden accounts
  if (error?.message?.toLowerCase().includes('private') || error?.message?.toLowerCase().includes('hidden')) {
    return {
      title: "🔒 Private Account",
      description: `"${username}" has privacy settings enabled`,
      suggestions: [
        "Player may have hiscores hidden in game settings",
        "Ask the player to check their privacy settings",
        "Some stats may be visible on different hiscore tables"
      ]
    };
  }
  
  // Invalid data returned
  if (error?.message?.toLowerCase().includes('invalid') || error?.message?.toLowerCase().includes('malformed')) {
    return {
      title: "🔧 Data Format Issue",
      description: "Received unexpected data from OSRS API",
      suggestions: [
        "This is likely a temporary server issue",
        "Try again in a few minutes",
        "Different APIs may work better for this account"
      ]
    };
  }
  
  // Generic fallback
  return {
    title: "❌ Refresh Failed",
    description: `Unable to update stats for "${username}"`,
    suggestions: [
      "Double-check the username spelling",
      "Ensure the player has logged in recently",
      "Try again in a few moments",
      "The account may be private or inactive"
    ]
  };
};

export function CharacterRefreshButton({ character, onUpdate }: CharacterRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshCharacterStats = async () => {
    // Enhanced username validation
    const validation = validateOSRSUsername(character.name);
    if (!validation.isValid) {
      toast({
        title: "⚠️ Invalid Username",
        description: validation.message,
        variant: "destructive",
        duration: 6000
      });
      return;
    }

    setIsRefreshing(true);
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Refreshing stats for character: ${character.name}`);
      console.log('📊 Current character state:', character);
      
      // Show initial loading feedback
      toast({
        title: "🔍 Fetching Character Data",
        description: `Looking up "${character.name}" on OSRS hiscores...`,
        duration: 3000
      });
      
      const playerStats = await osrsApi.fetchPlayerStats(character.name.trim());
      const fetchTime = Date.now() - startTime;
      
      console.log(`📡 API response received in ${fetchTime}ms:`, playerStats);
      
      if (playerStats) {
        // Enhanced validation with detailed logging
        const combatLevel = Math.max(3, Math.min(126, parseInt(playerStats.combat_level) || 3));
        const totalLevel = Math.max(32, Math.min(2277, parseInt(playerStats.total_level) || 32));
        
        console.log('✅ Validated levels:', { 
          original: { combat: playerStats.combat_level, total: playerStats.total_level },
          validated: { combatLevel, totalLevel }
        });
        
        // Enhanced account type detection
        let accountType = character.type;
        const oldAccountType = accountType;
        
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
        
        // Final safety check with detailed error info
        if (combatLevel < 3 || combatLevel > 126 || totalLevel < 32 || totalLevel > 2277) {
          console.error('❌ Invalid levels detected:', {
            combatLevel, totalLevel,
            originalAPI: playerStats,
            character: character.name
          });
          
          toast({
            title: "🔧 Invalid Data Detected",
            description: `API returned invalid levels: Combat ${combatLevel}, Total ${totalLevel}. This might be a temporary server issue.`,
            variant: "destructive",
            duration: 8000
          });
          return;
        }
        
        const updatedCharacter = {
          ...character,
          combatLevel: combatLevel,
          totalLevel: totalLevel,
          type: accountType
        };
        
        console.log('✅ Final updated character:', updatedCharacter);
        
        onUpdate(updatedCharacter);
        
        // Enhanced success message with more details
        const accountTypeText = accountType === 'main' ? 'Main Account' : 
                               accountType === 'ironman' ? 'Ironman' :
                               accountType === 'hardcore' ? 'Hardcore Ironman' :
                               accountType === 'ultimate' ? 'Ultimate Ironman' : 'Unknown';
        
        const levelChanges = [];
        if (combatLevel !== character.combatLevel) {
          levelChanges.push(`Combat: ${character.combatLevel} → ${combatLevel}`);
        }
        if (totalLevel !== character.totalLevel) {
          levelChanges.push(`Total: ${character.totalLevel} → ${totalLevel}`);
        }
        if (accountType !== oldAccountType) {
          levelChanges.push(`Type: ${oldAccountType} → ${accountType}`);
        }
        
        const changesText = levelChanges.length > 0 ? 
          `\n📈 Changes: ${levelChanges.join(', ')}` : 
          '\n✨ Stats confirmed (no changes)';
        
        toast({
          title: "✅ Character Updated Successfully!",
          description: `${character.name} (${accountTypeText})\n⚔️ Combat Level: ${combatLevel}\n📊 Total Level: ${totalLevel}${changesText}\n⚡ Fetched in ${fetchTime}ms`,
          duration: 6000
        });
        
        console.log('🎉 Character stats updated successfully');
      } else {
        // Enhanced "not found" error with helpful suggestions
        toast({
          title: "👤 Player Not Found",
          description: `Could not find "${character.name}" on OSRS hiscores.\n\n💡 Suggestions:\n• Check username spelling\n• Player may need to log in recently\n• Account might be private\n• F2P accounts may not appear on all tables`,
          variant: "destructive",
          duration: 10000
        });
        
        console.warn(`⚠️ Failed to fetch stats for ${character.name} - player not found`);
      }
    } catch (error) {
      console.error('💥 Error refreshing character stats:', error);
      
      // Use enhanced error classification
      const errorInfo = classifyRefreshError(character, error);
      
      toast({
        title: errorInfo.title,
        description: `${errorInfo.description}\n\n💡 Try this:\n${errorInfo.suggestions.map(s => `• ${s}`).join('\n')}`,
        variant: "destructive",
        duration: 12000
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
