
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out"
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="osrs-card p-6 flex-1 mr-4">
                  <h1 className="text-5xl font-bold text-amber-800 flex items-center gap-3 mb-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
            <img src="/logo.svg" alt="AscendOSRS" className="h-12 w-12" />
            ⚔️ AscendOSRS ⚔️
          </h1>
        <p className="text-amber-700 text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
          🏰 Track thy Old School RuneScape progress, gold-making methods, and purchase goals 🏰
        </p>
        <div className="mt-3 flex items-center gap-2 text-amber-600">
          <User className="h-4 w-4" />
          <span className="text-sm">Current User:</span>
          <Badge className="osrs-badge">{user?.email}</Badge>
        </div>
      </div>
      
      <div className="osrs-card p-4">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="flex items-center gap-2 border-amber-600 text-amber-800 hover:bg-amber-100"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
