
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CharacterManager } from "@/components/CharacterManager";
import { MoneyMakingMethods } from "@/components/MoneyMakingMethods";
import { PurchaseGoals } from "@/components/PurchaseGoals";
import { BankTracker } from "@/components/BankTracker";
import { DataManager } from "@/components/DataManager";
import { SummaryDashboard } from "@/components/SummaryDashboard";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, Target, Coins, Users, Settings } from "lucide-react";

interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
}

interface MoneyMethod {
  id: string;
  name: string;
  character: string;
  gpHour: number;
  clickIntensity: 1 | 2 | 3 | 4 | 5;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  requirements: string;
  notes: string;
}

interface PurchaseGoal {
  id: string;
  name: string;
  currentPrice: number;
  targetPrice?: number;
  quantity: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'gear' | 'consumables' | 'materials' | 'other';
  notes: string;
  imageUrl?: string;
}

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
  notes: string;
}

const Index = () => {
  // Initial character data based on your provided information
  const initialCharacters: Character[] = [
    {
      id: "lazy-priest-main",
      name: "Lazy Priest",
      type: "main" as const,
      combatLevel: 126,
      totalLevel: 2000,
      bank: 50000000,
      notes: "Main account - working on max"
    },
    {
      id: "high-priest-pure",
      name: "High Priest",
      type: "alt" as const,
      combatLevel: 80,
      totalLevel: 1200,
      bank: 15000000,
      notes: "Pure account for PvP"
    }
  ];

  // Initial money making methods based on your data
  const initialMoneyMethods: MoneyMethod[] = [
    {
      id: "brutal-black-dragons",
      name: "Brutal Black Dragons (Tbow)",
      character: "Lazy Priest",
      gpHour: 1000000,
      clickIntensity: 3 as const,
      category: "combat" as const,
      requirements: "Twisted Bow, High combat stats",
      notes: "1m/hour with Tbow"
    },
    {
      id: "rune-dragons",
      name: "Rune Dragons",
      character: "Lazy Priest",
      gpHour: 1200000,
      clickIntensity: 2 as const,
      category: "combat" as const,
      requirements: "High combat, Dragon Slayer II",
      notes: "1.2m/hour on main"
    },
    {
      id: "wyverns",
      name: "Wyverns",
      character: "High Priest",
      gpHour: 400000,
      clickIntensity: 4 as const,
      category: "combat" as const,
      requirements: "72 Slayer, High combat",
      notes: "400k-800k/hour depending on gear"
    },
    {
      id: "amethyst-mining",
      name: "Amethyst Mining",
      character: "High Priest",
      gpHour: 250000,
      clickIntensity: 5 as const,
      category: "skilling" as const,
      requirements: "92 Mining, Dragon Pickaxe",
      notes: "250k/hour, very AFK"
    },
    {
      id: "cannonballs",
      name: "Cannonballs",
      character: "High Priest",
      gpHour: 150000,
      clickIntensity: 5 as const,
      category: "skilling" as const,
      requirements: "35 Smithing, Dwarf Cannon quest",
      notes: "150k/hour, very AFK"
    }
  ];

  // Initial purchase goals based on your data
  const initialPurchaseGoals: PurchaseGoal[] = [
    {
      id: "twisted-bow",
      name: "Twisted Bow",
      currentPrice: 1200000000,
      targetPrice: 1200000000,
      quantity: 1,
      priority: "critical" as const,
      category: "gear" as const,
      notes: "Priority #1 for PvM",
      imageUrl: "https://oldschool.runescape.wiki/images/Twisted_bow.png"
    },
    {
      id: "scythe-vitur",
      name: "Scythe of Vitur",
      currentPrice: 800000000,
      targetPrice: 800000000,
      quantity: 1,
      priority: "high" as const,
      category: "gear" as const,
      notes: "ToB weapon",
      imageUrl: "https://oldschool.runescape.wiki/images/Scythe_of_vitur.png"
    },
    {
      id: "dragon-claws",
      name: "Dragon Claws",
      currentPrice: 180000000,
      targetPrice: 180000000,
      quantity: 1,
      priority: "medium" as const,
      category: "gear" as const,
      notes: "PvP special weapon"
    },
    {
      id: "bandos-chestplate",
      name: "Bandos Chestplate",
      currentPrice: 25000000,
      targetPrice: 25000000,
      quantity: 1,
      priority: "medium" as const,
      category: "gear" as const,
      notes: "Melee armor"
    },
    {
      id: "bandos-tassets",
      name: "Bandos Tassets",
      currentPrice: 28000000,
      targetPrice: 28000000,
      quantity: 1,
      priority: "medium" as const,
      category: "gear" as const,
      notes: "Melee armor"
    }
  ];

  // Initial bank data based on STASH units and items mentioned
  const initialBankData: Record<string, BankItem[]> = {
    "Lazy Priest": [
      { id: "1", name: "Coins", quantity: 50000000, estimatedPrice: 1, category: "stackable" as const, character: "Lazy Priest", notes: "Cash stack" },
      { id: "2", name: "Twisted Bow", quantity: 1, estimatedPrice: 1200000000, category: "gear" as const, character: "Lazy Priest", notes: "Main weapon" },
      { id: "3", name: "Bandos Chestplate", quantity: 1, estimatedPrice: 25000000, category: "gear" as const, character: "Lazy Priest", notes: "Melee armor" },
      { id: "4", name: "Bandos Tassets", quantity: 1, estimatedPrice: 28000000, category: "gear" as const, character: "Lazy Priest", notes: "Melee armor" },
      { id: "5", name: "Dragon Claws", quantity: 1, estimatedPrice: 180000000, category: "gear" as const, character: "Lazy Priest", notes: "Special weapon" },
      { id: "6", name: "Rune Pickaxe", quantity: 1, estimatedPrice: 18500, category: "gear" as const, character: "Lazy Priest", notes: "Mining tool" },
      { id: "7", name: "Adamant Bars", quantity: 100, estimatedPrice: 1950, category: "materials" as const, character: "Lazy Priest", notes: "Smithing supplies" },
      { id: "8", name: "Steel Bars", quantity: 500, estimatedPrice: 361, category: "materials" as const, character: "Lazy Priest", notes: "Smithing supplies" },
      { id: "9", name: "Mithril Bars", quantity: 200, estimatedPrice: 617, category: "materials" as const, character: "Lazy Priest", notes: "Smithing supplies" }
    ],
    "High Priest": [
      { id: "10", name: "Coins", quantity: 15000000, estimatedPrice: 1, category: "stackable" as const, character: "High Priest", notes: "Cash stack" },
      { id: "11", name: "Mystic Robe Top", quantity: 1, estimatedPrice: 72000, category: "gear" as const, character: "High Priest", notes: "STASH unit item" },
      { id: "12", name: "Rune Heraldic Shield", quantity: 1, estimatedPrice: 45000, category: "gear" as const, character: "High Priest", notes: "STASH unit item" },
      { id: "13", name: "Adamant Platelegs", quantity: 1, estimatedPrice: 3200, category: "gear" as const, character: "High Priest", notes: "STASH unit item" },
      { id: "14", name: "Blue D'hide Vambraces", quantity: 5, estimatedPrice: 1800, category: "gear" as const, character: "High Priest", notes: "STASH unit items" },
      { id: "15", name: "Rune Pickaxe", quantity: 1, estimatedPrice: 18500, category: "gear" as const, character: "High Priest", notes: "Mining tool" },
      { id: "16", name: "Steel Full Helm", quantity: 1, estimatedPrice: 950, category: "gear" as const, character: "High Priest", notes: "STASH unit item" },
      { id: "17", name: "Purple Gloves", quantity: 1, estimatedPrice: 300, category: "gear" as const, character: "High Priest", notes: "STASH unit item" },
      { id: "18", name: "Mystic Hat", quantity: 1, estimatedPrice: 8500, category: "gear" as const, character: "High Priest", notes: "Magic gear" },
      { id: "19", name: "Bone Spear", quantity: 1, estimatedPrice: 2000, category: "gear" as const, character: "High Priest", notes: "Weapon" },
      { id: "20", name: "Staff of Air", quantity: 1, estimatedPrice: 1500, category: "gear" as const, character: "High Priest", notes: "Magic weapon" }
    ]
  };

  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [moneyMethods, setMoneyMethods] = useState<MoneyMethod[]>(initialMoneyMethods);
  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>(initialPurchaseGoals);
  const [bankData, setBankData] = useState<Record<string, BankItem[]>>(initialBankData);
  const [hoursPerDay, setHoursPerDay] = useState(10);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('osrs-dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only override with saved data if it exists, otherwise keep initial data
        if (parsed.characters && parsed.characters.length > 0) setCharacters(parsed.characters);
        if (parsed.moneyMethods && parsed.moneyMethods.length > 0) setMoneyMethods(parsed.moneyMethods);
        if (parsed.purchaseGoals && parsed.purchaseGoals.length > 0) setPurchaseGoals(parsed.purchaseGoals);
        if (parsed.bankData && Object.keys(parsed.bankData).length > 0) setBankData(parsed.bankData);
        if (parsed.hoursPerDay) setHoursPerDay(parsed.hoursPerDay);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      characters,
      moneyMethods,
      purchaseGoals,
      bankData,
      hoursPerDay
    };
    localStorage.setItem('osrs-dashboard-data', JSON.stringify(dataToSave));
  }, [characters, moneyMethods, purchaseGoals, bankData, hoursPerDay]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200" 
         style={{
           backgroundImage: `
             radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(160, 82, 45, 0.1) 0%, transparent 50%),
             url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d2691e' fill-opacity='0.03'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5h2V20h18v2H22v18h-2v-20zM0 18h18v2H0v-2zm22 2h18v2H22v-2z'/%3E%3C/g%3E%3C/svg%3E")
           `
         }}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="osrs-card p-6 flex-1 mr-4">
            <h1 className="text-5xl font-bold text-amber-800 flex items-center gap-3 mb-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <TrendingUp className="h-10 w-10 text-amber-600" />
              ⚔️ OSRS Tracker Dashboard ⚔️
            </h1>
            <p className="text-amber-700 text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
              🏰 Track thy Old School RuneScape progress, gold-making methods, and purchase goals 🏰
            </p>
            <div className="mt-3 flex items-center gap-2 text-amber-600">
              <span className="text-sm">👤 Current User:</span>
              <span className="font-bold text-amber-800 osrs-badge">Myr (Lazy Priest)</span>
            </div>
          </div>
          
          <div className="osrs-card p-4">
            <div className="flex items-center gap-3">
              <label className="text-base font-bold text-amber-800" style={{ fontFamily: 'Cinzel, serif' }}>
                ⏰ Hours per day:
              </label>
              <Input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="osrs-input w-20 text-center font-bold"
                min="1"
                max="24"
              />
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="osrs-tabs grid grid-cols-6 w-full max-w-4xl p-2">
            <TabsTrigger value="summary" className="osrs-tab flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              📊 Summary
            </TabsTrigger>
            <TabsTrigger value="characters" className="osrs-tab flex items-center gap-2">
              <Users className="h-4 w-4" />
              👥 Characters
            </TabsTrigger>
            <TabsTrigger value="methods" className="osrs-tab flex items-center gap-2">
              <Coins className="h-4 w-4" />
              💰 Methods
            </TabsTrigger>
            <TabsTrigger value="goals" className="osrs-tab flex items-center gap-2">
              <Target className="h-4 w-4" />
              🎯 Goals
            </TabsTrigger>
            <TabsTrigger value="bank" className="osrs-tab flex items-center gap-2">
              <Coins className="h-4 w-4" />
              🏦 Bank
            </TabsTrigger>
            <TabsTrigger value="data" className="osrs-tab flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ⚙️ Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryDashboard 
              characters={characters}
              moneyMethods={moneyMethods}
              purchaseGoals={purchaseGoals}
              bankData={bankData}
              hoursPerDay={hoursPerDay}
            />
          </TabsContent>

          <TabsContent value="characters">
            <CharacterManager 
              characters={characters}
              setCharacters={setCharacters}
            />
          </TabsContent>

          <TabsContent value="methods">
            <MoneyMakingMethods 
              methods={moneyMethods}
              setMethods={setMoneyMethods}
              characters={characters}
            />
          </TabsContent>

          <TabsContent value="goals">
            <PurchaseGoals 
              goals={purchaseGoals}
              setGoals={setPurchaseGoals}
            />
          </TabsContent>

          <TabsContent value="bank">
            <BankTracker 
              bankData={bankData}
              setBankData={setBankData}
              characters={characters}
            />
          </TabsContent>

          <TabsContent value="data">
            <DataManager 
              characters={characters}
              moneyMethods={moneyMethods}
              purchaseGoals={purchaseGoals}
              bankData={bankData}
              hoursPerDay={hoursPerDay}
              setCharacters={setCharacters}
              setMoneyMethods={setMoneyMethods}
              setPurchaseGoals={setPurchaseGoals}
              setBankData={setBankData}
              setHoursPerDay={setHoursPerDay}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
