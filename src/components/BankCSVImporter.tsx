
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Clipboard, CheckCircle, AlertTriangle, Info, ExternalLink, Copy } from "lucide-react";
import { osrsApi } from "@/services/osrsApi";

interface BankCSVImporterProps {
  onImportBank: (bankItems: Array<{name: string; quantity: number; value: number}>) => void;
  characters: any[];
}

// Enhanced format detection
const detectDataFormat = (data: string): { format: 'json' | 'csv' | 'unknown'; confidence: number; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    // Try JSON first
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const firstItem = parsed[0];
      if (firstItem && typeof firstItem === 'object' && firstItem.name && firstItem.quantity) {
        return { format: 'json', confidence: 0.95, errors: [] };
      }
    }
    errors.push("JSON format detected but doesn't match expected RuneLite structure");
  } catch (e) {
    // Not JSON, try CSV
    const lines = data.trim().split('\n');
    if (lines.length >= 2) {
      const headers = lines[0].toLowerCase();
      if (headers.includes('name') && headers.includes('quantity')) {
        return { format: 'csv', confidence: 0.8, errors: [] };
      }
      errors.push("CSV format detected but missing required 'name' and 'quantity' columns");
    } else {
      errors.push("Data has too few lines to be valid CSV");
    }
  }
  
  return { format: 'unknown', confidence: 0, errors };
};

// Enhanced sample data
const SAMPLE_DATA = {
  json: `[
  {"id":995,"quantity":50000000,"name":"Coins"},
  {"id":20997,"quantity":1,"name":"Twisted bow"},
  {"id":12791,"quantity":1,"name":"Rune pouch"},
  {"id":995,"quantity":100000000,"name":"Coins"}
]`,
  csv: `name,quantity,value
Twisted bow,1,1200000000
Bandos chestplate,1,25000000
Coins,50000000,1`
};

