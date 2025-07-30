import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

const AnalyticsDashboard = () => {
  const { analytics, loading, error, refetch } = useAnalytics();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          {error || "No analytics data available"}
        </p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend,
    format = "number"
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ComponentType<any>;
    trend?: "up" | "down" | "neutral";
    format?: "number" | "currency" | "percentage" | "hours";
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case "currency":
          return `$${val.toLocaleString()}`;
        case "percentage":
          return `${val.toFixed(1)}%`;
        case "hours":
          return `${val.toFixed(1)}h`;
        default:
          return val.toLocaleString();
      }
    };

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center text-xs",
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : 
              "text-muted-foreground"
            )}>
              {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
              <span>{change > 0 ? "+" : ""}{change.toFixed(1)}% from last week</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your business performance</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Jobs"
              value={analytics.totalJobs}
              change={analytics.weeklyGrowth}
              icon={Users}
              trend={analytics.weeklyGrowth > 0 ? "up" : analytics.weeklyGrowth < 0 ? "down" : "neutral"}
            />
            <MetricCard
              title="Completed Jobs"
              value={analytics.completedJobs}
              icon={CheckCircle}
              trend="up"
            />
            <MetricCard
              title="Total Value"
              value={analytics.totalValue}
              icon={DollarSign}
              format="currency"
              trend="up"
            />
            <MetricCard
              title="Conversion Rate"
              value={analytics.conversionRate}
              icon={TrendingUp}
              format="percentage"
              trend="up"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              title="Urgent Jobs"
              value={analytics.urgentJobs}
              icon={AlertTriangle}
              trend={analytics.urgentJobs > 5 ? "down" : "neutral"}
            />
            <MetricCard
              title="New Jobs"
              value={analytics.newJobs}
              icon={Calendar}
              trend="up"
            />
            <MetricCard
              title="Avg Response Time"
              value={analytics.avgResponseTime}
              icon={Clock}
              format="hours"
              trend="down"
            />
          </div>

          {/* Job Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Popular Job Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularJobTypes.map((jobType, index) => {
                  const percentage = (jobType.count / analytics.totalJobs) * 100;
                  return (
                    <div key={jobType.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {jobType.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {jobType.count} jobs
                          </span>
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                6-Month Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyStats.map((month, index) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {month.jobs} jobs
                        </span>
                        <span className="text-sm font-medium">
                          ${month.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress 
                        value={(month.jobs / Math.max(...analytics.monthlyStats.map(m => m.jobs))) * 100} 
                        className="h-2"
                      />
                      <Progress 
                        value={(month.value / Math.max(...analytics.monthlyStats.map(m => m.value))) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Business Insights */}
          <div className="grid gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Growth Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700">
                <p>
                  Your conversion rate of {analytics.conversionRate.toFixed(1)}% is {analytics.conversionRate > 75 ? "excellent" : "good"}. 
                  Focus on reducing response time to win more jobs.
                </p>
              </CardContent>
            </Card>

            {analytics.urgentJobs > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-yellow-700">
                  <p>
                    You have {analytics.urgentJobs} urgent job{analytics.urgentJobs > 1 ? 's' : ''} 
                    that need immediate attention. Prioritize these to maintain customer satisfaction.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <p>
                  {analytics.popularJobTypes[0]?.type.replace('_', ' ')} jobs are your most popular service. 
                  Consider specializing or expanding capacity in this area.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;