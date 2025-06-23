
import { BankItem } from './types';
import { itemsApi } from './itemsApi';

export const bankApi = {
  parseBankCSV(csvText: string): BankItem[] {
    try {
      // Try to parse as JSON first (Data Exporter format)
      const jsonData = JSON.parse(csvText);
      if (Array.isArray(jsonData)) {
        return jsonData.map(item => ({
          name: item.name,
          quantity: item.quantity,
          value: itemsApi.getEstimatedItemValue(item.name) * item.quantity
        }));
      }
    } catch (e) {
      // If JSON parsing fails, try CSV parsing
      const lines = csvText.trim().split('\n');
      const items: BankItem[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
          const name = parts[0].replace(/"/g, '').trim();
          const quantity = parseInt(parts[1]) || 0;
          const value = parseInt(parts[2]) || 0;
          
          if (name && quantity > 0) {
            items.push({ name, quantity, value });
          }
        }
      }
      
      return items;
    }
    
    return [];
  }
};
