
import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, TrendingUp, Menu, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ModernNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ModernNavbar({ activeTab, onTabChange }: ModernNavbarProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "summary", label: "Summary" },
    { id: "characters", label: "Characters" },
    { id: "methods", label: "Methods" },
    { id: "goals", label: "Goals" },
    { id: "bank", label: "Bank" },
    { id: "data", label: "Data" },
  ];

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out"
    });
  };

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 navbar-blur transition-transform duration-300 ${
        isVisible ? 'navbar-visible' : 'navbar-hidden'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="pixel-card p-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">OSRS Tracker</h1>
                <p className="text-xs text-gray-600">Money Making Dashboard</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  variant="ghost"
                  className={`pixel-tab ${
                    activeTab === item.id ? 'bg-gray-900 text-white' : 'bg-transparent'
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-gray-900">
                  <AvatarFallback className="bg-green-500 text-white font-bold">
                    {getUserInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <Badge className="pixel-badge text-xs">
                    {user?.email}
                  </Badge>
                </div>
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="pixel-button hidden sm:flex"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="lg:hidden pixel-button"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  variant="ghost"
                  className={`w-full justify-start pixel-tab ${
                    activeTab === item.id ? 'bg-gray-900 text-white' : 'bg-transparent'
                  }`}
                >
                  {item.label}
                </Button>
              ))}
              
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-gray-900">
                    <AvatarFallback className="bg-green-500 text-white font-bold">
                      {getUserInitials(user?.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="pixel-badge text-xs">
                    {user?.email}
                  </Badge>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="pixel-button"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
