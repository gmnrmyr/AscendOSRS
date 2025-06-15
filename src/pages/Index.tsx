import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { ModernNavbar } from "@/components/ModernNavbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CharacterManager } from "@/components/CharacterManager";
import { MoneyMakingMethods } from "@/components/MoneyMakingMethods";
import { PurchaseGoals } from "@/components/PurchaseGoals";
import { BankTracker } from "@/components/BankTracker";
import { DataManager } from "@/components/DataManager";
import { SummaryDashboard } from "@/components/SummaryDashboard";

// Type definitions with updated Character interface
interface Character {
  id: string;
  name: string;
  type: 'main' | 'alt' | 'ironman' | 'hardcore' | 'ultimate';
  combatLevel: number;
  totalLevel: number;
  bank: number;
  notes: string;
  isActive: boolean;
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
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: "1",
      name: "Lazy Priest",
      type: "main" as const,
      combatLevel: 126,
      totalLevel: 2100,
      bank: 500000000,
      notes: "Main account for high-level PvM content",
      isActive: true
    },
    {
      id: "2", 
      name: "High Priest",
      type: "alt" as const,
      combatLevel: 100,
      totalLevel: 1500,
      bank: 50000000,
      notes: "Alt for money making and skilling",
      isActive: true
    }
  ]);

  const [moneyMethods, setMoneyMethods] = useState<MoneyMethod[]>([
    {
      id: "1",
      name: "Brutal Black Dragons",
      character: "Lazy Priest",
      gpHour: 1000000,
      clickIntensity: 3 as const,
      requirements: "Tbow, high range level",
      notes: "Very consistent money maker",
      category: "combat" as const
    },
    {
      id: "2",
      name: "Rune Dragons", 
      character: "Lazy Priest",
      gpHour: 1200000,
      clickIntensity: 4 as const,
      requirements: "High stats, good gear",
      notes: "Higher intensity but better gp/hr",
      category: "combat" as const
    },
    {
      id: "3",
      name: "Cannonballs",
      character: "High Priest", 
      gpHour: 150000,
      clickIntensity: 1 as const,
      requirements: "Dwarf Cannon quest, 35 smithing",
      notes: "Very AFK money making",
      category: "skilling" as const
    },
    {
      id: "4",
      name: "Gargoyles",
      character: "Lazy Priest",
      gpHour: 567000, 
      clickIntensity: 3 as const,
      requirements: "High slayer, good gear",
      notes: "Good slayer task money",
      category: "combat" as const
    }
  ]);

  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>([
    {
      id: "1",
      name: "Twisted Bow",
      currentPrice: 1200000000,
      targetPrice: 1100000000,
      quantity: 1,
      priority: "S+" as const,
      category: "gear" as const,
      notes: "Essential for high-level PvM",
      imageUrl: ""
    },
    {
      id: "2", 
      name: "Scythe of Vitur",
      currentPrice: 800000000,
      targetPrice: 750000000,
      quantity: 1,
      priority: "S" as const,
      category: "gear" as const,
      notes: "For Theatre of Blood",
      imageUrl: ""
    },
    {
      id: "3",
      name: "Dragon Claws",
      currentPrice: 150000000,
      targetPrice: 140000000,
      quantity: 1,
      priority: "A" as const,
      category: "gear" as const,
      notes: "PvP and some PvM content",
      imageUrl: ""
    }
  ]);

  const [bankData, setBankData] = useState<Record<string, BankItem[]>>({
    "Lazy Priest": [
      {
        id: "1",
        name: "Coins",
        quantity: 500000000,
        estimatedPrice: 1,
        category: "stackable" as const,
        character: "Lazy Priest"
      },
      {
        id: "2",
        name: "Prayer Potions(4)",
        quantity: 1000,
        estimatedPrice: 12000,
        category: "stackable" as const,
        character: "Lazy Priest"
      },
      {
        id: "3",
        name: "Super Combat Potions(4)",
        quantity: 500,
        estimatedPrice: 15000,
        category: "stackable" as const,
        character: "Lazy Priest"
      },
      {
        id: "4",
        name: "Bandos Chestplate",
        quantity: 1,
        estimatedPrice: 25000000,
        category: "gear" as const,
        character: "Lazy Priest"
      }
    ],
    "High Priest": [
      {
        id: "5",
        name: "Coins", 
        quantity: 50000000,
        estimatedPrice: 1,
        category: "stackable" as const,
        character: "High Priest"
      },
      {
        id: "6",
        name: "Steel Bars",
        quantity: 10000,
        estimatedPrice: 500,
        category: "materials" as const,
        character: "High Priest"
      },
      {
        id: "7",
        name: "Cannonballs",
        quantity: 50000,
        estimatedPrice: 180,
        category: "stackable" as const,
        character: "High Priest"
      }
    ]
  });

  const [hoursPerDay, setHoursPerDay] = useState(10);

  // Filter active characters for calculations
  const activeCharacters = characters.filter(char => char.isActive);

  // Filter bank data for active characters only
  const activeBankData = Object.fromEntries(
    Object.entries(bankData).filter(([characterName]) => 
      activeCharacters.some(char => char.name === characterName)
    )
  );

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('osrs-dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.characters) setCharacters(parsed.characters);
        if (parsed.moneyMethods) setMoneyMethods(parsed.moneyMethods);
        if (parsed.purchaseGoals) setPurchaseGoals(parsed.purchaseGoals);
        if (parsed.bankData) setBankData(parsed.bankData);
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
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <ModernNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="container mx-auto p-6 space-y-8">
          {/* Hours per day setting */}
          <div className="flex justify-center">
            <div className="pixel-card p-4">
              <div className="flex items-center gap-3">
                <label className="text-base font-semibold text-gray-900 font-mono">
                  ⏰ Hours per day:
                </label>
                <Input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="pixel-input w-20 text-center font-mono font-bold"
                  min="1"
                  max="24"
                />
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <div className="flex justify-center">
            <AdBanner size="banner" />
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsContent value="summary">
              <div className="pixel-card p-6">
                <SummaryDashboard 
                  characters={activeCharacters}
                  moneyMethods={moneyMethods}
                  purchaseGoals={purchaseGoals}
                  bankData={activeBankData}
                  hoursPerDay={hoursPerDay}
                />
              </div>
            </TabsContent>

            <TabsContent value="characters">
              <div className="pixel-card p-6">
                <CharacterManager 
                  characters={characters}
                  setCharacters={setCharacters}
                />
              </div>
            </TabsContent>

            <TabsContent value="methods">
              <div className="pixel-card p-6">
                <MoneyMakingMethods 
                  methods={moneyMethods}
                  setMethods={setMoneyMethods}
                  characters={activeCharacters}
                />
              </div>
            </TabsContent>

            <TabsContent value="goals">
              <div className="pixel-card p-6">
                <PurchaseGoals 
                  goals={purchaseGoals}
                  setGoals={setPurchaseGoals}
                />
              </div>
            </TabsContent>

            <TabsContent value="bank">
              <div className="pixel-card p-6">
                <BankTracker 
                  bankData={bankData}
                  setBankData={setBankData}
                  characters={characters}
                />
              </div>
            </TabsContent>

            <TabsContent value="data">
              <div className="pixel-card p-6">
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
              </div>
            </TabsContent>
          </Tabs>

          {/* Side Ad for larger screens */}
          <div className="hidden xl:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
            <AdBanner size="skyscraper" />
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default Index;
