
import { useState } from 'react';
import { osrsApi } from '@/services/osrsApi';
import { Character } from '@/hooks/useAppData';

export function useCharacterRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCharacter = async (character: Character): Promise<Character | null> => {
    if (!character.name) return null;
    
    setIsRefreshing(true);
    try {
      const stats = await osrsApi.fetchPlayerStats(character.name);
      if (stats) {
        return {
          ...character,
          combatLevel: stats.combat_level,
          totalLevel: stats.total_level,
          type: stats.account_type === 'ironman' ? 'ironman' : 
                stats.account_type === 'hardcore' ? 'hardcore' :
                stats.account_type === 'ultimate' ? 'ultimate' : character.type
        };
      }
      return character;
    } catch (error) {
      console.error('Error refreshing character:', error);
      return character;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refreshCharacter, isRefreshing };
}
