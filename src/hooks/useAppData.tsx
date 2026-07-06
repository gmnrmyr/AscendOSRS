
import { useState, useEffect } from 'react';
import { useDataPersistence } from './useDataPersistence';
import { loadServerData, saveServerData } from '@/services/localStore';
import { upsertSnapshot, type WealthSnapshot } from '@/services/wealthHistory';
import { 
  getDefaultCharacters, 
  getDefaultMoneyMethods, 
  getDefaultPurchaseGoals, 
  getDefaultBankData 
} from './useDefaultData';

interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
  isActive: boolean;
  platTokens?: number;
}

interface MoneyMethod {
  id: string;
  name: string;
  character: string;
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  requirements: string;
  notes: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  isActive?: boolean;
}

interface PurchaseGoal {
  id: string;
  name: string;
  currentPrice: number;
  targetPrice?: number;
  quantity: number;
  priority: 'S+' | 'S' | 'S-' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-';
  category: 'gear' | 'consumables' | 'materials' | 'other';
  notes: string;
  imageUrl?: string;
}

interface BankItem {
  id: string;
  osrsId?: number; // item id real do OSRS (do Data Exporter) — permite re-precificar
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

export function useAppData() {
  const [characters, setCharacters] = useState<Character[]>(getDefaultCharacters());
  const [moneyMethods, setMoneyMethods] = useState<MoneyMethod[]>(getDefaultMoneyMethods());
  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>(getDefaultPurchaseGoals());
  const [bankData, setBankData] = useState<Record<string, BankItem[]>>(getDefaultBankData());
  const [hoursPerDay, setHoursPerDay] = useState(10);
  const [wealthHistory, setWealthHistory] = useState<WealthSnapshot[]>([]);
  // Gate de salvamento: só persiste DEPOIS do load inicial, pra não gravar
  // defaults vazios por cima do save do disco.
  const [loaded, setLoaded] = useState(false);

  const applyData = (d: any) => {
    if (Array.isArray(d.characters)) setCharacters(d.characters);
    if (Array.isArray(d.moneyMethods)) setMoneyMethods(d.moneyMethods);
    if (Array.isArray(d.purchaseGoals)) setPurchaseGoals(d.purchaseGoals);
    if (Array.isArray(d.wealthHistory)) setWealthHistory(d.wealthHistory);
    if (d.bankData && typeof d.bankData === 'object') {
      // Saneamento: descarta bankData de chars que não existem mais (lixo órfão)
      const validNames = new Set((Array.isArray(d.characters) ? d.characters : []).map((c: any) => c.name));
      const clean: Record<string, BankItem[]> = {};
      for (const [name, items] of Object.entries(d.bankData as Record<string, BankItem[]>)) {
        if (validNames.size === 0 || validNames.has(name)) clean[name] = items;
      }
      setBankData(clean);
    }
    if (typeof d.hoursPerDay === 'number') setHoursPerDay(d.hoursPerDay);
  };

  // Load inicial (local-first): o disco do Mac (server) é a fonte de verdade.
  // Ordem: server -> senão localStorage (e migra pro server) -> senão defaults.
  useEffect(() => {
    let cancelled = false;

    const readLocal = () => {
      try {
        const raw = localStorage.getItem('osrs-dashboard-data');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    };

    (async () => {
      const local = readLocal();
      try {
        const server = await loadServerData();
        if (cancelled) return;
        if (server) {
          applyData(server); // disco ganha (compartilhado entre origins, sobrevive a limpar cache)
        } else if (local) {
          applyData(local);            // primeira vez: migra o que já existia no browser
          try { await saveServerData(local); } catch (e) { console.error('Migração pro disco falhou:', e); }
        }
        // senão: mantém os defaults já no estado
      } catch (e) {
        // server offline -> não perde nada, usa o cache local
        console.warn('Persistência local (server) indisponível, usando localStorage:', e);
        if (local && !cancelled) applyData(local);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Auto-carimbo diário: depois do load, garante 1 snapshot pra hoje (upsert por dia).
  // Roda uma vez por sessão quando os dados já estão carregados.
  const [autoSnapped, setAutoSnapped] = useState(false);
  useEffect(() => {
    if (!loaded || autoSnapped) return;
    setWealthHistory((prev) => upsertSnapshot(prev, characters, bankData));
    setAutoSnapped(true);
  }, [loaded, autoSnapped, characters, bankData]);

  // Carimbo manual: força um snapshot com os valores atuais (sobrescreve o de hoje).
  const recordWealthSnapshot = () => {
    setWealthHistory((prev) => upsertSnapshot(prev, characters, bankData));
  };

  // Use persistence hook for auto-saving (só depois do load inicial)
  useDataPersistence({
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    wealthHistory,
    enabled: loaded
  });

  const setAllData = (data: {
    characters: Character[];
    moneyMethods: MoneyMethod[];
    purchaseGoals: PurchaseGoal[];
    bankData: Record<string, BankItem[]>;
    hoursPerDay: number;
  }) => {
    // Strictly replace all state with provided data (no merging, no patching)
    setCharacters(Array.isArray(data.characters) ? data.characters : []);
    setMoneyMethods(Array.isArray(data.moneyMethods) ? data.moneyMethods : []);
    setPurchaseGoals(Array.isArray(data.purchaseGoals) ? data.purchaseGoals : []);
    setBankData(data.bankData && typeof data.bankData === 'object' ? data.bankData : {});
    setHoursPerDay(typeof data.hoursPerDay === 'number' ? data.hoursPerDay : 10);
  };

  return {
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    wealthHistory,
    setCharacters,
    setMoneyMethods,
    setPurchaseGoals,
    setBankData,
    setHoursPerDay,
    setAllData,
    recordWealthSnapshot
  };
}

export type { Character, MoneyMethod, PurchaseGoal, BankItem };
