
import { PlayerStats } from './types';

export const playerApi = {
  async fetchPlayerStats(username: string): Promise<PlayerStats | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      total: 1500,
      attack: 80,
      defence: 75,
      strength: 85,
      hitpoints: 82,
      ranged: 78,
      prayer: 70,
      magic: 76,
      cooking: 85,
      woodcutting: 90,
      fletching: 75,
      fishing: 88,
      firemaking: 80,
      crafting: 72,
      smithing: 70,
      mining: 85,
      herblore: 68,
      agility: 75,
      thieving: 70,
      slayer: 82,
      farming: 78,
      runecraft: 65,
      hunter: 70,
      construction: 75,
      combat_level: 126,
      total_level: 1500,
      account_type: 'regular',
      name: username
    };
  }
};
