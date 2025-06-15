
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrendingUp, Menu, Users, Coins, Target, PiggyBank, Settings } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "summary", label: "📊 Summary", icon: TrendingUp },
    { id: "characters", label: "👥 Characters", icon: Users },
    { id: "methods", label: "💰 Methods", icon: Coins },
    { id: "goals", label: "🎯 Goals", icon: Target },
    { id: "bank", label: "🏦 Bank", icon: PiggyBank },
    { id: "data", label: "⚙️ Data", icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div className="osrs-tabs grid grid-cols-6 w-full max-w-4xl p-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`osrs-tab flex items-center gap-2 ${
                activeTab === item.id ? 'bg-amber-200 text-amber-900' : ''
              }`}
              variant="ghost"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="osrs-button-secondary">
              <Menu className="h-5 w-5" />
              <span className="ml-2">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-amber-50">
            <div className="mt-6 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full justify-start osrs-tab flex items-center gap-3 ${
                    activeTab === item.id ? 'bg-amber-200 text-amber-900' : ''
                  }`}
                  variant="ghost"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
