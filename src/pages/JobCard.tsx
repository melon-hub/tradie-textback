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
  X,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import PhotoUpload from "@/components/PhotoUpload";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";

// Trade types from our database
const TRADE_TYPES = [
  { code: 'plumber', label: 'Plumber' },
  { code: 'electrician', label: 'Electrician' },
  { code: 'carpenter', label: 'Carpenter' },
  { code: 'hvac', label: 'HVAC Technician' },
  { code: 'handyman', label: 'Handyman' },
  { code: 'landscaper', label: 'Landscaper' },
  { code: 'locksmith', label: 'Locksmith' },
  { code: 'painter', label: 'Painter' },
  { code: 'tiler', label: 'Tiler' },
  { code: 'roofer', label: 'Roofer' },
];

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
  const [editingLocation, setEditingLocation] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [preferredTime, setPreferredTime] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
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
        
        // If user is a client (customer), check phone number if available
        if (profile?.user_type === 'client' && profile?.phone) {
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
        setLocation(data.location || '');
        setJobType(data.job_type || '');
        setPreferredTime(data.preferred_time || '');
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
    if (!job) {
      console.error('No job data available');
      return;
    }

    console.log('Updating status:', { 
      jobId: job.id, 
      currentStatus: job.status, 
      newStatus,
      userType: profile?.user_type 
    });

    try {
      const { error, data } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Update last_contact when marking as contacted
          ...(newStatus === 'contacted' ? { last_contact: new Date().toISOString() } : {})
        })
        .eq('id', job.id)
        .select(); // Add select to see what gets updated

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      console.log('Status update successful:', data);

      setJob({ 
        ...job, 
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'contacted' ? { last_contact: new Date().toISOString() } : {})
      });
      
      toast({
        title: "Status updated ✅",
        description: `Job marked as ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: `Failed to update job status: ${error.message || 'Unknown error'}`,
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
      
      // Update status to quoted if it was new
      if (job.status === 'new') {
        handleStatusUpdate('quoted');
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

  // Send quote to customer (with future SMS integration)
  const handleSendQuote = async () => {
    if (!job) return;

    try {
      // Update status to quoted
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'quoted',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, status: 'quoted', updated_at: new Date().toISOString() });

      // Future SMS integration - send quote to customer
      if (job.phone && job.estimated_value > 0) {
        try {
          const { error: smsError } = await supabase.functions.invoke('send-quote-sms', {
            body: {
              jobId: job.id,
              customerPhone: job.phone,
              customerName: job.customer_name,
              quoteAmount: job.estimated_value,
              jobType: job.job_type,
              location: job.location
            }
          });

          if (smsError) {
            console.error('SMS failed but status updated:', smsError);
            toast({
              title: "Quote status updated ✅",
              description: "Status updated (SMS service unavailable)",
            });
          } else {
            toast({
              title: "Quote sent ✅",
              description: `$${job.estimated_value.toLocaleString()} quote sent to ${job.customer_name}`,
            });
          }
        } catch (smsError) {
          console.error('SMS service error:', smsError);
          toast({
            title: "Quote status updated ✅",
            description: "Status updated (SMS service unavailable)",
          });
        }
      } else {
        toast({
          title: "Quote status updated ✅",
          description: "Job marked as quoted",
        });
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        title: "Error",
        description: "Failed to send quote",
        variant: "destructive",
      });
    }
  };

  // Enter edit mode
  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setHasChanges(false);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setHasChanges(false);
    // Reset all values to original
    if (job) {
      setLocation(job.location || '');
      setNotes(job.description || '');
      setJobType(job.job_type || '');
      setPreferredTime(job.preferred_time || '');
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (!job) return;

    // Check what actually changed
    const updatedFields: string[] = [];
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (location !== job.location) {
      updates.location = location;
      updatedFields.push('location');
    }
    
    if (notes !== job.description) {
      updates.description = notes;
      updatedFields.push('description');
    }
    
    if (jobType !== job.job_type) {
      updates.job_type = jobType;
      updatedFields.push('job type');
    }
    
    if (preferredTime !== job.preferred_time) {
      updates.preferred_time = preferredTime;
      updatedFields.push('preferred time');
    }

    // If nothing changed, just exit edit mode
    if (updatedFields.length === 0) {
      setIsEditMode(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, ...updates });
      setIsEditMode(false);
      
      // Send SMS notification if client updated
      if (profile?.user_type === 'client' && job.client_id && updatedFields.length > 0) {
        supabase.functions.invoke('send-job-update-sms', {
          body: {
            jobId: job.id,
            updatedFields,
            updatedBy: profile.id || user?.id,
            updatedByType: 'client'
          }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Failed to send SMS notification:', error);
          }
        });
      }
      
      // Show toast only if changes were made
      if (updatedFields.length > 0) {
        const fieldsText = updatedFields.join(' and ');
        if (profile?.user_type === 'client') {
          toast({
            title: "Details updated ✅",
            description: `${fieldsText} updated. Your tradie will be notified.`,
          });
        } else {
          toast({
            title: "Job updated ✅",
            description: `${fieldsText} have been saved.`,
          });
        }
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job details",
        variant: "destructive",
      });
    }
  };

  // Track changes
  useEffect(() => {
    if (job && isEditMode) {
      const hasLocationChange = location !== job.location;
      const hasNotesChange = notes !== job.description;
      const hasJobTypeChange = jobType !== job.job_type;
      const hasPreferredTimeChange = preferredTime !== job.preferred_time;
      setHasChanges(hasLocationChange || hasNotesChange || hasJobTypeChange || hasPreferredTimeChange);
    }
  }, [location, notes, jobType, preferredTime, job, isEditMode]);

  // Update notes/description
  const handleNotesUpdate = async () => {
    if (!job) return;

    // Check if value actually changed
    if (notes === job.description) {
      setEditingNotes(false);
      return;
    }

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
      
      // Send SMS notification if client updated
      if (profile?.user_type === 'client' && job.client_id) {
        // Call edge function to send SMS
        supabase.functions.invoke('send-job-update-sms', {
          body: {
            jobId: job.id,
            updatedFields: ['description'],
            updatedBy: profile.id || user?.id,
            updatedByType: 'client'
          }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Failed to send SMS notification:', error);
          } else if (data?.requiresSetup) {
            console.log('Twilio not configured - SMS notifications disabled');
          }
        });
      }
      
      // Different message based on user type
      if (profile?.user_type === 'client') {
        toast({
          title: "Details updated ✅",
          description: "Your tradie will be notified of the changes",
        });
      } else {
        toast({
          title: "Notes updated ✅",
          description: "Job notes have been saved",
        });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  // Update location
  const handleLocationUpdate = async () => {
    if (!job) return;

    // Check if value actually changed
    if (location === job.location) {
      setEditingLocation(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          location: location,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      setJob({ ...job, location: location });
      setEditingLocation(false);
      
      // Send SMS notification if client updated
      if (profile?.user_type === 'client' && job.client_id) {
        supabase.functions.invoke('send-job-update-sms', {
          body: {
            jobId: job.id,
            updatedFields: ['location'],
            updatedBy: profile.id || user?.id,
            updatedByType: 'client'
          }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Failed to send SMS notification:', error);
          }
        });
      }
      
      toast({
        title: "Location updated ✅",
        description: profile?.user_type === 'client' 
          ? "Your tradie will be notified of the new address"
          : "Job location has been updated",
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
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

  const handleSMS = async (customerName: string, phone: string) => {
    try {
      // Future SMS integration - send custom message to customer
      const { error: smsError } = await supabase.functions.invoke('send-custom-sms', {
        body: {
          jobId: job?.id,
          customerPhone: phone,
          customerName: customerName,
          message: `Hi ${customerName}, this is regarding your ${job?.job_type} job at ${job?.location}. Please reply with any questions.`,
          senderId: profile?.id || user?.id
        }
      });

      if (smsError) {
        console.error('SMS service unavailable, opening device SMS:', smsError);
        // Fallback to device SMS app
        window.location.href = `sms:${phone}`;
        toast({
          title: "SMS app opened",
          description: `Device SMS opened for ${customerName}`,
        });
      } else {
        toast({
          title: "SMS sent ✅",
          description: `Message sent to ${customerName}`,
        });
      }
    } catch (error) {
      console.error('SMS error, using fallback:', error);
      // Fallback to device SMS app
      window.location.href = `sms:${phone}`;
      toast({
        title: "SMS app opened",
        description: `Device SMS opened for ${customerName}`,
      });
    }
  };

  const shareJobLink = async (job: Job) => {
    try {
      // This would generate a secure job link
      const jobLink = `${window.location.origin}/job/${job.id}`;
      await navigator.clipboard.writeText(jobLink);
      toast({
        title: "Job link copied!",
        description: `Link for ${job.customer_name} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to share job",
        description: "Could not copy job link",
        variant: "destructive",
      });
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
      case "quoted": return "default";
      case "scheduled": return "default";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getContactStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return X;
      case 'contacted': return Phone;
      case 'quoted': return DollarSign;
      case 'scheduled': return Calendar;
      case 'completed': return Check;
      default: return Clock;
    }
  };

  const getContactStatusText = (status: string, job: Job) => {
    switch (status) {
      case 'new': return 'Not contacted yet';
      case 'contacted': return 'Customer contacted';
      case 'quoted': return job.estimated_value > 0 ? `Quoted $${job.estimated_value.toLocaleString()}` : 'Quote sent';
      case 'scheduled': return 'Job scheduled';
      case 'completed': return 'Job completed';
      default: return status.replace('_', ' ');
    }
  };

  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-AU', {
      timeZone: profile?.timezone || 'Australia/Sydney',
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
                {/* Status Badge with Icon - matching dashboard style */}
                <div className="flex items-center justify-between">
                  {(() => {
                    const Icon = getContactStatusIcon(job.status);
                    return (
                      <Badge variant={getStatusColor(job.status)} className="text-sm">
                        <Icon className="h-4 w-4 mr-1" />
                        {getContactStatusText(job.status, job)}
                      </Badge>
                    );
                  })()}
                  <span 
                    className={`text-sm ${getTimeSinceColor(job.created_at)}`}
                    title={new Date(job.created_at).toLocaleString('en-AU', {
                      timeZone: profile?.timezone || 'Australia/Sydney',
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  >
                    Submitted {formatTimeSince(job.created_at)}
                  </span>
                </div>
                
                {/* Key Info */}
                {job.estimated_value > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Quote Amount</span>
                    <span className="text-lg font-semibold text-green-600">
                      ${job.estimated_value.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {/* Message Tradie Button for Clients */}
                {job.client_id && profile?.user_type === 'client' && (
                  <Button 
                    variant="default" 
                    className="w-full mt-2"
                    onClick={() => {
                      // In a real app, this would need the tradie's phone number
                      toast({
                        title: "Contact Tradie",
                        description: "This feature requires tradie contact information",
                      });
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Tradie
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

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
                    <div className="space-y-3">
                      {/* Price and Send Quote Button - Inline */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-2xl font-bold text-green-600">
                          ${job.estimated_value || '0'}
                        </div>
                        {/* Send Quote Button - Show when there's a quote value and status isn't already quoted */}
                        {job.estimated_value > 0 && job.status !== 'quoted' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleSendQuote}
                            className="flex-1 max-w-[50%]"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Send Quote
                          </Button>
                        )}
                      </div>
                      {/* Quote Sent Indicator */}
                      {job.status === 'quoted' && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Quote sent to customer
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Actions */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Communication Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleCall} className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSMS(job.customer_name, job.phone)}
                    disabled={job.sms_blocked}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {job.sms_blocked ? 'SMS Blocked' : 'Send SMS'}
                  </Button>
                  <Button variant="outline" onClick={handleMaps} className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Open Maps
                  </Button>
                  <Button variant="outline" onClick={() => shareJobLink(job)} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share Job
                  </Button>
                </div>
                
                {/* Separator */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Update Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={job.status === "contacted" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate("contacted")}
                    >
                      Contacted
                    </Button>
                    <Button 
                      variant={job.status === "quoted" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate("quoted")}
                    >
                      Quoted
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
              <div className="flex flex-col gap-2 items-end">
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
            
            {/* Edit Button - Below header on mobile */}
            <div className="flex justify-center mt-4">
              {!isEditMode && ((job.status === 'new' && profile?.user_type === 'client') || profile?.user_type === 'tradie') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEnterEditMode}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              )}
              {/* Save/Cancel buttons in edit mode */}
              {isEditMode && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSaveAll}
                    disabled={!hasChanges}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                {isEditMode ? (
                  <GooglePlacesAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Enter address or suburb"
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Trade Required</p>
                {isEditMode ? (
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select trade required" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADE_TYPES.map((trade) => (
                        <SelectItem key={trade.code} value={trade.label}>
                          {trade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm flex items-center">
                    {job.job_type}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description / Notes</p>
              {isEditMode ? (
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

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Preferred Time</p>
              {isEditMode ? (
                <Input
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="Enter preferred time (e.g., Any time today, Morning only)"
                  className="text-sm"
                />
              ) : (
                <p className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.preferred_time || 'No preference specified'}
                </p>
              )}
            </div>
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