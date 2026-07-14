
import { useState, useEffect } from 'react';
import { useDataPersistence } from './useDataPersistence';
import { loadServerData, saveServerData } from '@/services/localStore';
import { upsertSnapshot, type WealthSnapshot } from '@/services/wealthHistory';
import { ensurePrices, priceOf, priceOfVariant, idByName, itemImageUrl } from '@/services/priceEngine';
import { fetchWikiMethods, matchWikiMethod } from '@/services/mmgLive';
import { emptyFlippingData, type FlippingData } from '@/services/flipping';
import { fetchGoalMarket } from '@/services/goalMarket';
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
  itemId?: number; // id real do OSRS — resolve preço/ícone/mercado no priceEngine
  buyable?: boolean; // false = conquista/skill (não compra no GE). undefined => comprável
  suppliesCost?: number; // GP — custo estimado em supplies pra tirar a conquista (Infernal, Torso...)
  targetCustom?: boolean;
}

// Decisões do usuário que valem no APP INTEIRO (Goals, Summary...) e persistem no save.
interface AppSettings {
  runiteAsGold: boolean; // contar stacks grandes de Runite bar como gold líquido
  goldMainOnly: boolean; // gold disponível = só a conta principal
}

const defaultSettings = (): AppSettings => ({ runiteAsGold: false, goldMainOnly: false });

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
  const [flipping, setFlipping] = useState<FlippingData>(emptyFlippingData());
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());
  // Gate de salvamento: só persiste DEPOIS do load inicial, pra não gravar
  // defaults vazios por cima do save do disco.
  const [loaded, setLoaded] = useState(false);
  // Gravação só é liberada quando o load do disco foi CONFIRMADO (ou instalação nova).
  // Se o servidor estiver inacessível, canSave fica false e nada é salvo por cima.
  const [canSave, setCanSave] = useState(false);

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
    if (d.flipping && Array.isArray(d.flipping.favorites) && Array.isArray(d.flipping.journal)) {
      setFlipping(d.flipping);
    }
    if (d.settings && typeof d.settings === 'object') {
      setSettings({ ...defaultSettings(), ...d.settings });
    }
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
          // Load SUSPEITO: o disco tem chars mas não tem goals válidos — se gravar
          // agora, o seed default do React vai por cima dos goals reais (incidente
          // ~13/jul). Sessão fica read-only até um reload com dado íntegro.
          const suspicious = Array.isArray(server.characters) && server.characters.length > 0
            && !Array.isArray(server.purchaseGoals);
          if (suspicious) {
            console.warn('Save do disco sem purchaseGoals válidos — gravação DESABILITADA nesta sessão.');
          } else if (!cancelled) {
            setCanSave(true);
          }
        } else if (local) {
          applyData(local);            // primeira vez: migra o que já existia no browser
          try { await saveServerData(local); } catch (e) { console.error('Migração pro disco falhou:', e); }
          if (!cancelled) setCanSave(true);
        } else {
          // instalação nova de verdade (sem disco e sem cache): pode salvar os defaults
          if (!cancelled) setCanSave(true);
        }
      } catch (e) {
        // server INACESSÍVEL: NÃO liberar gravação. Evita atropelar o save do disco
        // com defaults/estado parcial (bug que apagou goals ao carregar em browser limpo).
        console.warn('Persistência local (server) indisponível — gravação DESABILITADA nesta sessão até recarregar:', e);
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

  // Rehydrate de preço NA CARGA: o estimatedPrice salvo é só cache — a verdade é o
  // preço GE ao vivo resolvido pelo osrsId. Roda 1x depois do load confirmado (canSave),
  // usa o cache de 10min (force=false) e falha silenciosa se estiver offline (mantém o cache).
  const [pricedOnLoad, setPricedOnLoad] = useState(false);
  useEffect(() => {
    if (!loaded || !canSave || pricedOnLoad) return;
    setPricedOnLoad(true);
    refreshAllPrices(false).catch((e) =>
      console.warn('Rehydrate de preço na carga falhou (mantendo cache do save):', e)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, canSave, pricedOnLoad]);

  // Atualização GLOBAL de preços: reprecifica TODOS os itens de TODOS os bancos
  // (untradeable -> tradeable via mapping do RuneLite) + TODOS os goals + o gp/hr
  // dos money methods (profit ao vivo das guias da OSRS Wiki). Depois re-carimba
  // o snapshot de hoje com os valores novos. Devolve o que mudou.
  const refreshAllPrices = async (force = true): Promise<{ bankChanged: number; goalsChanged: number; methodsChanged: number }> => {
    await ensurePrices(force); // force = /latest fresco (ignora cache de 10min)

    let bankChanged = 0;
    const nextBank: Record<string, BankItem[]> = {};
    for (const [char, items] of Object.entries(bankData)) {
      nextBank[char] = items.map((item) => {
        if (!item.osrsId) return item; // sem id (manual/CSV) -> mantém preço manual
        // COM osrsId: o preço vivo é a verdade — inclusive 0 (untradeable/sem preço na Wiki).
        // Não segura preço velho: é isso que causava as divergências (bond untradeable = 12m fossilizado).
        const unit = priceOfVariant(item.osrsId, item.name).unit;
        if (unit !== item.estimatedPrice) { bankChanged++; return { ...item, estimatedPrice: unit }; }
        return item;
      });
    }
    setBankData(nextBank);

    // Alvo de compra "esperto" (percentil 25 dos lows de 7d) — cache 1h, falha vira mapa vazio.
    let market = new Map<number, { changePct: number | null; smartTarget: number | null }>();
    try {
      market = await fetchGoalMarket(purchaseGoals.map((g) => g.itemId || 0));
    } catch (e) {
      console.warn('Mercado dos goals indisponível (target segue o preço vivo):', e);
    }

    let goalsChanged = 0;
    const nextGoals = purchaseGoals.map((goal) => {
      let id = goal.itemId && goal.itemId > 0 ? goal.itemId : 0;
      let price = id ? priceOf(id) : 0;
      if (!price) { const byName = idByName(goal.name); if (byName) { id = byName; price = priceOf(byName); } }
      if (!id) return goal;
      const next: any = { ...goal, itemId: id, imageUrl: itemImageUrl(id) };
      if (price) {
        if (price !== goal.currentPrice) goalsChanged++;
        next.currentPrice = price;
        // target = alvo de compra baseado em dados; sem dados, segue o mercado (salvo editado à mão)
        if (!(goal as any).targetCustom) next.targetPrice = market.get(id)?.smartTarget || price;
      }
      return next;
    });
    setPurchaseGoals(nextGoals);

    // gp/hr dos methods pelo profit ao vivo das guias da Wiki (matching conservador:
    // sem match = mantém o valor manual; match errado nunca entra). Falha silenciosa
    // se offline — preço de banco/goal não depende disso.
    let methodsChanged = 0;
    try {
      const wiki = await fetchWikiMethods();
      if (wiki.length > 0) {
        const nextMethods = moneyMethods.map((m) => {
          const hit = matchWikiMethod(m.name, wiki);
          if (!hit || hit.profit <= 0) return m;
          if (hit.profit === m.gpHour) return m;
          methodsChanged++;
          return { ...m, gpHour: hit.profit, profit: hit.profit, wikiName: hit.name } as typeof m;
        });
        if (methodsChanged > 0) setMoneyMethods(nextMethods);
      }
    } catch (e) {
      console.warn('Profit ao vivo dos methods indisponível (mantendo valores):', e);
    }

    // snapshot de hoje reflete os preços novos (usa o bank recém-reprecificado)
    setWealthHistory((prev) => upsertSnapshot(prev, characters, nextBank));

    return { bankChanged, goalsChanged, methodsChanged };
  };

  // Use persistence hook for auto-saving (só depois do load inicial)
  useDataPersistence({
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    wealthHistory,
    flipping,
    settings,
    enabled: canSave
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
    flipping,
    setFlipping,
    settings,
    setSettings,
    setCharacters,
    setMoneyMethods,
    setPurchaseGoals,
    setBankData,
    setHoursPerDay,
    setAllData,
    recordWealthSnapshot,
    refreshAllPrices
  };
}

export type { Character, MoneyMethod, PurchaseGoal, BankItem, AppSettings };
