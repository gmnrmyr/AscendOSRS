import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Coffee, Github, ExternalLink, TrendingUp } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex flex-col">
      <header className="w-full py-8 bg-gradient-to-r from-amber-200 to-yellow-100 shadow">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">OSRS Alt Tracker</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = '/auth'}>Sign In / Register</Button>
            <Button variant="outline" onClick={() => window.open('https://github.com/osrstracker/dashboard', '_blank')}>
              <Github className="h-4 w-4 mr-2" /> GitHub
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col gap-8">
        <Card className="osrs-card">
          <CardHeader>
            <CardTitle>Welcome to OSRS Alt Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg text-amber-900">
              The all-in-one dashboard for managing your Old School RuneScape accounts, money making, goals, and bank value. Designed for alt account managers and single-account players alike.
            </p>
            <ul className="list-disc ml-6 text-amber-800 space-y-1">
              <li>Track multiple characters, stats, and bank values</li>
              <li>Save and load your data securely in the cloud</li>
              <li>Comprehensive money making methods (F2P & Members)</li>
              <li>Set and track item goals (3rd Age, Gilded, rare pets, more)</li>
              <li>Import your bank from RuneLite CSV exports</li>
              <li>Manual and automatic price refresh</li>
              <li>Open source, privacy-first, and free to use</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="osrs-card">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal ml-6 text-amber-800 space-y-1">
              <li>Sign in or register (no email spam, open source auth)</li>
              <li>Add your characters and set hours/day</li>
              <li>Import your bank using RuneLite's Data Exporter plugin</li>
              <li>Set your money making methods and goals</li>
              <li>Save to the cloud and access from any device</li>
            </ol>
          </CardContent>
        </Card>
        <Card className="osrs-card">
          <CardHeader>
            <CardTitle>CSV Import Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-amber-900">Supports both F2P and Member account exports from RuneLite:</p>
            <Separator className="my-2" />
            <div className="mb-2">
              <span className="font-semibold">F2P Example:</span>
              <pre className="bg-amber-100 rounded p-2 text-xs mt-1 overflow-x-auto">{`[
  {"id":8013,"quantity":50,"name":"Teleport to house (Members)"},
  {"id":995,"quantity":207558926,"name":"Coins"}
]`}</pre>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Member Example:</span>
              <pre className="bg-amber-100 rounded p-2 text-xs mt-1 overflow-x-auto">{`[
  {"id":12791,"quantity":1,"name":"Rune pouch"},
  {"id":20997,"quantity":1,"name":"Twisted bow"},
  {"id":27235,"quantity":1,"name":"Masori mask (f)"},
  {"id":995,"quantity":100000000,"name":"Coins"}
]`}</pre>
            </div>
            <p className="text-amber-800 text-sm mt-2">Imported items sync with price refresh and goals system. Unknown items are handled gracefully.</p>
          </CardContent>
        </Card>
        <Card className="osrs-card">
          <CardHeader>
            <CardTitle>Features & Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 text-amber-800 space-y-1">
              <li>Comprehensive money making methods (auto-updated from OSRS Wiki)</li>
              <li>All high-value items and rare pets as goals</li>
              <li>Member vs F2P content distinction and filtering</li>
              <li>Manual price editing and robust price refresh</li>
              <li>Thumbnails for all items and methods</li>
              <li>Open source, community-driven development</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => window.open('https://github.com/osrstracker/dashboard', '_blank')}>
                <Github className="h-4 w-4 mr-2" /> GitHub
              </Button>
              <Button variant="outline" onClick={() => window.open('https://discord.gg/osrstracker', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" /> Discord
              </Button>
              <Button variant="outline" onClick={() => window.open('https://buymeacoffee.com/osrstracker', '_blank')}>
                <Coffee className="h-4 w-4 mr-2" /> Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-8 bg-gradient-to-r from-amber-100 to-yellow-50 text-center text-amber-700 text-sm">
        &copy; {new Date().getFullYear()} OSRS Alt Tracker. Open source. Not affiliated with Jagex or RuneLite.
      </footer>
    </div>
  );
}
