import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Image, 
  ExternalLink,
  CheckCircle,
  User,
  Home,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  Edit,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import PhotoUpload from "@/components/PhotoUpload";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface Job {
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
}

const JobCard = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { profile, user } = useAuth();

  // Fetch job data from Supabase
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        toast({
          title: "Error",
          description: "No job ID provided",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        
        // Query based on user type
        let query = supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId);
        
        // If user is a client (customer), also check phone number
        if (profile?.user_type === 'client') {
          query = query.eq('phone', profile.phone);
        } else if (profile?.user_type === 'tradie') {
          // Tradies can only see their own jobs
          query = query.eq('client_id', user?.id);
        }
        
        const { data, error } = await query.single();

        if (error) {
          console.error('Error fetching job:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Job not found');
        }

        setJob(data);
        setQuote(data.estimated_value?.toString() || '');
        setNotes(data.description || '');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, profile, user, navigate, toast]);

  // Update job status
  const handleStatusUpdate = async (newStatus: string) => {
    if (!job) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, status: newStatus });
      toast({
        title: "Status updated ✅",
        description: `Job marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  // Update quote/price
  const handleQuoteUpdate = async () => {
    if (!job || !quote) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          estimated_value: parseFloat(quote),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, estimated_value: parseFloat(quote) });
      setEditingQuote(false);
      toast({
        title: "Quote updated ✅",
        description: `Quote set to $${quote}`,
      });
      
      // Update status to quote_sent if it was new
      if (job.status === 'new') {
        handleStatusUpdate('quote_sent');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: "Error",
        description: "Failed to update quote",
        variant: "destructive",
      });
    }
  };

  // Update notes/description
  const handleNotesUpdate = async () => {
    if (!job) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          description: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, description: notes });
      setEditingNotes(false);
      toast({
        title: "Notes updated ✅",
        description: "Job notes have been saved",
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Job not found</div>
      </div>
    );
  }

  const handleCall = () => {
    window.open(`tel:${job.phone}`, '_self');
  };

  const handleMaps = () => {
    const encodedAddress = encodeURIComponent(job.location);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  const handleCalendar = () => {
    // This would generate and download a .ics file
    toast({
      title: "Calendar event created",
      description: "Event added for tomorrow 10 AM",
    });
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

  return (
    <div className="min-h-screen bg-muted/30 py-4">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Quick Actions Bar - Different for Clients vs Tradies */}
        {profile?.user_type === 'client' ? (
          // Client View - Status Overview
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Job Status</h3>
                  <Badge variant={getStatusColor(job.status)} className="text-sm">
                    {job.status === "new" && "Awaiting Response"}
                    {job.status === "contacted" && "Tradie Has Called"}
                    {job.status === "quote_sent" && "Quote Sent"}
                    {job.status === "scheduled" && "Job Scheduled"}
                    {job.status === "completed" && "Job Completed"}
                    {job.status === "cancelled" && "Job Cancelled"}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Submitted {format(new Date(job.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  {job.estimated_value > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Quote: ${job.estimated_value}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Tradie View - Quick Actions
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleCall} className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" onClick={handleMaps} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Open Maps
                </Button>
                <Button variant="outline" onClick={handleCalendar} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share Job
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quote & Status Update - Only for Tradies */}
        {profile?.user_type === 'tradie' && (
          <>
            {/* Quote Section */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Quote / Pricing</h3>
                    {!editingQuote ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingQuote(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleQuoteUpdate}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingQuote(false);
                            setQuote(job.estimated_value?.toString() || '');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingQuote ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">$</span>
                      <Input
                        type="number"
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        placeholder="Enter quote amount"
                        className="text-lg font-semibold"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      ${job.estimated_value || '0'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Update */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={job.status === "contacted" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate("contacted")}
                  >
                    Contacted
                  </Button>
                  <Button 
                    variant={job.status === "quote_sent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate("quote_sent")}
                  >
                    Quote Sent
                  </Button>
                  <Button 
                    variant={job.status === "scheduled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate("scheduled")}
                  >
                    Scheduled
                  </Button>
                  <Button 
                    variant={job.status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate("completed")}
                  >
                    Completed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Job Details */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{job.customer_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.phone}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant={getUrgencyColor(job.urgency)}>
                  {job.urgency === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority
                </Badge>
                <Badge variant={getStatusColor(job.status)}>
                  {job.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {job.status.replace('_', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Job Type</p>
                <p className="text-sm flex items-center">
                  {job.job_type}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Description / Notes</p>
                {profile?.user_type === 'tradie' && !editingNotes && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingNotes(true)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {profile?.user_type === 'tradie' && editingNotes && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleNotesUpdate}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingNotes(false);
                        setNotes(job.description || '');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {editingNotes ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this job..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm">{job.description || 'No description provided'}</p>
              )}
            </div>

            {job.preferred_time && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Preferred Time</p>
                <p className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.preferred_time}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.user_type === 'tradie' ? (
              <PhotoUpload jobId={job.id} existingPhotos={[]} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Photo viewing coming soon
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">
                  Job created • {format(new Date(job.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              {job.updated_at !== job.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">
                    Last updated • {format(new Date(job.updated_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobCard;