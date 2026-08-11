// Persistência local-first: fala com o server.js (data/dashboard.json no Mac).
// É a fonte de verdade e funciona de qualquer origin (localhost ou IP da LAN),
// porque o proxy /api do Vite roda no Mac. O localStorage vira só cache/fallback.

export interface DashboardSave {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  wealthHistory?: any[]; // série histórica da riqueza total (1 ponto/dia)
  flipping?: { favorites: any[]; journal: any[] };
  settings?: { runiteAsGold: boolean; goldMainOnly: boolean };
  savedAt?: string;
}

// Carrega o save do disco. null = ainda não existe arquivo (primeira vez).
// Em erro de rede, lança — o caller decide cair pro localStorage.
export async function loadServerData(): Promise<DashboardSave | null> {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error(`GET /api/data -> ${res.status}`);
  return res.json();
}

// Salva o dashboard no disco do Mac.
export async function saveServerData(data: DashboardSave): Promise<void> {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST /api/data -> ${res.status}`);
}
