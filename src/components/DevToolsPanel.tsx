import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Settings, RefreshCw, Users, Briefcase, Key, Database } from "lucide-react";
import { createTestClient, createTestJob, resetTestData, createTestTradie, devLoginTradie, devLoginClient } from "@/lib/dev-tools-client";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

interface DevToolsPanelProps {
  onCreateTestClient?: () => Promise<void>;
  onCreateTestJob?: () => Promise<void>;
  onResetTestData?: () => Promise<void>;
}

const DevToolsPanel = ({ 
  onCreateTestClient, 
  onCreateTestJob, 
  onResetTestData 
}: DevToolsPanelProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    // Load minimized state from localStorage
    const saved = localStorage.getItem('devtools-minimized');
    return saved === 'true';
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('new');

  // Save minimized state to localStorage
  useEffect(() => {
    localStorage.setItem('devtools-minimized', isMinimized.toString());
  }, [isMinimized]);

  // Fetch jobs when panel is opened
  useEffect(() => {
    if (!isMinimized) {
      fetchJobs();
    }
  }, [isMinimized]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, customer_name, job_type, status')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setJobs(data);
        if (data.length > 0 && !selectedJobId) {
          setSelectedJobId(data[0].id);
          setSelectedStatus(data[0].status);
        }
      }
    } catch (err) {
      console.error('DevTools: Error fetching jobs', err);
    }
  };

  const handleUpdateJobStatus = async () => {
    if (!selectedJobId || !selectedStatus) {
      toast({
        title: "Please select a job",
        description: "Choose a job and status to update",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: selectedStatus })
        .eq('id', selectedJobId);

      if (error) throw error;

      toast({
        title: "Status Updated ✅",
        description: `Job status changed to ${selectedStatus}`,
      });

      // Refresh jobs list
      await fetchJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateClient = async () => {
    setIsProcessing(true);
    try {
      const result = await createTestClient();
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: "Test Client Created",
        description: `Client created with ID: ${result.userId}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test client. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateJob = async () => {
    setIsProcessing(true);
    try {
      // Get current user's phone from profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not logged in",
          description: "Please login as a client first using the Quick Login buttons",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, name, user_type')
        .eq('user_id', user.id)
        .single();

      if (profile?.user_type !== 'client') {
        toast({
          title: "Wrong user type",
          description: "Please login as a CLIENT (not tradie) to create test jobs",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create a test job directly in the database
      const randomNum = Math.floor(Math.random() * 1000);
      const jobTypes = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Landscaping'];
      const locations = ['Sydney NSW', 'Melbourne VIC', 'Brisbane QLD', 'Perth WA', 'Adelaide SA'];
      const urgencies = ['low', 'medium', 'high', 'urgent'];
      
      const testJob = {
        client_id: user.id, // Properly link to the current user
        customer_name: profile?.name || 'Test Customer',
        phone: profile?.phone || '+61400000000',
        job_type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        status: 'new',
        description: `Test job #${randomNum} - ${['Urgent repair needed', 'Regular maintenance', 'New installation', 'Fix broken item'][Math.floor(Math.random() * 4)]}`,
        estimated_value: Math.floor(Math.random() * 1000) + 100,
        preferred_time: 'Weekday mornings'
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([testJob])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Test Job Created ✅",
        description: `Job created: ${data.job_type} in ${data.location}`,
      });

      // Refresh jobs list
      await fetchJobs();
      
      // Refresh the page to show the new job
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error creating test job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create test job",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all test data? This cannot be undone.")) {
      setIsProcessing(true);
      try {
        const result = await resetTestData();
        if (!result.success) {
          throw new Error(result.error);
        }
        toast({
          title: "Test Data Reset",
          description: "All test data has been reset successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset test data. Check console for details.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCreateTradie = async () => {
    setIsProcessing(true);
    try {
      const result = await createTestTradie();
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Show instructions in a detailed toast
      const instructionsText = result.instructions?.join('\n') || '';
      toast({
        title: result.message || "Test Tradie Instructions",
        description: `Phone: ${result.testPhone}\nName: ${result.testName}\n\n${instructionsText}`,
        duration: 10000, // Show for 10 seconds
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get test tradie instructions. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDevLoginTradie = async () => {
    setIsProcessing(true);
    try {
      const result = await devLoginTradie();
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Show the login URL in a toast
      toast({
        title: "🔧 Dev Login Ready",
        description: "Login URL generated! Check console and click the link.",
        duration: 10000,
      });
      
      // Also log to console for easy copying
      console.log('🔧 DEV LOGIN URL (Tradie):', result.loginUrl);
      console.log('📋 Click this link to login as:', result.name);
      
      // Try to open the URL automatically
      if (result.loginUrl) {
        // Use the current port from window.location
        const currentPort = window.location.port || '8080';
        const correctedUrl = result.loginUrl.replace(/http:\/\/localhost(:\d+)?\//, `http://localhost:${currentPort}/`);
        console.log('🚀 Opening login URL:', correctedUrl);
        
        // Clear any existing session first
        await supabase.auth.signOut();
        
        // Small delay then navigate
        setTimeout(() => {
          window.location.href = correctedUrl;
        }, 100);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create dev login. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDevLoginClient = async () => {
    setIsProcessing(true);
    try {
      const result = await devLoginClient();
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Show the login URL in a toast
      toast({
        title: "🔧 Dev Login Ready",
        description: "Login URL generated! Check console and click the link.",
        duration: 10000,
      });
      
      // Also log to console for easy copying
      console.log('🔧 DEV LOGIN URL (Client):', result.loginUrl);
      console.log('📋 Click this link to login as:', result.name);
      
      // Try to open the URL automatically
      if (result.loginUrl) {
        // Use the current port from window.location
        const currentPort = window.location.port || '8080';
        const correctedUrl = result.loginUrl.replace(/http:\/\/localhost(:\d+)?\//, `http://localhost:${currentPort}/`);
        console.log('🚀 Opening login URL:', correctedUrl);
        
        // Clear any existing session first
        await supabase.auth.signOut();
        
        // Small delay then navigate
        setTimeout(() => {
          window.location.href = correctedUrl;
        }, 100);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create dev login. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto fixed bottom-4 right-4 z-50 bg-background border-2 border-primary/20 shadow-lg transition-all duration-200 ${isMinimized ? 'max-w-xs' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Dev Tools</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {!isMinimized && (
          <CardDescription>Testing utilities for development</CardDescription>
        )}
      </CardHeader>
      {!isMinimized && (
        <CardContent className="space-y-4">
          {/* Quick Login Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              Quick Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleDevLoginTradie} 
                variant="outline"
                disabled={isProcessing}
                size="sm"
              >
                {isProcessing ? "..." : "🔧 Tradie"}
              </Button>
              <Button 
                onClick={handleDevLoginClient} 
                variant="outline"
                disabled={isProcessing}
                size="sm"
              >
                {isProcessing ? "..." : "👤 Client"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Status Testing Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="h-4 w-4" />
              Test Job Status
            </div>
            <Select value={selectedJobId} onValueChange={(value) => {
              setSelectedJobId(value);
              const job = jobs.find(j => j.id === value);
              if (job) setSelectedStatus(job.status);
            }}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.customer_name} - {job.job_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New (Awaiting Response)</SelectItem>
                <SelectItem value="contacted">Contacted (Tradie Called)</SelectItem>
                <SelectItem value="quoted">Quoted (Quote Sent)</SelectItem>
                <SelectItem value="scheduled">Scheduled (Job Scheduled)</SelectItem>
                <SelectItem value="completed">Completed (Job Done)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleUpdateJobStatus} 
              className="w-full" 
              size="sm"
              disabled={isProcessing || !selectedJobId}
            >
              Update Status
            </Button>
          </div>

          <Separator />

          {/* Test Data Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              Test Data
            </div>
            
            {/* Current Login Status */}
            <div className="bg-muted p-2 rounded text-xs">
              {user ? (
                <div>
                  <p className="font-medium">Logged in as: {profile?.name}</p>
                  <p className="text-muted-foreground">Type: {profile?.user_type || 'Unknown'}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Not logged in - use Quick Login first</p>
              )}
            </div>
            
            <div className="space-y-2">
              {user && profile?.user_type === 'client' && (
                <Button 
                  onClick={handleCreateJob} 
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  disabled={isProcessing}
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  Add Test Job to My Account
                </Button>
              )}
              
              {user && profile?.user_type === 'tradie' && (
                <div className="space-y-2">
                  <Button 
                    onClick={handleCreateClient} 
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Create New Test Client
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Switch to the new client to add jobs
                  </p>
                </div>
              )}
              
              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Login first to create test data
                </p>
              )}
            </div>
            
            <Button 
              onClick={handleResetData} 
              variant="destructive" 
              className="w-full"
              size="sm"
              disabled={isProcessing}
            >
              Reset All Data
            </Button>
          </div>
        </CardContent>
      )}
      {!isMinimized && (
        <CardFooter className="text-xs text-muted-foreground text-center">
          Only visible in development mode
        </CardFooter>
      )}
    </Card>
  );
};

// Wrapper component that checks if we're in development mode
export const DevToolsPanelWrapper = () => {
  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <DevToolsPanel />
  );
};

export default DevToolsPanel;
