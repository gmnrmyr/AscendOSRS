
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Github, Heart, ExternalLink, Star, Crown } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header with BETA Badge */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.svg" alt="AscendOSRS" className="h-8 w-8" />
            <span className="text-2xl font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              AscendOSRS
            </span>
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">
              BETA
            </Badge>
          </div>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            Ultimate OSRS Progress Tracker - Currently in Beta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Support Section */}
          <Card className="osrs-card p-6 text-center">
            <Coffee className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
            <h3 className="osrs-title text-lg mb-3 text-amber-800 dark:text-amber-200">Support Us</h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
              Enjoying the tracker? Help us keep AscendOSRS running and growing!
            </p>
            <Button 
              className="osrs-button w-full"
              disabled
            >
              <Coffee className="h-4 w-4 mr-2" />
              Support AscendOSRS
            </Button>
          </Card>

          {/* Beta Features Section */}
          <Card className="osrs-card p-6 text-center">
            <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
            <h3 className="osrs-title text-lg mb-3 text-amber-800 dark:text-amber-200">Beta Program</h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
              You're using AscendOSRS in BETA! Help us improve with your feedback.
            </p>
            <Button 
              variant="outline"
              className="osrs-button-secondary w-full"
              disabled
            >
              <Star className="h-4 w-4 mr-2" />
              Beta Feedback
            </Button>
          </Card>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-700 text-center">
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            © 2025 AscendOSRS. Made with ❤️ for the OSRS community. Not affiliated with Jagex or RuneLite.
          </p>
        </div>
      </div>
    </footer>
  );
}
