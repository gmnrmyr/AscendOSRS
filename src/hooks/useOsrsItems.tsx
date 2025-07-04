import { useEffect, useState } from 'react';

export interface OsrsItem {
  id: number;
  name: string;
  is_member: boolean;
  image_url: string;
  examine: string;
}

export function useOsrsItems() {
  const [items, setItems] = useState<OsrsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/osrs_items.json')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load OSRS items');
        setLoading(false);
      });
  }, []);

  // Simple search by name (case-insensitive, includes)
  function search(query: string) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(q));
  }

  return { items, loading, error, search };
} 