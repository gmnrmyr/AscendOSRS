
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package, DollarSign } from "lucide-react";

interface BankItemCardProps {
  item: any;
  onDelete: (id: string) => void;
}

export function BankItemCard({ item, onDelete }: BankItemCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stackable': return "bg-blue-100 text-blue-800";
      case 'gear': return "bg-purple-100 text-purple-800";
      case 'materials': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalValue = item.quantity * item.estimatedPrice;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 truncate flex-1 mr-2">{item.name}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Badge className={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>Qty: {item.quantity.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Each: {item.estimatedPrice.toLocaleString()} GP</span>
          </div>
          
          <div className="text-sm font-semibold text-green-600">
            Total: {totalValue.toLocaleString()} GP
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
