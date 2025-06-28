
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { MethodCard } from "./MethodCard";

interface MethodsListProps {
  methods: any[];
  onDeleteMethod: (id: string) => void;
}

export function MethodsList({ methods, onDeleteMethod }: MethodsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [characterFilter, setCharacterFilter] = useState("all");

  const filteredMethods = methods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.character.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || method.category === categoryFilter;
    const matchesCharacter = characterFilter === "all" || method.character === characterFilter;
    
    return matchesSearch && matchesCategory && matchesCharacter;
  });

  const characters = [...new Set(methods.map(method => method.character))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Money Making Methods ({filteredMethods.length})
        </CardTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search methods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="combat">Combat</SelectItem>
              <SelectItem value="skilling">Skilling</SelectItem>
              <SelectItem value="bossing">Bossing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={characterFilter} onValueChange={setCharacterFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Characters</SelectItem>
              {characters.map((character) => (
                <SelectItem key={character} value={character}>
                  {character}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredMethods.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {methods.length === 0 
              ? "No money making methods added yet. Add your first method above!"
              : "No methods match your current filters."
            }
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMethods.map((method) => (
              <MethodCard
                key={method.id}
                method={method}
                onDelete={onDeleteMethod}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
