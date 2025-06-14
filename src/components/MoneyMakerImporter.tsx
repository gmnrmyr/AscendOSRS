
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Import, Download, Star } from "lucide-react";
import { osrsApi, MoneyMakingGuide } from "@/services/osrsApi";
import { useToast } from "@/hooks/use-toast";

interface MoneyMakerImporterProps {
  onImportMethods: (methods: any[]) => void;
  characters: any[];
}

export function MoneyMakerImporter({ onImportMethods, characters }: MoneyMakerImporterProps) {
  const [guides, setGuides] = useState<MoneyMakingGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadDefaultGuides = () => {
    setLoading(true);
    try {
      const defaultGuides = osrsApi.getDefaultMoneyMakers();
      setGuides(defaultGuides);
      toast({
        title: "Success",
        description: `Loaded ${defaultGuides.length} money-making guides from OSRS Wiki data`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load money-making guides",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const importSelectedMethods = (selectedGuides: MoneyMakingGuide[]) => {
    const methods = selectedGuides.map(guide => ({
      id: Date.now().toString() + Math.random(),
      name: guide.name,
      character: '',
      gpHour: guide.profit,
      clickIntensity: guide.difficulty as 1 | 2 | 3 | 4 | 5,
      requirements: guide.requirements.join(', '),
      notes: guide.description,
      category: guide.category as 'combat' | 'skilling' | 'bossing' | 'other'
    }));

    onImportMethods(methods);
    toast({
      title: "Imported",
      description: `Added ${methods.length} money-making methods`
    });
  };

  const importAll = () => {
    importSelectedMethods(guides);
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return 'bg-red-100 text-red-800';
      case 'skilling': return 'bg-blue-100 text-blue-800';
      case 'bossing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Import className="h-5 w-5" />
          Import Money-Making Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={loadDefaultGuides} 
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Load OSRS Wiki Guides
          </Button>
          
          {guides.length > 0 && (
            <Button onClick={importAll} variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Import All ({guides.length})
            </Button>
          )}
        </div>

        {guides.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {guides.map((guide, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-amber-800">{guide.name}</h4>
                    <Button 
                      size="sm" 
                      onClick={() => importSelectedMethods([guide])}
                      className="bg-amber-600 hover:bg-amber-700 text-xs"
                    >
                      Import
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getCategoryColor(guide.category)}>
                      {guide.category}
                    </Badge>
                    <Badge className={getDifficultyColor(guide.difficulty)}>
                      Difficulty {guide.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                      {formatGP(guide.profit)}/hr
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{guide.description}</p>
                  
                  <div className="text-xs text-gray-500">
                    <strong>Requirements:</strong> {guide.requirements.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <p className="text-amber-700">Loading money-making guides...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
