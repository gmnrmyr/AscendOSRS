import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: string;
  character: string;
}

interface BankPriceUpdaterProps {
  bankData: Record<string, BankItem[]>;
  setBankData: (data: Record<string, BankItem[]>) => void;
}

export function BankPriceUpdater({ bankData, setBankData }: BankPriceUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateAllPrices = async () => {
    setIsUpdating(true);
    
    try {
      // Load the price lookup data
      const response = await fetch('/item_prices.json');
      const priceMap = await response.json();
      
      let totalUpdated = 0;
      const updatedBankData = { ...bankData };
      
      // Update all bank items with prices from the lookup
      for (const [character, items] of Object.entries(bankData)) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemNameLower = item.name.toLowerCase().trim();
          
          // Skip if item already has a price
          if (item.estimatedPrice > 0) continue;
          
          // Look for exact match first
          let newPrice = priceMap[itemNameLower];
          
          // If no exact match, try fuzzy matching
          if (!newPrice) {
            for (const [mapName, mapPrice] of Object.entries(priceMap)) {
              if (mapName.includes(itemNameLower) || itemNameLower.includes(mapName)) {
                newPrice = mapPrice;
                break;
              }
            }
          }
          
          if (newPrice && newPrice > 0) {
            updatedBankData[character][i] = { 
              ...item, 
              estimatedPrice: newPrice as number 
            };
            totalUpdated++;
            console.log(`Updated ${item.name}: ${newPrice.toLocaleString()} GP`);
          }
        }
      }
      
      setBankData(updatedBankData);
      
      toast({
        title: "Prices Updated",
        description: `Updated ${totalUpdated} items with current market prices`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: "Update Failed",
        description: "Could not load price data. Make sure to run the price fix script first.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={updateAllPrices} 
      disabled={isUpdating}
      className="w-full mb-4"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
      {isUpdating ? 'Updating Prices...' : 'Update All Item Prices'}
    </Button>
  );
} 