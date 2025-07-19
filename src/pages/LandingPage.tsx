import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Coffee, Github, ExternalLink, TrendingUp, Shield, Crown, Zap, Star, CheckCircle, Target, Sword, Award, DollarSign } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Modern Header */}
      <header className="w-full py-4 sm:py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-amber-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <img src="/logo.svg" alt="AscendOSRS - Ultimate OSRS Progress Tracker" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                  AscendOSRS
                </span>
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs flex-shrink-0">
                  BETA
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
            >
              <span className="hidden sm:inline">Get Started Free</span>
              <span className="sm:hidden">Get Started<br />Free</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <Crown className="h-12 sm:h-16 w-12 sm:w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-2" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Ultimate OSRS Gear Progression 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500"> Tracker</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto px-2">
              The most comprehensive Old School RuneScape progress tracker for altscape enthusiasts. Master your gear progression from bronze to BiS, manage multiple accounts, track wealth across all your alts, set goals, and dominate your OSRS altscape journey with advanced analytics.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Button 
              onClick={() => window.location.href = '/auth'} 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              <Zap className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              Start Tracking Progress
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-amber-700 text-amber-800 dark:text-amber-400 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              <Star className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              View Features
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Secure Cloud Storage</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Your OSRS data is safely stored in the cloud with automatic backups and version history.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Multi-Account Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Track unlimited OSRS characters, bank values, and progress across all your accounts.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-amber-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Live OSRS Market Data</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time OSRS Grand Exchange prices and automated bank value calculations.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* OSRS Gear Progression Section - NEW SEO CONTENT */}
      <section className="py-16 px-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              🏆 Complete OSRS Gear Progression System
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-8">
              From F2P bronze armor to endgame Twisted Bow, track every step of your Old School RuneScape gear progression across all your altscape accounts. Our comprehensive database includes every weapon, armor piece, and valuable item in OSRS for the ultimate altscape experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300 text-lg">
                  <Sword className="h-5 w-5" />
                  Combat Gear
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• <strong>Weapons:</strong> From bronze sword to Twisted Bow</li>
                  <li>• <strong>Armor:</strong> Bronze to Bandos, Armadyl, Ancestral</li>
                  <li>• <strong>Accessories:</strong> Rings, amulets, capes, boots</li>
                  <li>• <strong>Special Items:</strong> Fire cape, Infernal cape, Void</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-green-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Wealth Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• <strong>Bank Value:</strong> Real-time Grand Exchange prices</li>
                  <li>• <strong>Item Collections:</strong> 3rd Age, Gilded, rare items</li>
                  <li>• <strong>Progress Goals:</strong> Track wealth milestones</li>
                  <li>• <strong>Portfolio View:</strong> Total net worth across accounts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-lg">
                  <Target className="h-5 w-5" />
                  Goal Setting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• <strong>Gear Goals:</strong> Set targets for any OSRS item</li>
                  <li>• <strong>Priority System:</strong> S+, S, A tier prioritization</li>
                  <li>• <strong>Time Estimates:</strong> Calculate hours to completion</li>
                  <li>• <strong>Progress Tracking:</strong> Visual completion indicators</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-lg">
                  <Award className="h-5 w-5" />
                  Account Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• <strong>Regular:</strong> Standard OSRS accounts</li>
                  <li>• <strong>Ironman:</strong> Self-sufficient gameplay tracking</li>
                  <li>• <strong>Hardcore:</strong> High-stakes progression</li>
                  <li>• <strong>Ultimate:</strong> No banking challenge mode</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* OSRS Gear Tiers Breakdown - Enhanced 4-Tier System */}
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              📈 OSRS Gear Progression Tiers - Complete Altscape Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">🥉 Early Game (0-50M GP)</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Dragon weapons, Rune armor, basic accessories. Perfect for new players and F2P progression.</p>
                </div>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Dragon scimitar, Dragon crossbow</li>
                  <li>Rune platebody, Dragon boots</li>
                  <li>Amulet of glory, Combat bracelet</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">🥈 Mid Game (50M-500M GP)</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Whips, Barrows armor, God Wars items. Core progression for serious altscape players.</p>
                </div>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Abyssal whip, Trident of the seas</li>
                  <li>Bandos chestplate, Armadyl crossbow</li>
                  <li>Primordial boots, Fury amulet</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2">🥇 End Game (500M-20B GP)</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Twisted Bow, Scythe, 3rd Age items, high-end raids gear. Ultimate OSRS progression goals for serious players.</p>
                </div>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Twisted Bow, Scythe of Vitur</li>
                  <li>3rd Age items, Avernic defender</li>
                  <li>Infernal cape, Torva armor</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-pink-800 dark:text-pink-200 mb-2">👑 Fashionscape (20B+ GP)</h4>
                  <p className="text-sm text-pink-700 dark:text-pink-300">Complete 3rd Age sets, green stacks of rare items, ultimate altscape flex. The pinnacle of OSRS wealth.</p>
                </div>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Full 3rd Age sets, Green stacks</li>
                  <li>1000+ Party hats, Rare collections</li>
                  <li>Complete rare item collections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white/50 dark:bg-gray-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Everything You Need to Dominate OSRS
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Comprehensive tools for serious OSRS players. Track progress, manage wealth, and optimize your gameplay with advanced analytics and real-time data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Multi-Account OSRS Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Track unlimited OSRS characters and account types
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time stats synchronization from OSRS Hiscores
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Ironman, Hardcore, Ultimate, and Group Ironman support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Comprehensive bank value tracking with GE prices
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Advanced OSRS Goal Setting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Track 3rd Age, Gilded, and all rare OSRS items
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Time-to-completion calculations for any goal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority-based goal management (S+, S, A tiers)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic price updates from OSRS Wiki API
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  OSRS Money Making Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    300+ OSRS money making methods database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    F2P and Members content distinction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    PvM, Skilling, and Trading method categories
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Character-specific method assignment and tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  RuneLite Plugin Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Direct CSV import from RuneLite Data Exporter
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic OSRS item recognition and pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Support for both F2P and Members bank imports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Manual price editing and bulk update tools
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              💎 Choose Your Adventure
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-4">
              Free during BETA! Choose the plan that fits your OSRS journey.
            </p>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-2">
              🎉 FREE BETA ACCESS - Limited Time!
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Free Plan */}
            <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-lg">
                  <Star className="h-5 w-5 text-gray-500" />
                  Free
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">$0</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Forever free during BETA</p>
                </div>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    All core OSRS tracking features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multi-account management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    RuneLite integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    <span className="line-through">No ads (has ads after BETA)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    <span className="line-through">No AI insights</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold px-4 py-2">
                  🔥 MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="pb-3 pt-8">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-lg">
                  <Crown className="h-5 w-5 text-blue-500" />
                  Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">$10</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">per month (Free during BETA)</p>
                </div>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Everything in Free plan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>No ads</strong> - Clean interface
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>AI insights</strong> - Smart recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced analytics
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                >
                  Choose Premium
                </Button>
              </CardContent>
            </Card>

            {/* Founders Plan */}
            <Card className="bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-2">
                  ⚡ FOUNDERS ONLY
                </Badge>
              </div>
              <CardHeader className="pb-3 pt-8">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-lg">
                  <Award className="h-5 w-5 text-purple-500" />
                  Founders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">$299</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Lifetime access</p>
                </div>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>Lifetime Premium</strong> - Forever access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>No ads ever</strong> - Clean forever
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <strong>Founder badge</strong> - Exclusive status
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    VIP support access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Early access to new features
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  Become a Founder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Quick Start Guide */}
        <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">🚀 Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Getting Started:</h4>
                <ol className="list-decimal ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Sign up for your free account</li>
                  <li>Add your OSRS characters</li>
                  <li>Import bank data from RuneLite</li>
                  <li>Set your money making methods</li>
                  <li>Track your progress to greatness!</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pro Tips:</h4>
                <ul className="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Use RuneLite's Data Exporter plugin</li>
                  <li>Set realistic hours/day for accurate calculations</li>
                  <li>Prioritize high-value goals first</li>
                  <li>Update prices regularly for accuracy</li>
                  <li>Save to cloud for multi-device access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RuneLite Integration */}
        <Card className="bg-white/80 dark:bg-gray-800/80 border-amber-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">🔗 RuneLite CSV Import</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Seamlessly import your bank data using RuneLite's Data Exporter plugin. Supports both F2P and Members accounts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">F2P Example:</span>
                <pre className="bg-gray-100 dark:bg-gray-900 rounded p-3 text-xs mt-2 overflow-x-auto border border-gray-200 dark:border-gray-700">{`[
  {"id":8013,"quantity":50,"name":"Teleport to house"},
  {"id":995,"quantity":207558926,"name":"Coins"}
]`}</pre>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Members Example:</span>
                <pre className="bg-gray-100 dark:bg-gray-900 rounded p-3 text-xs mt-2 overflow-x-auto border border-gray-200 dark:border-gray-700">{`[
  {"id":12791,"quantity":1,"name":"Rune pouch"},
  {"id":20997,"quantity":1,"name":"Twisted bow"},
  {"id":995,"quantity":100000000,"name":"Coins"}
]`}</pre>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-4">
              💡 Items are automatically recognized and priced using live OSRS market data.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-700 dark:to-yellow-700">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Crown className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'MedievalSharp, cursive' }}>
              Ready to Ascend?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of OSRS players and altscape enthusiasts who are already dominating their progress with AscendOSRS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/auth'} 
                size="lg"
                className="bg-white text-amber-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-black dark:text-white hover:bg-white/20 hover:text-black dark:hover:text-amber-600 px-8 py-4 text-lg"
              >
                <Star className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.svg" alt="AscendOSRS" className="h-8 w-8" />
              <span className="text-xl font-bold" style={{ fontFamily: 'MedievalSharp, cursive' }}>
                AscendOSRS
              </span>
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs ml-2">
                BETA
              </Badge>
            </div>
            <p className="text-gray-400 mb-6">
              Ultimate OSRS Progress Tracker - Currently in Beta
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Features
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Support Us
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} AscendOSRS. Not affiliated with Jagex or RuneLite.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
