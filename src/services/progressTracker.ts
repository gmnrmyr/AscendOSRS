import { supabase } from '@/integrations/supabase/client';

export interface ProgressSnapshot {
  id: string;
  created_at: string;
  snapshot_data: {
    characters: Array<{
      id: string;
      name: string;
      bank: number;
      platTokens?: number;
      totalLevel: number;
      combatLevel: number;
    }>;
    bankData: Record<string, Array<{
      name: string;
      quantity: number;
      estimatedPrice: number;
    }>>;
    hoursPerDay: number;
  };
}

export interface WealthData {
  date: string;
  totalWealth: number;
  goldCoins: number;
  platTokens: number;
  bankValue: number;
  characterBreakdown: Array<{
    name: string;
    wealth: number;
    gold: number;
    platTokens: number;
    bankValue: number;
  }>;
}

export interface ProgressMetrics {
  totalGrowth: number;
  dailyAverage: number;
  weeklyAverage: number;
  bestDay: { date: string; growth: number };
  worstDay: { date: string; growth: number };
  bestCharacter: { name: string; growth: number };
  consistencyScore: number;
}

export class ProgressTracker {
  // Fetch user's snapshots from the existing data_snapshots table
  static async getUserSnapshots(): Promise<ProgressSnapshot[]> {
    try {
      // Use raw SQL query since data_snapshots might not be in the generated types yet
      const { data, error } = await supabase
        .rpc('get_user_snapshots_for_progress');

      if (error) {
        console.error('Error fetching snapshots:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        snapshot_data: item.snapshot_data
      }));
    } catch (error) {
      console.error('Error loading progress snapshots:', error);
      // Fallback: return empty array for now
      return [];
    }
  }

  // Convert snapshots to wealth timeline data
  static async getWealthHistory(): Promise<WealthData[]> {
    const snapshots = await this.getUserSnapshots();
    
    return snapshots.map(snapshot => {
      const data = snapshot.snapshot_data;
      
      // Calculate total wealth for each character
      const characterBreakdown = data.characters.map(char => {
        const bankItems = data.bankData[char.name] || [];
        const bankValue = bankItems.reduce((sum, item) => 
          sum + (item.quantity * item.estimatedPrice), 0
        );
        
        return {
          name: char.name,
          wealth: char.bank + (char.platTokens || 0) * 1000 + bankValue,
          gold: char.bank,
          platTokens: char.platTokens || 0,
          bankValue
        };
      });

      // Calculate totals
      const totals = characterBreakdown.reduce((acc, char) => ({
        totalWealth: acc.totalWealth + char.wealth,
        goldCoins: acc.goldCoins + char.gold,
        platTokens: acc.platTokens + char.platTokens,
        bankValue: acc.bankValue + char.bankValue
      }), { totalWealth: 0, goldCoins: 0, platTokens: 0, bankValue: 0 });

      return {
        date: new Date(snapshot.created_at).toISOString().split('T')[0],
        ...totals,
        characterBreakdown
      };
    });
  }

  // Calculate progress metrics
  static calculateMetrics(wealthHistory: WealthData[]): ProgressMetrics {
    if (wealthHistory.length < 2) {
      return {
        totalGrowth: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        bestDay: { date: '', growth: 0 },
        worstDay: { date: '', growth: 0 },
        bestCharacter: { name: '', growth: 0 },
        consistencyScore: 0
      };
    }

    // Calculate daily changes
    const dailyChanges: Array<{ date: string; growth: number }> = [];
    for (let i = 1; i < wealthHistory.length; i++) {
      const current = wealthHistory[i];
      const previous = wealthHistory[i - 1];
      const growth = current.totalWealth - previous.totalWealth;
      
      dailyChanges.push({
        date: current.date,
        growth
      });
    }

    // Calculate character growth
    const characterGrowth = new Map<string, number>();
    
    if (wealthHistory.length > 0) {
      const first = wealthHistory[0];
      const last = wealthHistory[wealthHistory.length - 1];
      
      // Match characters by name and calculate growth
      first.characterBreakdown.forEach(firstChar => {
        const lastChar = last.characterBreakdown.find(c => c.name === firstChar.name);
        if (lastChar) {
          const growth = lastChar.wealth - firstChar.wealth;
          characterGrowth.set(firstChar.name, growth);
        }
      });
    }

    const totalGrowth = wealthHistory[wealthHistory.length - 1].totalWealth - wealthHistory[0].totalWealth;
    const daysDiff = Math.max(1, dailyChanges.length);
    const weeksDiff = Math.max(1, daysDiff / 7);
    
    const bestDay = dailyChanges.reduce((best, day) => 
      day.growth > best.growth ? day : best, dailyChanges[0] || { date: '', growth: 0 }
    );
    
    const worstDay = dailyChanges.reduce((worst, day) => 
      day.growth < worst.growth ? day : worst, dailyChanges[0] || { date: '', growth: 0 }
    );

    const bestCharacter = Array.from(characterGrowth.entries())
      .reduce((best, [name, growth]) => 
        growth > best.growth ? { name, growth } : best, 
        { name: '', growth: 0 }
      );

    // Calculate consistency (lower standard deviation = higher consistency)
    const avgGrowth = dailyChanges.reduce((sum, day) => sum + day.growth, 0) / daysDiff;
    const variance = dailyChanges.reduce((sum, day) => sum + Math.pow(day.growth - avgGrowth, 2), 0) / daysDiff;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) / 1000000); // Scale consistency

    return {
      totalGrowth,
      dailyAverage: totalGrowth / daysDiff,
      weeklyAverage: totalGrowth / weeksDiff,
      bestDay,
      worstDay,
      bestCharacter,
      consistencyScore: Math.min(100, consistencyScore)
    };
  }

  // Get top performers by different metrics
  static getTopPerformers(wealthHistory: WealthData[]) {
    if (wealthHistory.length < 2) return { characters: [], timeframes: [] };

    const first = wealthHistory[0];
    const last = wealthHistory[wealthHistory.length - 1];
    
    // Character growth analysis
    const characterPerformance = first.characterBreakdown.map(firstChar => {
      const lastChar = last.characterBreakdown.find(c => c.name === firstChar.name);
      if (!lastChar) return null;

      const totalGrowth = lastChar.wealth - firstChar.wealth;
      const goldGrowth = lastChar.gold - firstChar.gold;
      const bankGrowth = lastChar.bankValue - firstChar.bankValue;
      const platGrowth = lastChar.platTokens - firstChar.platTokens;

      return {
        name: firstChar.name,
        totalGrowth,
        goldGrowth,
        bankGrowth,
        platGrowth,
        initialWealth: firstChar.wealth,
        currentWealth: lastChar.wealth,
        growthRate: firstChar.wealth > 0 ? (totalGrowth / firstChar.wealth) * 100 : 0
      };
    }).filter(Boolean);

    // Time-based performance (weekly/monthly if enough data)
    const timeframes = [];
    if (wealthHistory.length >= 7) {
      const weeklyData = wealthHistory.slice(-7);
      const weekGrowth = weeklyData[weeklyData.length - 1].totalWealth - weeklyData[0].totalWealth;
      timeframes.push({ period: 'Last 7 days', growth: weekGrowth });
    }
    
    if (wealthHistory.length >= 30) {
      const monthlyData = wealthHistory.slice(-30);
      const monthGrowth = monthlyData[monthlyData.length - 1].totalWealth - monthlyData[0].totalWealth;
      timeframes.push({ period: 'Last 30 days', growth: monthGrowth });
    }

    return {
      characters: characterPerformance.sort((a, b) => b!.totalGrowth - a!.totalGrowth),
      timeframes
    };
  }
}