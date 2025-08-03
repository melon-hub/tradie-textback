import { useState, useEffect } from "react";
import { Phone, MessageSquare, MapPin, Clock, Search, Filter, Wifi, WifiOff, ExternalLink, Copy, User, LogOut, BarChart3, Plus, Briefcase, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  client_id: string | null;
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
  // Added for multi-tradie support
  tradie_name?: string;
  tradie_id?: string;
  tradie_phone?: string;
  tradie_business_name?: string;
};

const Dashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTradie, setFilterTradie] = useState("all");
  const [availableTradies, setAvailableTradies] = useState<Array<{id: string, name: string, business_name?: string}>>([]);
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

  // Force re-fetch when component mounts (handles navigation back to dashboard)
  useEffect(() => {
    console.log('Dashboard mounted, clearing jobs');
    setJobs([]); // Clear stale data
    setLoading(true);
  }, []);

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      let query: any;
      
      // Filter jobs based on user type
      if (profile?.user_type === 'client') {
        // For customers: query by phone number to see jobs from ALL tradies
        // Use the customer_jobs_view to get tradie information
        query = supabase
          .from('customer_jobs_view')
          .select('*')
          .eq('customer_phone', profile.phone)
          .order('created_at', { ascending: false });
      } else {
        // For tradies: only see their own jobs with their profile info
        query = supabase
          .from('jobs')
          .select(`
            *,
            profiles!client_id (
              name,
              user_id,
              user_type
            )
          `)
          .eq('client_id', user?.id)
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      const jobsData = data || [];
      
      // For tradies, enhance jobs with their own info
      if (profile?.user_type === 'tradie' && profile?.name) {
        const enhancedJobs = jobsData.map((job: any) => ({
          ...job,
          tradie_name: job.profiles?.name || profile.name,
          tradie_id: job.client_id,
          tradie_business_name: profile.business_name // if available
        }));
        setJobs(enhancedJobs);
      } else {
        setJobs(jobsData);
      }
      
      // Extract unique tradies for filtering (only for customers)
      if (profile?.user_type === 'client' && jobsData.length > 0) {
        const tradiesMap = new Map();
        jobsData.forEach((job: any) => {
          if (job.tradie_id && !tradiesMap.has(job.tradie_id)) {
            tradiesMap.set(job.tradie_id, {
              id: job.tradie_id,
              name: job.tradie_name || 'Unknown Tradie',
              business_name: job.tradie_business_name
            });
          }
        });
        setAvailableTradies(Array.from(tradiesMap.values()));
      }
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
    let mounted = true;

    const initializeDashboard = async () => {
      // Only fetch jobs if we have the necessary auth data
      if (!authLoading && profile && user && mounted) {
        await fetchJobs();
      }
    };

    initializeDashboard();

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
          if (mounted && !authLoading && profile && user) {
            fetchJobs(); // Refetch jobs when data changes
          }
        }
      )
      .subscribe();

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      if (mounted) {
        fetchJobs(); // Refetch when coming back online
        toast({
          title: "Connection restored",
          description: "Dashboard data updated",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (mounted) {
        toast({
          title: "Connection lost",
          description: "Working in offline mode",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      jobsSubscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authLoading, profile, user]);

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
    const matchesTradie = filterTradie === "all" || job.tradie_id === filterTradie;
    return matchesSearch && matchesFilter && matchesTradie;
  });

  const urgentJobs = filteredJobs.filter(job => job.urgency === "high").length;
  const newJobs = filteredJobs.filter(job => job.status === "new").length;
  const totalValue = filteredJobs.reduce((sum, job) => {
    return sum + (job.estimated_value || 0);
  }, 0);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show loading state while profile is loading
  if (!profile && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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
              {profile?.user_type === 'tradie' && (
                <Link to="/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
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
            
            {/* Tradie Filter - Only show for customers */}
            {profile?.user_type === 'client' && availableTradies.length > 1 && (
              <select
                value={filterTradie}
                onChange={(e) => setFilterTradie(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">All Tradies</option>
                {availableTradies.map(tradie => (
                  <option key={tradie.id} value={tradie.id}>
                    {tradie.business_name || tradie.name}
                  </option>
                ))}
              </select>
            )}
            
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
        {profile?.user_type === 'client' ? (
          // CLIENT DASHBOARD
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Jobs</h2>
              <Button onClick={() => navigate('/intake')}>
                <Plus className="h-4 w-4 mr-2" />
                New Job Request
              </Button>
            </div>
            
            {loading ? (
              // Loading skeleton for clients
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {filteredJobs.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No jobs yet</h3>
                        <p className="text-muted-foreground">Submit your first job request to get started</p>
                      </div>
                      <Button onClick={() => navigate('/intake')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job Request
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{job.description || 'Job Request'}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(job.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{job.location || 'Address not provided'}</span>
                            </div>
                            {job.urgency && (
                              <div className="flex items-center gap-2">
                                <Badge variant={getUrgencyColor(job.urgency)} className="text-xs">
                                  {job.urgency}
                                </Badge>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Link to={`/job/${job.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // TRADIE DASHBOARD (existing)
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
                        {/* Show tradie name - for all users to see assignment */}
                        {job.tradie_name ? (
                          <Badge variant="secondary" className="text-xs">
                            {job.tradie_business_name || job.tradie_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Unassigned
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;