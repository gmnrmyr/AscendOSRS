
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
      <div className="osrs-card p-6 bg-gradient-to-br from-blue-100 to-blue-200 border-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>👥 Characters</p>
            <p className="text-4xl font-bold text-blue-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>{charactersCount}</p>
          </div>
          <Users className="h-10 w-10 text-blue-700" />
        </div>
      </div>

      <div className="osrs-card p-6 bg-gradient-to-br from-green-100 to-green-200 border-green-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>💰 Bank Sum</p>
            <p className="text-3xl font-bold text-green-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalBankValue)} GP
            </p>
          </div>
          <Coins className="h-10 w-10 text-green-700" />
        </div>
      </div>

      <div className="osrs-card p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>🪙 Gold Sum</p>
            <p className="text-3xl font-bold text-yellow-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalGoldValue)} GP
            </p>
          </div>
          <Wallet className="h-10 w-10 text-yellow-700" />
        </div>
      </div>

      <div className="osrs-card p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>💸 Current GP/Hr</p>
            <p className="text-3xl font-bold text-indigo-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(currentGPHour)}/hr
            </p>
          </div>
          <DollarSign className="h-10 w-10 text-indigo-700" />
        </div>
      </div>

      <div className="osrs-card p-6 bg-gradient-to-br from-purple-100 to-purple-200 border-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>🎯 Goals Value</p>
            <p className="text-3xl font-bold text-purple-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatGP(totalGoalsValue)} GP
            </p>
          </div>
          <Target className="h-10 w-10 text-purple-700" />
        </div>
      </div>

      <div className="osrs-card p-6 bg-gradient-to-br from-orange-100 to-orange-200 border-orange-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-800 text-sm font-bold" style={{ fontFamily: 'Cinzel, serif' }}>⏰ Time to Goals</p>
            <p className="text-2xl font-bold text-orange-900" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              {formatDays(daysToComplete)}
            </p>
          </div>
          <Clock className="h-10 w-10 text-orange-700" />
        </div>
      </div>
    </div>
  );
}
