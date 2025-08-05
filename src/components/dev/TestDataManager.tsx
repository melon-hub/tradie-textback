import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Clock, BarChart3, RefreshCw, Database } from 'lucide-react';
import { TestDataManager } from '@/lib/test-data-manager';
import { useAuth } from '@/hooks/useAuth';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClientTestDataManager } from './ClientTestDataManager';

export function TestDataManagerComponent() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobStats, setJobStats] = useState<any[]>([]);
  
  // State for custom job creation
  const [customJob, setCustomJob] = useState({
    urgency: 'medium',
    status: 'new',
    hoursAgo: 0
  });

  const handleClearData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      await TestDataManager.clearTestUserData(user.email);
      toast({
        title: 'Data Cleared',
        description: 'All test data has been removed'
      });
      
      // Refresh the page to show empty state
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear test data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeBasedJobs = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      await TestDataManager.createTimeBasedTestJobs(user.email);
      toast({
        title: 'Jobs Created',
        description: 'Time-based test jobs have been created'
      });
      
      // Refresh stats
      await loadJobStats();
      
      // Refresh the page to show new data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePresetJob = async (preset: keyof typeof TestDataManager.presets) => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      await TestDataManager.createTestJob(user.email, TestDataManager.presets[preset]);
      toast({
        title: 'Job Created',
        description: `Created ${preset} test job`
      });
      
      // Refresh the page
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test job',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomJob = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const jobConfig = {
        customerName: `Custom Test ${Date.now()}`,
        phone: `+614${Math.floor(Math.random() * 100000000)}`,
        location: `${Math.floor(Math.random() * 999)} Test St, Sydney NSW`,
        jobType: 'Custom Job',
        urgency: customJob.urgency as any,
        status: customJob.status as any,
        description: `Test job created ${customJob.hoursAgo} hours ago`,
        estimatedValue: 100 + Math.floor(Math.random() * 900),
        hoursAgo: customJob.hoursAgo
      };
      
      await TestDataManager.createTestJob(user.email, jobConfig);
      toast({
        title: 'Custom Job Created',
        description: `Created job from ${customJob.hoursAgo} hours ago`
      });
      
      // Refresh the page
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create custom job',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJobStats = async () => {
    if (!user?.email) return;
    
    try {
      const stats = await TestDataManager.getJobAgeStats(user.email);
      setJobStats(stats || []);
    } catch (error) {
      console.error('Failed to load job stats:', error);
    }
  };

  const handleGenerateRandomJobs = async (count: number) => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      await TestDataManager.generateTimeRangeJobs(user.email, count);
      toast({
        title: 'Jobs Generated',
        description: `Created ${count} random test jobs`
      });
      
      // Refresh the page
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate random jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Show client-specific manager for client users */}
      {profile?.user_type === 'client' && (
        <>
          <ClientTestDataManager />
          <Separator />
        </>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Data Manager
          </CardTitle>
          <CardDescription>
            Manage test data for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Actions</TabsTrigger>
              <TabsTrigger value="custom">Custom Job</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick" className="space-y-4">
              <div className="space-y-2">
                <Label>Bulk Operations</Label>
                <div className="grid gap-2">
                  <Button
                    onClick={handleCreateTimeBasedJobs}
                    disabled={loading}
                    className="w-full justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Create Time-Based Test Jobs
                  </Button>
                  
                  <Button
                    onClick={() => handleGenerateRandomJobs(10)}
                    disabled={loading}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate 10 Random Jobs
                  </Button>
                  
                  <Button
                    onClick={() => handleGenerateRandomJobs(20)}
                    disabled={loading}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate 20 Random Jobs
                  </Button>
                  
                  <Button
                    onClick={handleClearData}
                    disabled={loading}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Test Data
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Quick Job Presets</Label>
                <div className="grid gap-2">
                  <Button
                    onClick={() => handleCreatePresetJob('urgentNow')}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="justify-start"
                  >
                    <Badge variant="destructive" className="mr-2">Urgent</Badge>
                    Just Now
                  </Button>
                  
                  <Button
                    onClick={() => handleCreatePresetJob('todayMedium')}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="justify-start"
                  >
                    <Badge className="mr-2">Medium</Badge>
                    Today (4h ago)
                  </Button>
                  
                  <Button
                    onClick={() => handleCreatePresetJob('yesterdayInProgress')}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="justify-start"
                  >
                    <Badge variant="secondary" className="mr-2">In Progress</Badge>
                    Yesterday
                  </Button>
                  
                  <Button
                    onClick={() => handleCreatePresetJob('lastWeekCompleted')}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="justify-start"
                  >
                    <Badge variant="outline" className="mr-2">Completed</Badge>
                    Last Week
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Hours Ago</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[customJob.hoursAgo]}
                      onValueChange={([value]) => setCustomJob({ ...customJob, hoursAgo: value })}
                      max={720}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-20 text-sm text-muted-foreground">
                      {customJob.hoursAgo}h ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {customJob.hoursAgo === 0 ? 'Just now' : 
                     customJob.hoursAgo < 24 ? 'Today' :
                     customJob.hoursAgo < 48 ? 'Yesterday' :
                     customJob.hoursAgo < 168 ? 'This week' :
                     `${Math.floor(customJob.hoursAgo / 24)} days ago`}
                  </p>
                </div>
                
                <div>
                  <Label>Urgency</Label>
                  <Select
                    value={customJob.urgency}
                    onValueChange={(value) => setCustomJob({ ...customJob, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select
                    value={customJob.status}
                    onValueChange={(value) => setCustomJob({ ...customJob, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleCreateCustomJob}
                  disabled={loading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Job
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <Button
                onClick={loadJobStats}
                disabled={loading}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Stats
              </Button>
              
              {jobStats.length > 0 && (
                <div className="space-y-2">
                  {jobStats.map((stat) => (
                    <div key={stat.time_period} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stat.time_period}</span>
                        <Badge variant="secondary">{stat.job_count}</Badge>
                      </div>
                      {stat.status_breakdown && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(stat.status_breakdown).map(([status, count]) => (
                            <span key={status} className="mr-2">
                              {status}: {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Re-export for convenience
export { TestDataManager };