import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ItemsMetadata {
  last_updated: string;
  total_items: number;
  items_with_prices: number;
  next_update: string;
}

export function useItemsRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metadata, setMetadata] = useState<ItemsMetadata | null>(null);
  const { toast } = useToast();

  const refreshItems = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/refresh-items', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh items');
      }

      const newMetadata = await response.json();
      setMetadata(newMetadata);
      
      toast({
        title: "Items Updated",
        description: `Successfully updated ${newMetadata.total_items} items`
      });
    } catch (error) {
      console.error('Error refreshing items:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update items. Will try again later.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load metadata and check if update is needed
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/osrs_items_metadata.json');
        if (!response.ok) {
          // If metadata doesn't exist, force an update
          refreshItems();
          return;
        }

        const currentMetadata = await response.json();
        setMetadata(currentMetadata);

        // Check if we need to update
        const nextUpdate = new Date(currentMetadata.next_update);
        if (nextUpdate <= new Date()) {
          refreshItems();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Check immediately on mount
    checkForUpdates();

    // Then check every hour
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isRefreshing,
    metadata,
    refreshItems
  };
} 