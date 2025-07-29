import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, BookOpen, Trophy, TrendingUp, Clock, Target } from "lucide-react";

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalUsers: 12847,
    activeUsers: 8934,
    lessonsCompleted: 45623,
    avgCompletionRate: 87,
    avgSessionTime: 6.2,
    retentionRate: 73
  },
  userEngagement: [
    { date: '2025-01-15', users: 1200, lessons: 3400, retention: 85 },
    { date: '2025-01-16', users: 1350, lessons: 3800, retention: 82 },
    { date: '2025-01-17', users: 1180, lessons: 3200, retention: 88 },
    { date: '2025-01-18', users: 1420, lessons: 4100, retention: 79 },
    { date: '2025-01-19', users: 1580, lessons: 4500, retention: 91 },
    { date: '2025-01-20', users: 1650, lessons: 4800, retention: 86 }
  ],
  topTracks: [
    { name: 'Prompt Engineering', completions: 8934, avgScore: 87 },
    { name: 'AI Ethics', completions: 6721, avgScore: 92 },
    { name: 'Machine Learning Basics', completions: 5432, avgScore: 83 },
    { name: 'Neural Networks', completions: 3456, avgScore: 79 },
    { name: 'Computer Vision', completions: 2341, avgScore: 88 }
  ],
  roiData: [
    { metric: 'User Acquisition Cost', value: '$12.50', trend: -8 },
    { metric: 'Lifetime Value', value: '$89.20', trend: 15 },
    { metric: 'Monthly Churn', value: '4.2%', trend: -12 },
    { metric: 'Revenue per User', value: '$34.80', trend: 23 }
  ]
};

export const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState(mockAnalytics);

  useEffect(() => {
    // In real app, fetch analytics data based on timeRange
    console.log('Fetching analytics for:', timeRange);
  }, [timeRange]);

  const pieChartData = [
    { name: 'Completed', value: data.overview.avgCompletionRate, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: 100 - data.overview.avgCompletionRate, color: 'hsl(var(--muted))' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">AI Skills micro-learning platform insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-gradient-primary border-0 text-primary-foreground" : ""}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card hover:shadow-glow transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{data.overview.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% vs last week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
                <p className="text-2xl font-bold text-foreground">{data.overview.lessonsCompleted.toLocaleString()}</p>
              </div>
              <BookOpen className="w-8 h-8 text-success" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% vs last week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session Time</p>
                <p className="text-2xl font-bold text-foreground">{data.overview.avgSessionTime}m</p>
              </div>
              <Clock className="w-8 h-8 text-streak-flame" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3% vs last week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-glow transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">{data.overview.avgCompletionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2">
              <Progress value={data.overview.avgCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="tracks">Track Performance</TabsTrigger>
          <TabsTrigger value="roi">ROI Dashboard</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.userEngagement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Lesson Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {pieChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.name}: {entry.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top Performing Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.topTracks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.roiData.map((metric, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <Badge 
                      variant={metric.trend > 0 ? "default" : "secondary"}
                      className={metric.trend > 0 ? "bg-success text-success-foreground" : ""}
                    >
                      {metric.trend > 0 ? '+' : ''}{metric.trend}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>User Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: 'Landing Page Visits', users: 25000, rate: 100 },
                  { stage: 'Sign Up Started', users: 15000, rate: 60 },
                  { stage: 'Onboarding Completed', users: 12000, rate: 80 },
                  { stage: 'First Lesson Started', users: 10000, rate: 83 },
                  { stage: 'First Lesson Completed', users: 8500, rate: 85 },
                  { stage: 'Badge Shared', users: 3400, rate: 40 }
                ].map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stage.users.toLocaleString()}</span>
                        <Badge variant="secondary">{stage.rate}%</Badge>
                      </div>
                    </div>
                    <Progress value={stage.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};