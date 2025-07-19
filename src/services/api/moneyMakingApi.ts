
import { MoneyMakingGuide } from './types';
import { osrsWikiApi } from '../osrsWikiApi';

export const moneyMakingApi = {
  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    // Fix: Await the promise before calling map
    const methods = await osrsWikiApi.searchMoneyMakingMethods(query);
    return methods.map(method => ({
      id: method.name.toLowerCase().replace(/\s+/g, '-'),
      name: method.name,
      profit: method.hourlyProfit,
      skill: method.category === 'skilling' ? 'Various' : 'Combat',
      requirements: method.requirements,
      description: method.description || '',
      category: method.category,
      difficulty: method.intensity,
      membership: method.members ? "p2p" : "f2p"
    }));
  },

  async getDefaultMoneyMakers(): Promise<MoneyMakingGuide[]> {
    // Fix: Await the promise before calling map
    const methods = await osrsWikiApi.getMoneyMakingMethods();
    return methods.map(method => ({
      id: method.name.toLowerCase().replace(/\s+/g, '-'),
      name: method.name,
      profit: method.hourlyProfit,
      skill: method.category === 'skilling' ? 'Various' : 'Combat',
      requirements: method.requirements,
      description: method.description || '',
      category: method.category,
      difficulty: method.intensity,
      membership: method.members ? "p2p" : "f2p"
    }));
  }
};
