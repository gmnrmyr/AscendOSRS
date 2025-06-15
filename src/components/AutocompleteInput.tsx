
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AutocompleteOption {
  id: string | number;
  name: string;
  subtitle?: string;
  icon?: string;
  value?: number;
  category?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  searchFunction: (query: string) => Promise<AutocompleteOption[]>;
  className?: string;
  minSearchLength?: number;
}

export function AutocompleteInput({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Start typing...", 
  searchFunction,
  className = "",
  minSearchLength = 2
}: AutocompleteInputProps) {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchItems = async () => {
      if (value.length < minSearchLength) {
        setOptions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchFunction(value);
        setOptions(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setOptions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchItems, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, searchFunction, minSearchLength]);

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setOptions([]);
    onSelect?.(option);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          handleSelect(options[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= minSearchLength && options.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={className}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {showDropdown && options.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-0">
            {options.map((option, index) => (
              <div
                key={option.id}
                className={`p-3 cursor-pointer hover:bg-amber-50 border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-amber-50' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <img 
                      src={option.icon} 
                      alt={option.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-amber-800">{option.name}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500">{option.subtitle}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {option.category && (
                      <Badge variant="outline" className="text-xs">
                        {option.category}
                      </Badge>
                    )}
                    {option.value && (
                      <Badge variant="outline" className="text-xs text-green-700">
                        {formatValue(option.value)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
