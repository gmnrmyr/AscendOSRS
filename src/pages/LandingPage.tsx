import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Coffee, Github, ExternalLink, TrendingUp, Shield, Crown, Zap, Star, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Modern Header */}
      <header className="w-full py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-amber-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AscendOSRS" className="h-10 w-10" />
            <div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                AscendOSRS
              </span>
              <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">
                BETA
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={() => window.location.href = '/auth'} className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold">
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="mb-6">
            <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Ascend to OSRS 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500"> Greatness</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate progress tracker for Old School RuneScape. Manage multiple accounts, track wealth, set goals, and dominate your OSRS journey.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => window.location.href = '/auth'} 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold px-8 py-4 text-lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Tracking Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-amber-700 text-amber-800 dark:text-amber-400 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950 px-8 py-4 text-lg"
            >
              <Star className="mr-2 h-5 w-5" />
              View Features
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Secure Cloud Storage</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Your data is safely stored in the cloud with automatic backups and version history.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Multi-Account Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Track unlimited characters, bank values, and progress across all your OSRS accounts.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Live Market Data</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time OSRS market prices and automated bank value calculations.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50 dark:bg-gray-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Everything You Need to Dominate OSRS
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Comprehensive tools for serious OSRS players. Track progress, manage wealth, and optimize your gameplay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Multi-Account Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Track unlimited characters and account types
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time stats synchronization from OSRS APIs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Ironman, Hardcore, and Ultimate account support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Comprehensive bank value tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Advanced Goal Setting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Track 3rd Age, Gilded, and rare item goals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Time-to-completion calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority-based goal management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic price updates from OSRS Wiki
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Money Making Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    300+ money making methods database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    F2P and Members content distinction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Click intensity and profitability ratings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Character-specific method assignment
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  RuneLite Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Direct CSV import from RuneLite Data Exporter
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic item recognition and pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Support for both F2P and Members banks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Manual price editing and bulk updates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Quick Start Guide */}
        <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">🚀 Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Getting Started:</h4>
                <ol className="list-decimal ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Sign up for your free account</li>
                  <li>Add your OSRS characters</li>
                  <li>Import bank data from RuneLite</li>
                  <li>Set your money making methods</li>
                  <li>Track your progress to greatness!</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pro Tips:</h4>
                <ul className="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Use RuneLite's Data Exporter plugin</li>
                  <li>Set realistic hours/day for accurate calculations</li>
                  <li>Prioritize high-value goals first</li>
                  <li>Update prices regularly for accuracy</li>
                  <li>Save to cloud for multi-device access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RuneLite Integration */}
        <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">🔗 RuneLite CSV Import</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Seamlessly import your bank data using RuneLite's Data Exporter plugin. Supports both F2P and Members accounts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">F2P Example:</span>
                <pre className="bg-gray-100 dark:bg-gray-900 rounded p-3 text-xs mt-2 overflow-x-auto border border-gray-200 dark:border-gray-700">{`[
  {"id":8013,"quantity":50,"name":"Teleport to house"},
  {"id":995,"quantity":207558926,"name":"Coins"}
]`}</pre>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Members Example:</span>
                <pre className="bg-gray-100 dark:bg-gray-900 rounded p-3 text-xs mt-2 overflow-x-auto border border-gray-200 dark:border-gray-700">{`[
  {"id":12791,"quantity":1,"name":"Rune pouch"},
  {"id":20997,"quantity":1,"name":"Twisted bow"},
  {"id":995,"quantity":100000000,"name":"Coins"}
]`}</pre>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-4">
              💡 Items are automatically recognized and priced using live OSRS market data.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-700 dark:to-yellow-700">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Crown className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Ready to Ascend?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of OSRS players who are already dominating their progress with AscendOSRS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/auth'} 
                size="lg"
                className="bg-white text-amber-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 hover:text-amber-600 px-8 py-4 text-lg"
              >
                <Star className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.svg" alt="AscendOSRS" className="h-8 w-8" />
              <span className="text-xl font-bold" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                AscendOSRS
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Ultimate OSRS Progress Tracker
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Features
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Support
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Community
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} AscendOSRS. Not affiliated with Jagex or RuneLite.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
