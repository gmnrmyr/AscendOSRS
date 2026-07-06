
import { Users, Coins, DollarSign, Target, Clock, Wallet } from "lucide-react";

interface SummaryCardsProps {
  charactersCount: number;
  totalBankValue: number;
  totalGoldValue: number;
  currentGPHour: number;
  totalGoalsValue: number;
  daysToComplete: number;
  formatGP: (amount: number) => string;
  formatDays: (days: number) => string;
}

export function SummaryCards({
  charactersCount,
  totalBankValue,
  totalGoldValue,
  currentGPHour,
  totalGoalsValue,
  daysToComplete,
  formatGP,
  formatDays
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <div className="osrs-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 dark:text-blue-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>👥 Characters</p>
            <p className="text-4xl font-bold text-blue-900 dark:text-blue-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>{charactersCount}</p>
          </div>
          <Users className="h-10 w-10 text-blue-700 dark:text-blue-300" />
        </div>
      </div>

      <div className="osrs-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 dark:text-green-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>💰 Bank Sum</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalBankValue)} GP
            </p>
          </div>
          <Coins className="h-10 w-10 text-green-700 dark:text-green-300" />
        </div>
      </div>

      <div className="osrs-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>🪙 Gold Sum</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalGoldValue)} GP
            </p>
          </div>
          <Wallet className="h-10 w-10 text-yellow-700 dark:text-yellow-300" />
        </div>
      </div>

      <div className="osrs-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-800 dark:text-indigo-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>💸 Current GP/Hr</p>
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(currentGPHour)}/hr
            </p>
          </div>
          <DollarSign className="h-10 w-10 text-indigo-700 dark:text-indigo-300" />
        </div>
      </div>

      <div className="osrs-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-800 dark:text-purple-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>🎯 Goals Value</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalGoalsValue)} GP
            </p>
          </div>
          <Target className="h-10 w-10 text-purple-700 dark:text-purple-300" />
        </div>
      </div>

      <div className="osrs-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-800 dark:text-orange-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>⏰ Time to Goals</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatDays(daysToComplete)}
            </p>
          </div>
          <Clock className="h-10 w-10 text-orange-700 dark:text-orange-300" />
        </div>
      </div>
    </div>
  );
}
