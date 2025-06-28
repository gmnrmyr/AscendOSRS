
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, User, DollarSign, Mouse, Star } from "lucide-react";

interface MethodCardProps {
  method: any;
  onDelete: (id: string) => void;
}

export function MethodCard({ method, onDelete }: MethodCardProps) {
  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-orange-100 text-orange-800";
      case 4: return "bg-red-100 text-red-800";
      case 5: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return "bg-red-100 text-red-800";
      case 'skilling': return "bg-blue-100 text-blue-800";
      case 'bossing': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-gray-900">{method.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(method.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={getCategoryColor(method.category)}>
            {method.category}
          </Badge>
          <Badge className={getIntensityColor(method.clickIntensity)}>
            <Mouse className="h-3 w-3 mr-1" />
            Intensity {method.clickIntensity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{method.character}</span>
        </div>
        
        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
          <DollarSign className="h-5 w-5" />
          <span>{method.gpHour.toLocaleString()} GP/hr</span>
        </div>

        {method.requirements && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
            <p className="text-sm text-gray-600">{method.requirements}</p>
          </div>
        )}

        {method.notes && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
            <p className="text-sm text-gray-600">{method.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
