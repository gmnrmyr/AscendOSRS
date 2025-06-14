
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Swords, Crown } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in to your OSRS tracker"
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, username);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 flex items-center justify-center p-6"
         style={{
           backgroundImage: `
             radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(160, 82, 45, 0.1) 0%, transparent 50%),
             url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d2691e' fill-opacity='0.03'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5h2V20h18v2H22v18h-2v-20zM0 18h18v2H0v-2zm22 2h18v2H22v-2z'/%3E%3C/g%3E%3C/svg%3E")
           `
         }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-amber-800" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              OSRS Tracker
            </h1>
            <Swords className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-amber-700 text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
            Track thy RuneScape journey
          </p>
        </div>

        <Card className="osrs-card border-amber-600">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-amber-800" 
                       style={{ fontFamily: 'MedievalSharp, cursive' }}>
              <Shield className="h-5 w-5" />
              ⚔️ Enter the Realm ⚔️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="osrs-tabs grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="osrs-tab">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="osrs-tab">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email" className="text-amber-800 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="osrs-input"
                      placeholder="your.email@domain.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password" className="text-amber-800 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="osrs-input"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full osrs-btn-primary"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    {loading ? '🔄 Signing In...' : '⚔️ Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-username" className="text-amber-800 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                      Username (Optional)
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="osrs-input"
                      placeholder="Your adventurer name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email" className="text-amber-800 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="osrs-input"
                      placeholder="your.email@domain.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password" className="text-amber-800 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="osrs-input"
                      placeholder="Create a strong password"
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full osrs-btn-primary"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    {loading ? '🔄 Creating Account...' : '👑 Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-amber-600" style={{ fontFamily: 'Cinzel, serif' }}>
            🏰 Your data will be securely stored and synced across devices 🏰
          </p>
        </div>
      </div>
    </div>
  );
}
