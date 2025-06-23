
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { ModernNavbar } from "@/components/ModernNavbar";
import { SummaryNavbar } from "@/components/SummaryNavbar";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { AppStateProvider } from "@/components/AppStateProvider";
import { HoursPerDayInput } from "@/components/HoursPerDayInput";
import { MainDashboard } from "@/components/MainDashboard";
import { useAppState } from "@/components/AppStateProvider";

const IndexContent = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { hoursPerDay, setHoursPerDay } = useAppState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <ModernNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Summary Navbar - Always visible and sticky */}
      <SummaryNavbar />
      
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-20">
        <div className="container mx-auto p-6 space-y-8">
          {/* Hours per day setting */}
          <HoursPerDayInput hoursPerDay={hoursPerDay} setHoursPerDay={setHoursPerDay} />

          {/* Ad Banner */}
          <div className="flex justify-center">
            <AdBanner size="banner" />
          </div>

          {/* Main Dashboard */}
          <MainDashboard activeTab={activeTab} />

          {/* Side Ad for larger screens */}
          <div className="hidden xl:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
            <AdBanner size="skyscraper" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const Index = () => {
  return (
    <AuthGuard>
      <AppStateProvider>
        <IndexContent />
      </AppStateProvider>
    </AuthGuard>
  );
};

export default Index;
