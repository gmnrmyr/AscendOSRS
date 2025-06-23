
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, Heart, Star, CheckCircle, Clock, Mail, Wallet } from "lucide-react";

export function BuyUsACoffee() {
  const currentFeatures = [
    "Character Management with stats tracking",
    "Money-making methods database with GP/hour calculations", 
    "Purchase goals tracking with live OSRS Wiki prices",
    "Bank value tracking with CSV import from RuneLite",
    "Progress tracking with goal completion percentages",
    "Gold & Platinum token management",
    "Real-time earnings calculations",
    "Multiple character support",
    "Data persistence with cloud sync",
    "Responsive design for mobile and desktop"
  ];

  const upcomingFeatures = [
    "GE tracking integration",
    "Portfolio optimization recommendations",
    "Advanced analytics and charts",
    "Group ironman support",
    "Achievement tracking",
    "Market trend analysis",
    "Push notifications for goals",
    "API integrations with more OSRS tools",
    "Export/import functionality",
    "Custom themes and layouts"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/10 dark:to-orange-900/10 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="h-12 w-12 text-amber-600" />
            <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Support Our Project
            </h1>
          </div>
          <p className="text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto" style={{ fontFamily: 'Cinzel, serif' }}>
            Help us continue developing the ultimate OSRS wealth management tool! Your support keeps this project free and constantly improving.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buy Me a Coffee */}
          <Card className="osrs-card bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-600">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-800">
                <Coffee className="h-6 w-6" />
                Buy Us a Coffee
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-amber-700" style={{ fontFamily: 'Cinzel, serif' }}>
                Support us with a one-time donation to keep the servers running and fuel our development!
              </p>
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6"
                onClick={() => window.open('https://buymeacoffee.com', '_blank')}
              >
                <Heart className="h-4 w-4 mr-2" />
                Buy Me a Coffee
              </Button>
            </CardContent>
          </Card>

          {/* Crypto Donations */}
          <Card className="osrs-card bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-600">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
                <Wallet className="h-6 w-6" />
                Crypto Donations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-blue-700" style={{ fontFamily: 'Cinzel, serif' }}>
                Prefer crypto? Send donations to our project wallet:
              </p>
              <div className="bg-blue-50 p-3 rounded border-2 border-blue-300">
                <code className="text-sm text-blue-800 break-all">
                  1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2
                </code>
              </div>
              <p className="text-xs text-blue-600">Bitcoin (BTC) address</p>
            </CardContent>
          </Card>
        </div>

        {/* PayPal Option */}
        <Card className="osrs-card bg-gradient-to-br from-purple-100 to-pink-100 border-purple-600">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-purple-800">
              <Mail className="h-6 w-6" />
              PayPal Donations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-purple-700" style={{ fontFamily: 'Cinzel, serif' }}>
              PayPal donations will be available soon! Check back later.
            </p>
            <div className="bg-purple-50 p-3 rounded border-2 border-purple-300">
              <code className="text-sm text-purple-800">
                comingsoon@comingsoon.com
              </code>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>

        {/* Current Features */}
        <Card className="osrs-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <CheckCircle className="h-6 w-6 text-green-600" />
              What's Already Built
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-sm" style={{ fontFamily: 'Cinzel, serif' }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features */}
        <Card className="osrs-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Clock className="h-6 w-6 text-blue-600" />
              What's Coming Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-800 text-sm" style={{ fontFamily: 'Cinzel, serif' }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thank You */}
        <Card className="osrs-card bg-gradient-to-r from-green-100 to-emerald-100 border-green-600">
          <CardContent className="text-center py-8">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Thank You for Your Support!
            </h3>
            <p className="text-green-700 max-w-2xl mx-auto" style={{ fontFamily: 'Cinzel, serif' }}>
              Every donation, no matter how small, helps us dedicate more time to improving this tool. 
              We're committed to keeping it free and open for the entire OSRS community!
            </p>
          </CardContent>
        </Card>

        {/* Back to App */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-amber-600 text-amber-700 hover:bg-amber-50"
          >
            ← Back to App
          </Button>
        </div>
      </div>
    </div>
  );
}
