import { useState, useEffect } from "react";
import { Phone, MessageSquare, MapPin, Clock, Search, Filter, Wifi, WifiOff, ExternalLink, Copy, User, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PhotoGrid from "@/components/PhotoGrid";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useAuth, generateJobLink } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

type Job = {
  id: string;
  customer_name: string;
  phone: string;
  job_type: string;
  location: string;
  urgency: string;
  status: string;
  estimated_value: number;
  description: string;
  preferred_time: string;
  last_contact: string;
  sms_blocked: boolean;
  created_at: string;
  updated_at: string;
};

const Dashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("jobs");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const { notifyNewJob, notifyUrgentJob } = useNotifications();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchJobs();

    // Set up real-time subscription for job updates
    const jobsSubscription = supabase
      .channel('jobs-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          fetchJobs(); // Refetch jobs when data changes
        }
      )
      .subscribe();

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      fetchJobs(); // Refetch when coming back online
      toast({
        title: "Connection restored",
        description: "Dashboard data updated",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "Working in offline mode",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      jobsSubscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatLastContact = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "secondary"; 
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "destructive";
      case "contacted": return "secondary";
      case "quote_sent": return "default";
      case "scheduled": return "default";
      case "completed": return "outline";
      default: return "outline";
    }
  };

  const handleCall = (customerName: string, phone: string) => {
    window.location.href = `tel:${phone}`;
    toast({
      title: "Calling customer",
      description: `Dialing ${customerName} at ${phone}`,
    });
  };

  const handleSMS = (customerName: string, phone: string) => {
    window.location.href = `sms:${phone}`;
    toast({
      title: "SMS opened",
      description: `Ready to text ${customerName}`,
    });
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Job status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const shareJobLink = async (job: Job) => {
    try {
      const jobLink = await generateJobLink(job.id, job.phone);
      if (jobLink) {
        await navigator.clipboard.writeText(jobLink);
        toast({
          title: "Job link copied!",
          description: `Secure link for ${job.customer_name} copied to clipboard`,
        });
      } else {
        throw new Error('Failed to generate job link');
      }
    } catch (error) {
      toast({
        title: "Failed to share job",
        description: "Could not generate secure job link",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.job_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const urgentJobs = filteredJobs.filter(job => job.urgency === "high").length;
  const newJobs = filteredJobs.filter(job => job.status === "new").length;
  const totalValue = filteredJobs.reduce((sum, job) => {
    return sum + (job.estimated_value || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">TradiePro - Follow-up Central</p>
            </div>
            <div className="flex items-center gap-2">
              {profile && (
                <div className="flex items-center gap-2 mr-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {profile.name || profile.phone || 'Tradie'}
                  </span>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{urgentJobs}</div>
                <div className="text-xs text-muted-foreground">Urgent</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{newJobs}</div>
                <div className="text-xs text-muted-foreground">New Jobs</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, customers, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground p-2 text-center text-sm">
          <WifiOff className="inline h-4 w-4 mr-2" />
          Offline - showing cached data
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">{job.customer_name}</h3>
                        {job.sms_blocked && (
                          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                            SMS BLOCKED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.job_type}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>Last contact: {formatLastContact(job.last_contact)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge variant={getUrgencyColor(job.urgency)} className="text-xs">
                            {job.urgency.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant={getStatusColor(job.status)} className="text-xs">
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <PhotoGrid jobId={job.id} maxPhotos={3} size="sm" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${job.estimated_value?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button 
                      onClick={() => handleCall(job.customer_name, job.phone)}
                      className="h-12 bg-green-600 hover:bg-green-700 text-white"
                      disabled={!isOnline}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    <Button 
                      onClick={() => handleSMS(job.customer_name, job.phone)}
                      variant="outline"
                      className="h-12"
                      disabled={!isOnline || job.sms_blocked}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {job.sms_blocked ? 'SMS Blocked' : 'Send SMS'}
                    </Button>
                  </div>

                  {/* Status Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => updateJobStatus(job.id, "in_progress")}
                      className="text-xs"
                      disabled={!isOnline}
                    >
                      Start Job
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => updateJobStatus(job.id, "completed")}
                      className="text-xs"
                      disabled={!isOnline}
                    >
                      Complete
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => shareJobLink(job)}
                      className="text-xs"
                      disabled={!isOnline}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Link to={`/job/${job.id}`}>
                      <Button 
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                      >
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && filteredJobs.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {jobs.length === 0 ? 'No jobs found. Create your first job!' : 'No jobs found matching your criteria.'}
                </p>
              </Card>
            )}
          </>
        )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;