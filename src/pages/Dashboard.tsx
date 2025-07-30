import { useState } from "react";
import { Phone, MessageSquare, MapPin, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Mock data for demonstration
const mockJobs = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    phone: "(555) 123-4567",
    jobType: "Bathroom Renovation",
    location: "Bondi, NSW",
    urgency: "high",
    lastContact: "2 hours ago",
    status: "new",
    estimatedValue: "$8,500"
  },
  {
    id: "2", 
    customerName: "Mike Chen",
    phone: "(555) 987-6543",
    jobType: "Kitchen Repair",
    location: "Surry Hills, NSW",
    urgency: "medium",
    lastContact: "4 hours ago", 
    status: "contacted",
    estimatedValue: "$3,200"
  },
  {
    id: "3",
    customerName: "Emma Wilson", 
    phone: "(555) 456-7890",
    jobType: "Deck Installation",
    location: "Manly, NSW",
    urgency: "low",
    lastContact: "1 day ago",
    status: "quote_sent", 
    estimatedValue: "$12,000"
  },
  {
    id: "4",
    customerName: "David Brown",
    phone: "(555) 321-9876", 
    jobType: "Plumbing Emergency",
    location: "Paddington, NSW",
    urgency: "high",
    lastContact: "30 minutes ago",
    status: "new",
    estimatedValue: "$450"
  }
];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

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

  const updateJobStatus = (jobId: string, newStatus: string) => {
    toast({
      title: "Status updated",
      description: `Job status changed to ${newStatus}`,
    });
  };

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const urgentJobs = filteredJobs.filter(job => job.urgency === "high").length;
  const newJobs = filteredJobs.filter(job => job.status === "new").length;
  const totalValue = filteredJobs.reduce((sum, job) => {
    return sum + parseFloat(job.estimatedValue.replace(/[$,]/g, ""));
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">TradiePro - Follow-up Central</p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
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

      {/* Job Cards */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{job.customerName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{job.jobType}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>Last contact: {job.lastContact}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getUrgencyColor(job.urgency)} className="text-xs">
                      {job.urgency.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge variant={getStatusColor(job.status)} className="text-xs">
                      {job.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{job.estimatedValue}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button 
                  onClick={() => handleCall(job.customerName, job.phone)}
                  className="h-12 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button 
                  onClick={() => handleSMS(job.customerName, job.phone)}
                  variant="outline"
                  className="h-12"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
              </div>

              {/* Status Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => updateJobStatus(job.id, "contacted")}
                  className="text-xs"
                >
                  Mark Contacted
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => updateJobStatus(job.id, "quote_sent")}
                  className="text-xs"
                >
                  Quote Sent
                </Button>
                <Link to={`/job/${job.id}`}>
                  <Button 
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;