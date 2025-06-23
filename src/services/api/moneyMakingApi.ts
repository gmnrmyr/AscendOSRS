
import { MoneyMakingGuide } from './types';

const MONEY_MAKERS: MoneyMakingGuide[] = [
  {
    id: "fishing-sharks",
    name: "Fishing Sharks",
    profit: 180000,
    skill: "Fishing",
    requirements: ["75 Fishing"],
    description: "Fish sharks at fishing guild",
    category: "skilling",
    difficulty: 2,
    membership: "p2p"
  },
  {
    id: "runecrafting-nature",
    name: "Nature Rune Crafting",
    profit: 500000,
    skill: "Runecrafting",
    requirements: ["44 Runecrafting"],
    description: "Craft nature runes through abyss",
    category: "skilling",
    difficulty: 4,
    membership: "p2p"
  }
];

export const moneyMakingApi = {
  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    return MONEY_MAKERS.filter(method =>
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.skill.toLowerCase().includes(query.toLowerCase())
    );
  },

  async getDefaultMoneyMakers(): Promise<MoneyMakingGuide[]> {
    return MONEY_MAKERS;
  }
};
