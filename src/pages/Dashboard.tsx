import { useState, useEffect } from "react";
import { Phone, MessageSquare, MapPin, Clock, Search, Filter, Wifi, WifiOff, ExternalLink, Copy, User, LogOut, BarChart3, Plus, Briefcase, Settings, X, Check, DollarSign, Calendar, ChevronDown, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
        // For tradies: only see their own jobs
        query = supabase
          .from('jobs')
          .select('*')
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
          tradie_name: profile.name,
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

  const formatTimeSince = (dateString: string) => {
    // Parse the date (Supabase returns UTC timestamps)
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    // Return relative time
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    // For older dates, show formatted date in user's local timezone
    const userTimezone = profile?.timezone || 'Australia/Sydney';
    return date.toLocaleDateString('en-AU', {
      timeZone: userTimezone,
      day: 'numeric',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  const getTimeSinceColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return 'text-green-600';
    if (diffHours < 72) return 'text-yellow-600';
    return 'text-red-600';
  };

  const hasBeenUpdated = (job: Job) => {
    // Check if job has been updated after creation (more than 1 minute difference)
    const created = new Date(job.created_at).getTime();
    const updated = new Date(job.updated_at).getTime();
    return (updated - created) > 60000; // 1 minute difference
  };

  const isRecentlyUpdated = (job: Job) => {
    // Check if updated within last 24 hours
    if (!hasBeenUpdated(job)) return false;
    const updated = new Date(job.updated_at);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
    return diffHours < 24;
  };

  const getContactStatus = (job: Job) => {
    return {
      status: job.status,
      text: getContactStatusText(job),
      icon: getContactStatusIcon(job.status),
      variant: getContactStatusVariant(job.status)
    };
  };

  const getContactStatusText = (job: Job) => {
    if (job.status === 'new') {
      return 'Not contacted yet';
    }
    
    if (job.status === 'contacted') {
      if (job.last_contact) {
        return `Called ${formatTimeSince(job.last_contact)}`;
      }
      return 'Customer contacted';
    }
    
    if (job.status === 'quote_sent') {
      if (job.estimated_value && job.estimated_value > 0) {
        return `Quoted $${job.estimated_value.toLocaleString()}`;
      }
      return 'Quote sent';
    }
    
    if (job.status === 'scheduled') {
      return 'Job scheduled';
    }
    
    if (job.status === 'in_progress') {
      return 'In progress';
    }
    
    if (job.status === 'completed') {
      return 'Job completed';
    }
    
    return job.status.replace('_', ' ');
  };

  const getContactStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return X;
      case 'contacted': return Phone;
      case 'quote_sent': return DollarSign;
      case 'scheduled': return Calendar;
      case 'in_progress': return Clock;
      case 'completed': return Check;
      default: return Clock;
    }
  };

  const getContactStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return "destructive";
      case 'contacted': return "secondary";
      case 'quote_sent': return "default";
      case 'scheduled': return "default";
      case 'in_progress': return "default";
      case 'completed': return "outline";
      default: return "outline";
    }
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
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-bold">TradieText</span>
                {profile?.business_name && (
                  <span> • {profile.business_name}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {profile && (
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate max-w-24">
                    {profile.name || profile.phone || 'Tradie'}
                  </span>
                </div>
              )}
              {profile?.user_type === 'tradie' && (
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                    <Settings className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="px-2 sm:px-3">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm" className="px-2 sm:px-3">
                  <span className="text-xs sm:text-sm">Home</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats - Only for Tradies */}
          {profile?.user_type === 'tradie' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              <Card className="p-2 sm:p-3">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-destructive">{urgentJobs}</div>
                  <div className="text-xs text-muted-foreground">Urgent</div>
                </div>
              </Card>
              <Card className="p-2 sm:p-3">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">{newJobs}</div>
                  <div className="text-xs text-muted-foreground">New Jobs</div>
                </div>
              </Card>
              <Card className="p-2 sm:p-3">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </div>
              </Card>
            </div>
          )}

          {/* Client Summary - Only for Clients */}
          {profile?.user_type === 'client' && filteredJobs.length > 0 && (
            <Card className="mb-4 p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your active jobs</span>
                  <span className="font-medium">{filteredJobs.length}</span>
                </div>
                {availableTradies.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Working with</span>
                    <span className="text-sm font-medium">{availableTradies.length} tradie{availableTradies.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Latest status</span>
                  <Badge variant={getContactStatusVariant(filteredJobs[0].status)} className="text-xs">
                    {getContactStatusText(filteredJobs[0])}
                  </Badge>
                </div>
                {filteredJobs.filter(job => job.estimated_value > 0).length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total quoted</span>
                    <span className="font-medium text-green-600">
                      ${filteredJobs.reduce((sum, job) => sum + (job.estimated_value || 0), 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm pr-2"
              />
            </div>
            
            {/* Tradie Filter - Only show for customers */}
            {profile?.user_type === 'client' && availableTradies.length > 1 && (
              <select
                value={filterTradie}
                onChange={(e) => setFilterTradie(e.target.value)}
                className="px-2 py-2 border rounded-md text-sm bg-background hidden sm:block"
              >
                <option value="all">All Tradies</option>
                {availableTradies.map(tradie => (
                  <option key={tradie.id} value={tradie.id}>
                    {tradie.business_name || tradie.name}
                  </option>
                ))}
              </select>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0 relative">
                  <Filter className="h-4 w-4" />
                  {filterStatus !== "all" && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "all"}
                  onCheckedChange={() => setFilterStatus("all")}
                >
                  All Jobs
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "new"}
                  onCheckedChange={() => setFilterStatus("new")}
                >
                  <X className="h-3 w-3 mr-2" />
                  Not Contacted
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "contacted"}
                  onCheckedChange={() => setFilterStatus("contacted")}
                >
                  <Phone className="h-3 w-3 mr-2" />
                  Contacted
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "quote_sent"}
                  onCheckedChange={() => setFilterStatus("quote_sent")}
                >
                  <DollarSign className="h-3 w-3 mr-2" />
                  Quote Sent
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "scheduled"}
                  onCheckedChange={() => setFilterStatus("scheduled")}
                >
                  <Calendar className="h-3 w-3 mr-2" />
                  Scheduled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "in_progress"}
                  onCheckedChange={() => setFilterStatus("in_progress")}
                >
                  <Clock className="h-3 w-3 mr-2" />
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "completed"}
                  onCheckedChange={() => setFilterStatus("completed")}
                >
                  <Check className="h-3 w-3 mr-2" />
                  Completed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {profile?.user_type === 'client' ? (
          // CLIENT DASHBOARD
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Jobs</h2>
              <Button onClick={() => navigate('/intake')} size="default" className="shadow-sm">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                      <Card key={job.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <CardHeader className="pb-3 px-4 pt-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg font-semibold">{job.job_type || 'Job Request'}</CardTitle>
                              <Badge variant={getStatusColor(job.status)} className="flex-shrink-0 text-xs">
                                {(() => {
                                  const Icon = getContactStatusIcon(job.status);
                                  return (
                                    <>
                                      <Icon className="h-3 w-3 mr-1" />
                                      {getContactStatusText(job)}
                                    </>
                                  );
                                })()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Submitted <span 
                                className={`font-medium ${getTimeSinceColor(job.created_at)}`}
                                title={new Date(job.created_at).toLocaleString('en-AU', {
                                  timeZone: profile?.timezone || 'Australia/Sydney',
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              >
                                {formatTimeSince(job.created_at)}
                              </span>
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="space-y-3">
                            {/* Tradie Information */}
                            {job.tradie_name && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{job.tradie_business_name || job.tradie_name}</p>
                                      {job.tradie_business_name && job.tradie_name && (
                                        <p className="text-xs text-muted-foreground">{job.tradie_name}</p>
                                      )}
                                    </div>
                                  </div>
                                  {job.estimated_value > 0 && (
                                    <span className="text-sm font-semibold text-green-600">
                                      ${job.estimated_value.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Location */}
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{job.location || 'Address not provided'}</span>
                            </div>
                            
                            {/* Job Description */}
                            {job.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                {job.description}
                              </p>
                            )}
                            
                            {/* Urgency and Time */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {job.urgency && (
                                <Badge variant={getUrgencyColor(job.urgency)} className="text-xs">
                                  {job.urgency === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {job.urgency} priority
                                </Badge>
                              )}
                              {job.preferred_time && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {job.preferred_time}
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2 pt-3 border-t">
                              <Link to={`/job/${job.id}`} className="flex-1">
                                <Button variant="outline" className="w-full hover:bg-gray-50 transition-colors">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                              {job.tradie_phone && (
                                <Button 
                                  variant="default" 
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
                                  onClick={() => {
                                    window.location.href = `sms:${job.tradie_phone}`;
                                    toast({
                                      title: "Opening messages",
                                      description: `Messaging ${job.tradie_name || 'your tradie'}`,
                                    });
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              )}
                              {job.status === 'new' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="sm:px-3 border-2"
                                  onClick={() => {
                                    // Navigate to job detail page where client can edit
                                    navigate(`/job/${job.id}`);
                                  }}
                                >
                                  Edit
                                </Button>
                              )}
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
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="jobs" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Job Management</span>
                <span className="xs:hidden sm:hidden">Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Analytics</span>
                <span className="xs:hidden sm:hidden">Stats</span>
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
              <Card key={job.id} className={`hover:shadow-md transition-shadow ${isRecentlyUpdated(job) ? 'ring-2 ring-blue-600/20' : ''}`}>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  {/* Status Badge at Top */}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const status = getContactStatus(job);
                        const Icon = status.icon;
                        return (
                          <Badge variant={status.variant} className="text-xs flex-shrink-0">
                            <Icon className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{status.text}</span>
                          </Badge>
                        );
                      })()}
                      {isRecentlyUpdated(job) && (
                        <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Updated
                        </Badge>
                      )}
                    </div>
                    <span 
                      className={`text-xs ${getTimeSinceColor(job.created_at)} flex-shrink-0`}
                      title={new Date(job.created_at).toLocaleString('en-AU', {
                        timeZone: profile?.timezone || 'Australia/Sydney',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    >
                      {formatTimeSince(job.created_at)}
                    </span>
                  </div>

                  {/* Customer Info Row */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{job.customer_name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{job.job_type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm sm:text-xl font-bold text-green-600">
                        ${job.estimated_value?.toLocaleString() || '0'}
                      </div>
                      <Badge variant={getUrgencyColor(job.urgency)} className="text-xs mt-1">
                        {job.urgency.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>

                  {/* Warnings/Special Badges */}
                  {(job.sms_blocked || !job.tradie_name || hasBeenUpdated(job)) && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                      {job.sms_blocked && (
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                          SMS BLOCKED
                        </Badge>
                      )}
                      {!job.tradie_name && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Unassigned
                        </Badge>
                      )}
                      {hasBeenUpdated(job) && (
                        <div className="text-xs text-muted-foreground">
                          Updated: {formatTimeSince(job.updated_at)}
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  {/* Primary Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <Button 
                      onClick={() => handleCall(job.customer_name, job.phone)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                      disabled={!isOnline}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <div className="flex gap-2 flex-1">
                      <Button 
                        onClick={() => handleSMS(job.customer_name, job.phone)}
                        variant={job.sms_blocked ? "outline" : "secondary"}
                        className="flex-1 text-sm py-2"
                        disabled={!isOnline || job.sms_blocked}
                      >
                        <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline">SMS</span>
                      </Button>
                      <Link to={`/job/${job.id}`} className="flex-1">
                        <Button 
                          variant="outline"
                          className="w-full text-sm py-2"
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-1 sm:gap-2 mt-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => updateJobStatus(job.id, "in_progress")}
                      className="text-xs flex-1 py-1.5"
                      disabled={!isOnline}
                    >
                      <span className="hidden sm:inline">Start Job</span>
                      <span className="sm:hidden">Start</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => updateJobStatus(job.id, "completed")}
                      className="text-xs flex-1 py-1.5"
                      disabled={!isOnline}
                    >
                      <span className="hidden sm:inline">Complete</span>
                      <span className="sm:hidden">Done</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => shareJobLink(job)}
                      className="text-xs px-2 py-1.5 flex-shrink-0"
                      disabled={!isOnline}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
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