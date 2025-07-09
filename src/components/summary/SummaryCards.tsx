
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
      <div className="osrs-card p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-600 dark:border-blue-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 dark:text-blue-200 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>👥 Characters</p>
            <p className="text-4xl font-bold text-blue-900 dark:text-blue-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>{charactersCount}</p>
          </div>
          <Users className="h-10 w-10 text-blue-700 dark:text-blue-300" />
        </div>
      </div>

      <div className="osrs-card p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 border-green-600 dark:border-green-400">
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

      <div className="osrs-card p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 border-yellow-600 dark:border-yellow-400">
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

      <div className="osrs-card p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 border-indigo-600 dark:border-indigo-400">
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

      <div className="osrs-card p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-600 dark:border-purple-400">
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

      <div className="osrs-card p-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-orange-600 dark:border-orange-400">
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
