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
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import PhotoUpload from "@/components/PhotoUpload";
import { useAuth } from "@/hooks/useAuth";

const JobCard = () => {
  const [status, setStatus] = useState("new");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile
    setTimeout(() => setLoading(false), 100);
  }, []);

  // Use the actual job ID from URL params, or fallback to a valid UUID for demo
  const actualJobId = jobId || "550e8400-e29b-41d4-a716-446655440000";

  // Mock job data - using a valid UUID format
  const job = {
    id: actualJobId,
    customer: {
      name: "Jane Bennett",
      phone: "+61412345678",
      suburb: "Thornbury, VIC",
      address: "45 Smith Street, Thornbury VIC 3071"
    },
    job: {
      type: "Plumbing",
      issue: "Kitchen tap leak",
      description: "Kitchen tap is leaking from the base. Happens when turning on hot water. Getting worse over the last few days.",
      urgency: "urgent",
      preferredTime: "Tuesday 10-12pm",
      propertyType: "House",
      submittedAt: "2024-01-15T14:30:00Z"
    },
    photos: [
      { id: 1, url: "/api/placeholder/300/200", description: "Kitchen tap" },
      { id: 2, url: "/api/placeholder/300/200", description: "Under sink" }
    ],
    activity: [
      { time: "2:30 PM", action: "Job submitted", type: "created" },
    ]
  };

  const handleStatusUpdate = (newStatus: string) => {
    setStatus(newStatus);
    toast({
      title: "Status updated ✅",
      description: `Job marked as ${newStatus}`,
    });
  };

  const handleCall = () => {
    window.open(`tel:${job.customer.phone}`, '_self');
  };

  const handleMaps = () => {
    const encodedAddress = encodeURIComponent(job.customer.address);
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
      case "urgent": return "destructive";
      case "soon": return "warning";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "called": return "default";
      case "quoted": return "warning";
      case "won": return "success";
      case "lost": return "destructive";
      default: return "secondary";
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
                  <Badge variant={getStatusColor(status)} className="text-sm">
                    {status === "new" && "Awaiting Response"}
                    {status === "called" && "Tradie Has Called"}
                    {status === "quoted" && "Quote Sent"}
                    {status === "won" && "Job Scheduled"}
                    {status === "lost" && "Job Cancelled"}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>Your job request has been received</span>
                  </div>
                  {status !== "new" && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span>The tradie has reviewed your request</span>
                    </div>
                  )}
                  {(status === "quoted" || status === "won") && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>You should have received a quote</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={handleMaps} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Job Location
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Tradie View - Original Quick Actions
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

        {/* Status Update - Only for Tradies */}
        {profile?.user_type !== 'client' && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Update Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={status === "called" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusUpdate("called")}
                >
                  Called
                </Button>
                <Button 
                  variant={status === "quoted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusUpdate("quoted")}
                >
                  Quoted
                </Button>
                <Button 
                  variant={status === "won" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusUpdate("won")}
                >
                  Won
                </Button>
                <Button 
                  variant={status === "lost" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusUpdate("lost")}
                >
                  Lost
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <CardTitle className="text-lg">{job.customer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.customer.phone}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant={getUrgencyColor(job.job.urgency)}>
                  {job.job.urgency === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {job.job.urgency.charAt(0).toUpperCase() + job.job.urgency.slice(1)}
                </Badge>
                <Badge variant={getStatusColor(status)}>
                  {status === "won" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  {job.customer.suburb}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Property</p>
                <p className="text-sm flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  {job.job.propertyType}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Job Type</p>
              <p className="font-medium">{job.job.type} → {job.job.issue}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{job.job.description}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Preferred Time</p>
              <p className="text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {job.job.preferredTime}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photos - Different views for Clients vs Tradies */}
        {profile?.user_type === 'client' ? (
          // Client View - Show their submitted photos
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Submitted Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {job.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {job.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photos submitted with this job</p>
              )}
            </CardContent>
          </Card>
        ) : (
          // Tradie View - Can upload additional photos
          <PhotoUpload 
            jobId={job.id}
            maxPhotos={8}
            onPhotoUploaded={(photo) => {
              toast({
                title: "Photo uploaded",
                description: "Job photo added successfully"
              });
            }}
          />
        )}

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>
              {profile?.user_type === 'client' ? 'Job Timeline' : 'Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{activity.action}</span>
                  <span className="text-muted-foreground">{activity.time}</span>
                </div>
              ))}
              {status !== "new" && (
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {profile?.user_type === 'client' 
                      ? `Tradie ${status === "called" ? "has called you" : 
                          status === "quoted" ? "sent a quote" :
                          status === "won" ? "scheduled the job" :
                          status === "lost" ? "cancelled the job" : 
                          "updated the status"}`
                      : `Status updated to ${status}`}
                  </span>
                  <span className="text-muted-foreground">Just now</span>
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