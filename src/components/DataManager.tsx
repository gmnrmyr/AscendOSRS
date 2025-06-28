
import { CloudOperations } from "@/components/data/CloudOperations";
import { LocalOperations } from "@/components/data/LocalOperations";
import { DataSummary } from "@/components/data/DataSummary";

interface DataManagerProps {
  characters: any[];
  moneyMethods: any[];
  purchaseGoals: any[];
  bankData: Record<string, any[]>;
  hoursPerDay: number;
  setCharacters: (characters: any[]) => void;
  setMoneyMethods: (methods: any[]) => void;
  setPurchaseGoals: (goals: any[]) => void;
  setBankData: (bankData: Record<string, any[]>) => void;
  setHoursPerDay: (hours: number) => void;
  setAllData: (data: {
    characters: any[];
    moneyMethods: any[];
    purchaseGoals: any[];
    bankData: Record<string, any[]>;
    hoursPerDay: number;
  }) => void;
}

export function DataManager({
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
}: DataManagerProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2">Data Management</h2>
        <p className="text-amber-600">Export, import, and manage your OSRS dashboard data</p>
      </div>

      {/* Cloud Operations */}
      <CloudOperations
        characters={characters}
        moneyMethods={moneyMethods}
        purchaseGoals={purchaseGoals}
        bankData={bankData}
        hoursPerDay={hoursPerDay}
        setAllData={setAllData}
      />

      {/* Local Export/Import */}
      <LocalOperations
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

      {/* Data Summary */}
      <DataSummary
        characters={characters}
        moneyMethods={moneyMethods}
        purchaseGoals={purchaseGoals}
        bankData={bankData}
      />
    </div>
  );
}
