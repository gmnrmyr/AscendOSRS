
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CharacterManager } from "@/components/CharacterManager";
import { MoneyMakingMethods } from "@/components/MoneyMakingMethods";
import { PurchaseGoals } from "@/components/PurchaseGoals";
import { BankTracker } from "@/components/BankTracker";
import { DataManager } from "@/components/DataManager";
import { SummaryDashboard } from "@/components/SummaryDashboard";
import { useAppState } from "@/components/AppStateProvider";

interface MainDashboardProps {
  activeTab: string;
}

export const MainDashboard = ({ activeTab }: MainDashboardProps) => {
  const {
    characters,
    moneyMethods,
    purchaseGoals,
    bankData,
    hoursPerDay,
    setCharacters,
    setMoneyMethods,
    setPurchaseGoals,
    setBankData,
    setHoursPerDay,
    setAllData
  } = useAppState();

  // Filter active characters for calculations
  const activeCharacters = characters.filter(char => char.isActive);

  // Filter bank data for active characters only
  const activeBankData = Object.fromEntries(
    Object.entries(bankData).filter(([characterName]) => 
      activeCharacters.some(char => char.name === characterName)
    )
  );

  return (
    <Tabs value={activeTab} className="space-y-8">
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
            characters={characters}
            bankData={bankData}
            setCharacters={setCharacters}
            setBankData={setBankData}
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
            setAllData={setAllData}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
