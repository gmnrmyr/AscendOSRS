
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

const Index = () => {
  const [characters, setCharacters] = useState([]);
  const [moneyMethods, setMoneyMethods] = useState([]);
  const [purchaseGoals, setPurchaseGoals] = useState([]);
  const [bankData, setBankData] = useState({});
  const [hoursPerDay, setHoursPerDay] = useState(10);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('osrs-dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCharacters(parsed.characters || []);
        setMoneyMethods(parsed.moneyMethods || []);
        setPurchaseGoals(parsed.purchaseGoals || []);
        setBankData(parsed.bankData || {});
        setHoursPerDay(parsed.hoursPerDay || 10);
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
              <span className="font-bold text-amber-800 osrs-badge">Myr</span>
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
