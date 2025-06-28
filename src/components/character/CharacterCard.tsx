
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sword, TrendingUp, Coins, Crown } from "lucide-react";
import { CharacterRefreshButton } from "@/components/CharacterRefreshButton";

interface CharacterCardProps {
  character: any;
  onDelete: (id: string) => void;
  onUpdate: (character: any) => void;
}

export function CharacterCard({ character, onDelete, onUpdate }: CharacterCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main': return "bg-blue-100 text-blue-800";
      case 'alt': return "bg-green-100 text-green-800";
      case 'ironman': return "bg-gray-100 text-gray-800";
      case 'hardcore': return "bg-red-100 text-red-800";
      case 'ultimate': return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hardcore':
        return <Crown className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const totalWealth = character.bank + (character.platTokens * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-gray-900">{character.name}</CardTitle>
          <div className="flex gap-1">
            <CharacterRefreshButton 
              character={character} 
              onUpdate={onUpdate}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(character.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Badge className={getTypeColor(character.type)}>
          {getTypeIcon(character.type)}
          {character.type}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Sword className="h-4 w-4 text-red-500" />
            <span>Combat: {character.combatLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>Total: {character.totalLevel}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span>Bank: {character.bank.toLocaleString()} GP</span>
          </div>
          
          {character.platTokens > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-purple-500" />
              <span>Tokens: {character.platTokens.toLocaleString()}</span>
            </div>
          )}
          
          <div className="text-sm font-semibold text-green-600">
            Total Wealth: {totalWealth.toLocaleString()} GP
          </div>
        </div>

        {character.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">{character.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
