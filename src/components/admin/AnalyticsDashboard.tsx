import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Briefcase, TrendingUp, DollarSign, MapPin, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfDay } from 'date-fns';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Stats {
  totalUsers: number;
  totalJobs: number;
  activeTradies: number;
  completedJobs: number;
  totalClients: number;
  newUsersThisWeek: number;
  jobsThisWeek: number;
}

interface TradiePerformance {
  id: string;
  name: string;
  jobCount: number;
  completedJobs: number;
  avgCompletionTime: number;
  rating: number;
}

interface GrowthData {
  date: string;
  users: number;
  jobs: number;
}

interface JobStatusData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    activeTradies: 0,
    completedJobs: 0,
    totalClients: 0,
    newUsersThisWeek: 0,
    jobsThisWeek: 0
  });
  const [tradiePerformance, setTradiePerformance] = useState<TradiePerformance[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [jobStatusData, setJobStatusData] = useState<JobStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [
        { count: totalUsers },
        { count: totalJobs },
        { count: totalTradies },
        { count: totalClients },
        { count: completedJobs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'tradie'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'client'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);

      // Fetch this week's data
      const weekAgo = subDays(new Date(), 7);
      const [
        { count: newUsersThisWeek },
        { count: jobsThisWeek }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalJobs: totalJobs || 0,
        activeTradies: totalTradies || 0,
        completedJobs: completedJobs || 0,
        totalClients: totalClients || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        jobsThisWeek: jobsThisWeek || 0
      });

      // Fetch job status distribution
      const { data: jobStatuses } = await supabase
        .from('jobs')
        .select('status');
      
      if (jobStatuses) {
        const statusCounts = jobStatuses.reduce((acc: Record<string, number>, job) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {});

        setJobStatusData(
          Object.entries(statusCounts).map(([name, value]) => ({
            name: name.replace('_', ' '),
            value
          }))
        );
      }

      // Fetch growth data (last 30 days)
      const growthDataPoints: GrowthData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i));
        const nextDate = startOfDay(subDays(new Date(), i - 1));
        
        const [
          { count: userCount },
          { count: jobCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).lt('created_at', nextDate.toISOString()),
          supabase.from('jobs').select('*', { count: 'exact', head: true }).lt('created_at', nextDate.toISOString())
        ]);

        growthDataPoints.push({
          date: format(date, 'MMM d'),
          users: userCount || 0,
          jobs: jobCount || 0
        });
      }
      setGrowthData(growthDataPoints);

      // Fetch tradie performance
      const { data: tradies } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('user_type', 'tradie')
        .limit(10);

      if (tradies) {
        const performanceData = await Promise.all(
          tradies.map(async (tradie) => {
            const { count: jobCount } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', tradie.id);

            const { count: completedCount } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', tradie.id)
              .eq('status', 'completed');

            return {
              id: tradie.id,
              name: tradie.name || 'Unnamed Tradie',
              jobCount: jobCount || 0,
              completedJobs: completedCount || 0,
              avgCompletionTime: Math.floor(Math.random() * 5) + 1, // Mock data
              rating: (Math.random() * 2 + 3).toFixed(1) // Mock rating 3-5
            };
          })
        );

        setTradiePerformance(performanceData.sort((a, b) => b.jobCount - a.jobCount));
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.jobsThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tradies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTradies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClients} total clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalJobs > 0 
                ? Math.round((stats.completedJobs / stats.totalJobs) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedJobs} completed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8884d8" 
                  name="Total Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="#82ca9d" 
                  name="Total Jobs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tradie Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tradies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total Jobs</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Avg. Time (days)</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradiePerformance.map((tradie) => (
                <TableRow key={tradie.id}>
                  <TableCell className="font-medium">{tradie.name}</TableCell>
                  <TableCell>{tradie.jobCount}</TableCell>
                  <TableCell>{tradie.completedJobs}</TableCell>
                  <TableCell>
                    <Badge variant={tradie.jobCount > 0 && (tradie.completedJobs / tradie.jobCount) > 0.8 ? 'success' : 'secondary'}>
                      {tradie.jobCount > 0 
                        ? Math.round((tradie.completedJobs / tradie.jobCount) * 100) 
                        : 0}%
                    </Badge>
                  </TableCell>
                  <TableCell>{tradie.avgCompletionTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {tradie.rating}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}