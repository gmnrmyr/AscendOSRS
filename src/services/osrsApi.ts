
// Re-export all types and APIs from the modular structure
export * from './api/types';
export { itemsApi } from './api/itemsApi';
export { bankApi } from './api/bankApi';
export { moneyMakingApi } from './api/moneyMakingApi';
export { playerApi } from './api/playerApi';

// Legacy API object for backward compatibility
import { itemsApi } from './api/itemsApi';
import { bankApi } from './api/bankApi';
import { moneyMakingApi } from './api/moneyMakingApi';
import { playerApi } from './api/playerApi';

export const osrsApi = {
  // Items API
  getItemPrice: itemsApi.getItemPrice.bind(itemsApi),
  getMultipleItemPrices: itemsApi.getMultipleItemPrices.bind(itemsApi),
  getEstimatedItemValue: itemsApi.getEstimatedItemValue.bind(itemsApi),
  fetchPopularItems: itemsApi.fetchPopularItems.bind(itemsApi),
  searchItems: itemsApi.searchItems.bind(itemsApi),
  getItemIdByName: itemsApi.getItemIdByName.bind(itemsApi),
  fetchSingleItemPrice: itemsApi.fetchSingleItemPrice.bind(itemsApi),
  getItemIcon: itemsApi.getItemIcon.bind(itemsApi),

  // Bank API
  parseBankCSV: bankApi.parseBankCSV.bind(bankApi),

  // Money Making API
  searchMoneyMakers: moneyMakingApi.searchMoneyMakers.bind(moneyMakingApi),
  getDefaultMoneyMakers: moneyMakingApi.getDefaultMoneyMakers.bind(moneyMakingApi),

  // Player API
  fetchPlayerStats: playerApi.fetchPlayerStats.bind(playerApi)
};

export default osrsApi;