export function BankCSVImporter({ onImportBank, characters }: BankCSVImporterProps) {
  const [csvText, setCsvText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<{ format: string; confidence: number; errors: string[] } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (text.trim()) {
      const detection = detectDataFormat(text);
      setDetectedFormat(detection);
    } else {
      setDetectedFormat(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "⚠️ File Too Large",
        description: "File must be smaller than 5MB. Large banks should use the main Bank section for import.",
        variant: "destructive",
        duration: 8000
      });
      return;
    }

    try {
      const text = await file.text();
      handleTextChange(text);
      
      toast({
        title: "📁 File Loaded Successfully",
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        duration: 4000
      });
    } catch (error) {
      console.error('File read error:', error);
      toast({
        title: "❌ File Read Error",
        description: "Failed to read the file. Please ensure it's a valid text file.",
        variant: "destructive",
        duration: 6000
      });
    }
  };

  const processCSVData = async () => {
    if (!csvText.trim()) {
      toast({
        title: "⚠️ No Data Provided",
        description: "Please provide CSV data by pasting text or uploading a file",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    // Validate format before processing
    const detection = detectDataFormat(csvText);
    if (detection.format === 'unknown') {
      toast({
        title: "❌ Invalid Format",
        description: `Could not detect valid format:\n${detection.errors.join('\n')}`,
        variant: "destructive",
        duration: 8000
      });
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      console.log('🔄 Processing import data...');
      console.log('Detected format:', detection.format);
      
      // Show processing feedback
      toast({
        title: "🔄 Processing Import",
        description: `Parsing ${detection.format.toUpperCase()} data...`,
        duration: 3000
      });
      
      const parsedItems = await osrsApi.parseBankCSV(csvText);
      const processingTime = Date.now() - startTime;
      
      console.log(`📊 Parsed ${parsedItems.length} items in ${processingTime}ms`);
      
      if (parsedItems.length === 0) {
        toast({
          title: "⚠️ No Valid Items Found",
          description: "The data was parsed but no valid items were found. Check the format and try again.",
          variant: "destructive",
          duration: 8000
        });
        return;
      }

      // Validate items and provide feedback
      const validItems = parsedItems.filter(item => item.name && item.quantity > 0);
      const invalidItems = parsedItems.length - validItems.length;
      
      if (invalidItems > 0) {
        console.warn(`⚠️ ${invalidItems} invalid items were skipped`);
      }

      onImportBank(validItems);
      setCsvText("");
      setDetectedFormat(null);
      
      // Enhanced success feedback
      const totalValue = validItems.reduce((sum, item) => sum + (item.value || 0), 0);
      const formatValue = (value: number) => {
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toLocaleString();
      };

      toast({
        title: "✅ Import Successful!",
        description: `Imported ${validItems.length} items${invalidItems > 0 ? ` (${invalidItems} invalid items skipped)` : ''}\n💰 Total value: ${formatValue(totalValue)} GP\n⚡ Processed in ${processingTime}ms`,
        duration: 8000
      });
    } catch (error) {
      console.error('💥 Import processing error:', error);
      
      // Enhanced error classification
      let errorTitle = "❌ Import Failed";
      let errorMessage = "Failed to process the data. Please check the format.";
      
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorTitle = "🔧 JSON Format Error";
          errorMessage = "Invalid JSON format. Ensure the data is properly formatted RuneLite export.";
        } else if (error.message.includes('CSV')) {
          errorTitle = "📊 CSV Format Error";
          errorMessage = "Invalid CSV format. Ensure columns are properly separated and named.";
        } else if (error.message.includes('column')) {
          errorTitle = "📋 Missing Columns";
          errorMessage = "Required columns (name, quantity) are missing from the data.";
        }
      }
      
      toast({
        title: errorTitle,
        description: `${errorMessage}\n\n💡 Try:\n• Check the data format\n• Use the sample format below\n• Ensure proper column names`,
        variant: "destructive",
        duration: 12000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 Copied to Clipboard",
        description: "Sample data copied! You can now paste it into the text area to test.",
        duration: 3000
      });
    } catch (error) {
      console.error('Clipboard error:', error);
      toast({
        title: "⚠️ Clipboard Error",
        description: "Could not copy to clipboard. You can manually copy the sample data.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-indigo-800 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            🔗 RuneLite Bank Import
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300"
          >
            <Info className="h-4 w-4 mr-1" />
            {showInstructions ? 'Hide' : 'Show'} Guide
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Instructions */}
        {showInstructions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              📖 RuneLite Setup Guide
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-semibold text-blue-700 dark:text-blue-300">🔧 Setup Steps:</h5>
                <ol className="list-decimal ml-4 space-y-1 text-blue-600 dark:text-blue-400">
                  <li>Install RuneLite if you haven't already</li>
                  <li>Enable the "Data Export" plugin in Plugin Hub</li>
                  <li>Log into your OSRS account</li>
                  <li>Open your bank in-game</li>
                  <li>Use the plugin to export bank data</li>
                  <li>Copy the exported data and paste it below</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-semibold text-blue-700 dark:text-blue-300">✅ Supported Formats:</h5>
                <ul className="list-disc ml-4 space-y-1 text-blue-600 dark:text-blue-400">
                  <li><strong>RuneLite Data Exporter</strong> (JSON) - Recommended</li>
                  <li><strong>CSV Format</strong> - name, quantity, value columns</li>
                  <li><strong>Custom JSON</strong> - name and quantity fields</li>
                </ul>
                
                <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 rounded text-xs">
                  <strong>💡 Pro tip:</strong> RuneLite's Data Exporter provides the most accurate data with item IDs and exact quantities.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Upload Section */}
        <div className="space-y-3">
          <div>
            <Label className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              📁 Upload RuneLite Export File
            </Label>
            <Input
              type="file"
              accept=".csv,.txt,.json"
              onChange={handleFileUpload}
              className="bg-white dark:bg-slate-800 mt-1"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Supports .csv, .txt, and .json files up to 5MB
            </p>
          </div>

          <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span>or</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <div>
            <Label className="flex items-center gap-2 font-medium">
              <Clipboard className="h-4 w-4" />
              📋 Paste Export Data
            </Label>
            <Textarea
              placeholder="Paste your RuneLite export data here..."
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="bg-white dark:bg-slate-800 mt-1 font-mono text-sm"
            />
            
            {/* Format Detection Feedback */}
            {detectedFormat && (
              <div className="mt-2 flex items-center gap-2">
                {detectedFormat.format !== 'unknown' ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {detectedFormat.format.toUpperCase()} format detected ({Math.round(detectedFormat.confidence * 100)}% confidence)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Unknown format</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sample Data Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            📝 Sample Formats (Click to Copy):
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">RuneLite JSON Format:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(SAMPLE_DATA.json)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 rounded p-2 text-xs overflow-x-auto border">
                {SAMPLE_DATA.json}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">CSV Format:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(SAMPLE_DATA.csv)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 rounded p-2 text-xs overflow-x-auto border">
                {SAMPLE_DATA.csv}
              </pre>
            </div>
          </div>
        </div>

        {/* Enhanced Status Messages */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Format Detection
            </Badge>
            <span>Automatically detects RuneLite JSON and CSV formats</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Price Lookup
            </Badge>
            <span>Items are matched with live OSRS market data when available</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Smart Filtering
            </Badge>
            <span>Invalid items are automatically filtered out with detailed feedback</span>
          </div>
        </div>

        {/* Enhanced Import Button */}
        <Button 
          onClick={processCSVData} 
          disabled={isProcessing || !csvText.trim()}
          className={`w-full font-semibold text-lg py-3 ${
            detectedFormat?.format !== 'unknown' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
              : 'bg-gray-400 hover:bg-gray-500'
          } text-white`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              🚀 Import Bank Data
              {detectedFormat?.format !== 'unknown' && (
                <Badge className="bg-white/20 text-white text-xs ml-2">
                  {detectedFormat.format.toUpperCase()}
                </Badge>
              )}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
