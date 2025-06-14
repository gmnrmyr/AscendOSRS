
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              OSRS Tracker Dashboard
            </h1>
            <p className="text-amber-600 dark:text-amber-300 mt-2">
              Track your Old School RuneScape progress, money-making methods, and purchase goals
            </p>
          </div>
          
          <Card className="p-4 bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Hours per day:
              </label>
              <Input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-20 text-center"
                min="1"
                max="24"
              />
            </div>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl bg-amber-100 dark:bg-amber-900/20">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="methods" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Methods
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Bank
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Data
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
