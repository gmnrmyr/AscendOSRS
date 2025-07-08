
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coffee, Github, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Support Section */}
          <Card className="osrs-card p-6 text-center">
            <Coffee className="h-8 w-8 text-amber-600 mx-auto mb-3" />
            <h3 className="osrs-title text-lg mb-3">Support Us</h3>
            <p className="text-amber-700 text-sm mb-4">
              Enjoying the tracker? Buy us a coffee to keep the servers running!
            </p>
            <Button 
              className="osrs-button w-full"
              disabled
            >
              <Coffee className="h-4 w-4 mr-2" />
              Support AscendOSRS
            </Button>
          </Card>

          {/* Open Source Section */}
          <Card className="osrs-card p-6 text-center">
            <Github className="h-8 w-8 text-amber-600 mx-auto mb-3" />
            <h3 className="osrs-title text-lg mb-3">Open Source</h3>
            <p className="text-amber-700 text-sm mb-4">
              This project is open source! Contribute, report bugs, or suggest features.
            </p>
            <Button 
              variant="outline"
              className="osrs-button-secondary w-full"
              disabled
            >
              <Github className="h-4 w-4 mr-2" />
              Open Source
            </Button>
          </Card>

          {/* Community Section */}
          <Card className="osrs-card p-6 text-center">
            <Heart className="h-8 w-8 text-amber-600 mx-auto mb-3" />
            <h3 className="osrs-title text-lg mb-3">Community</h3>
            <p className="text-amber-700 text-sm mb-4">
              Join our community for updates, tips, and discussions about OSRS tracking.
            </p>
            <Button 
              variant="outline"
              className="osrs-button-secondary w-full"
              disabled
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Community Hub
            </Button>
          </Card>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-amber-200 text-center">
          <p className="text-amber-700 text-sm">
            © 2025 AscendOSRS. Made with ❤️ for the OSRS community.
          </p>
        </div>
      </div>
    </footer>
  );
}
