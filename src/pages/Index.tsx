import { useState } from "react";
import { ModernNavbar } from "@/components/ModernNavbar";
import { SummaryNavbar } from "@/components/SummaryNavbar";
import { Footer } from "@/components/Footer";
import { AppStateProvider } from "@/components/AppStateProvider";
import { HoursPerDayInput } from "@/components/HoursPerDayInput";
import { MainDashboard } from "@/components/MainDashboard";

const IndexContent = () => {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <AppStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ModernNavbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Summary Navbar - Always visible and sticky */}
        <SummaryNavbar onTabChange={setActiveTab} />

        {/* Add top padding to account for fixed navbar */}
        <div className="pt-20">
          <div className="container mx-auto p-6 space-y-8">
            {/* Hours per day setting */}
            <HoursPerDayInput />

            {/* Main Dashboard */}
            <MainDashboard activeTab={activeTab} />
          </div>
        </div>

        <Footer />
      </div>
    </AppStateProvider>
  );
};

const Index = () => {
  // Local-first: sem login. App roda 100% local (disco no Mac). Auth/nuvem desativados.
  return <IndexContent />;
};

export default Index;
