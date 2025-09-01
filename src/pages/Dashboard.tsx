import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, BarChart3, TrendingUp, Calendar, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Farm {
  id: string;
  name: string;
  location: string;
  crop_type: string;
  area_hectares: number;
  created_at: string;
}

interface Prediction {
  id: string;
  yield_per_hectare: number;
  confidence_score: number;
  created_at: string;
  farm_id: string;
}

interface Profile {
  display_name: string;
  farm_size_hectares?: number;
  primary_crops?: string[];
  subscription_tier: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [farmsResult, predictionsResult, profileResult] = await Promise.all([
        supabase.from('farms').select('*').order('created_at', { ascending: false }),
        supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('*').single()
      ]);

      if (farmsResult.data) setFarms(farmsResult.data);
      if (predictionsResult.data) setPredictions(predictionsResult.data);
      if (profileResult.data) setProfile(profileResult.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalArea = farms.reduce((sum, farm) => sum + farm.area_hectares, 0);
  const avgYield = predictions.length > 0 
    ? predictions.reduce((sum, pred) => sum + pred.yield_per_hectare, 0) / predictions.length 
    : 0;

  const chartData = predictions.slice(0, 7).map((pred, index) => ({
    date: new Date(pred.created_at).toLocaleDateString(),
    yield: pred.yield_per_hectare,
    confidence: pred.confidence_score,
  })).reverse();

  const chartConfig: ChartConfig = {
    yield: {
      label: "Yield (tons/ha)",
      color: "hsl(var(--primary))",
    },
    confidence: {
      label: "Confidence (%)",
      color: "hsl(var(--secondary))",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.display_name || 'Farmer'}
              </h1>
              <p className="text-muted-foreground">
                Here's your farm overview and latest predictions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={profile?.subscription_tier === 'premium' ? 'default' : 'secondary'}>
              {profile?.subscription_tier || 'Free'} Plan
            </Badge>
            <Button onClick={() => navigate('/')} className="gap-2">
              <Plus className="w-4 h-4" />
              New Prediction
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farms.length}</div>
              <p className="text-xs text-muted-foreground">
                +{farms.filter(f => new Date(f.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Area</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArea.toFixed(1)} ha</div>
              <p className="text-xs text-muted-foreground">
                Across all farms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgYield.toFixed(1)} t/ha</div>
              <p className="text-xs text-muted-foreground">
                Based on predictions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictions.length}</div>
              <p className="text-xs text-muted-foreground">
                Total generated
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Yield Predictions Trend</CardTitle>
              <CardDescription>Your recent yield predictions over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="yield" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No prediction data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Farms */}
          <Card>
            <CardHeader>
              <CardTitle>Your Farms</CardTitle>
              <CardDescription>Manage your agricultural properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farms.slice(0, 5).map((farm) => (
                  <div key={farm.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Leaf className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{farm.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {farm.crop_type} • {farm.area_hectares} ha • {farm.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(farm.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {farms.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No farms yet. Create your first prediction to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Predictions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Your latest yield predictions and confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.slice(0, 5).map((prediction) => {
                  const farm = farms.find(f => f.id === prediction.farm_id);
                  return (
                    <div key={prediction.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{farm?.name || 'Unknown Farm'}</p>
                          <p className="text-sm text-muted-foreground">
                            {farm?.crop_type} • {farm?.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{prediction.yield_per_hectare.toFixed(1)} t/ha</p>
                            <p className="text-sm text-muted-foreground">
                              {prediction.confidence_score}% confidence
                            </p>
                          </div>
                          <Badge variant={prediction.confidence_score > 80 ? 'default' : 'secondary'}>
                            {prediction.confidence_score > 80 ? 'High' : 'Medium'} Confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {predictions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No predictions yet. Start by creating your first yield prediction!</p>
                    <Button className="mt-4" onClick={() => navigate('/')}>
                      Create Prediction
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;