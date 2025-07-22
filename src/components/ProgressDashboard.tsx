import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Calendar, Users, Trophy, DollarSign, Coins } from 'lucide-react';
import { ProgressTracker, WealthData, ProgressMetrics } from '@/services/progressTracker';
import { useToast } from '@/hooks/use-toast';

export function ProgressDashboard() {
  const [wealthHistory, setWealthHistory] = useState<WealthData[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const history = await ProgressTracker.getWealthHistory();
      const progressMetrics = ProgressTracker.calculateMetrics(history);
      const performers = ProgressTracker.getTopPerformers(history);

      setWealthHistory(history);
      setMetrics(progressMetrics);
      setTopPerformers(performers);
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: "Progress Data Unavailable",
        description: "No progress snapshots found yet. Data will appear after your first few saves.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-32">
              <CardContent className="p-6 flex items-center justify-center">
                <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!wealthHistory.length) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
        </div>
        <Card className="text-center p-12">
          <CardContent>
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Progress Data Yet</h2>
            <p className="text-muted-foreground mb-4">
              Your progress will be tracked automatically as you save your character data.
              Make a few saves with different wealth amounts to see your progress charts here.
            </p>
            <Badge variant="outline">Save your data to start tracking!</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <Badge variant="secondary">{wealthHistory.length} snapshots</Badge>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Growth</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{formatGP(metrics.totalGrowth)}
              </div>
              <p className="text-xs text-muted-foreground">
                Since tracking started
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.dailyAverage >= 0 ? '+' : ''}{formatGP(metrics.dailyAverage)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per day growth rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Character</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {metrics.bestCharacter.name || 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                +{formatGP(metrics.bestCharacter.growth)} growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.consistencyScore.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Progress consistency
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Wealth Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Wealth Over Time</CardTitle>
              <CardDescription>
                Your total wealth progression including gold, plat tokens, and bank value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={wealthHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis tickFormatter={formatGP} />
                  <Tooltip 
                    formatter={(value: number) => [`${formatGP(value)} GP`, 'Total Wealth']}
                    labelFormatter={formatDate}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalWealth" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Best & Worst Days */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Best Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{formatGP(metrics.bestDay.growth)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(metrics.bestDay.date)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Worst Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatGP(metrics.worstDay.growth)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(metrics.worstDay.date)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="characters" className="space-y-4">
          {/* Character Performance */}
          {topPerformers?.characters && (
            <Card>
              <CardHeader>
                <CardTitle>Character Performance</CardTitle>
                <CardDescription>
                  Wealth growth by character since tracking started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformers.characters.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatGP} />
                    <Tooltip formatter={(value: number) => `${formatGP(value)} GP`} />
                    <Bar dataKey="totalGrowth" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Character Details Table */}
          {topPerformers?.characters && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Character Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.characters.map((char: any, index: number) => (
                    <div key={char.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{char.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {char.growthRate.toFixed(1)}% growth rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatGP(char.totalGrowth)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatGP(char.currentWealth)} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          {/* Wealth Composition Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Wealth Composition</CardTitle>
              <CardDescription>
                Latest breakdown of your wealth sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wealthHistory.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={wealthHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis tickFormatter={formatGP} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${formatGP(value)} GP`, 
                        name === 'goldCoins' ? 'Gold Coins' : 
                        name === 'platTokens' ? 'Plat Tokens' : 'Bank Value'
                      ]}
                      labelFormatter={formatDate}
                    />
                    <Line type="monotone" dataKey="goldCoins" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="bankValue" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="platTokens" stroke="#ff7c7c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}