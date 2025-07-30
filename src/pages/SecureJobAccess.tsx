import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JobLink {
  id: string;
  job_id: string;
  token: string;
  expires_at: string;
  created_for_phone: string;
  accessed_count: number;
}

interface Job {
  id: string;
  customer_name: string;
  phone: string;
  job_type: string;
  location: string;
  description: string;
  urgency: string;
  status: string;
  estimated_value: number;
  preferred_time: string;
}

const SecureJobAccess = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const phone = searchParams.get('phone');
  
  const [loading, setLoading] = useState(true);
  const [jobLink, setJobLink] = useState<JobLink | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId || !token) {
      setError('Invalid job link');
      setLoading(false);
      return;
    }

    verifyJobAccess();
  }, [jobId, token]);

  const verifyJobAccess = async () => {
    try {
      setLoading(true);
      setError('');

      // Verify job link token
      const { data: linkData, error: linkError } = await supabase
        .from('job_links')
        .select('*')
        .eq('job_id', jobId)
        .eq('token', token)
        .maybeSingle();

      if (linkError) throw linkError;

      if (!linkData) {
        setError('Job link not found or invalid');
        return;
      }

      // Check if expired
      if (new Date(linkData.expires_at) < new Date()) {
        setExpired(true);
        setError('This job link has expired');
        return;
      }

      setJobLink(linkData);

      // Update access count
      await supabase
        .from('job_links')
        .update({ 
          accessed_count: linkData.accessed_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', linkData.id);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

    } catch (error: any) {
      console.error('Job access error:', error);
      setError(error.message || 'Failed to access job');
    } finally {
      setLoading(false);
    }
  };

  const requestNewLink = async () => {
    if (!phone) {
      toast({
        title: "Phone number required",
        description: "Please contact the company for a new job link",
        variant: "destructive"
      });
      return;
    }

    try {
      // This would typically send an SMS with a new link
      // For now, we'll show a message
      toast({
        title: "New link requested",
        description: "A new job link will be sent to your phone shortly",
      });
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Could not request new link. Please contact the company.",
        variant: "destructive"
      });
    }
  };

  const goToJobDetails = () => {
    // Navigate to the protected job details with authentication
    navigate(`/job/${jobId}?token=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying job access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-orange/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {expired ? 'Link Expired' : 'Access Denied'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {expired && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This job link expired for security reasons. Links are valid for 30 days.
                </p>
                
                <Button 
                  onClick={requestNewLink}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Request New Link
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Need help? Contact TradiePro support</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job || !jobLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-orange/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeUntilExpiry = Math.ceil(
    (new Date(jobLink.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Security Badge */}
        <div className="text-center">
          <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-success">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Job Access</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Access Verified
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Job Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">{job.job_type}</h3>
              <p className="text-sm text-muted-foreground">
                Customer: {job.customer_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Location: {job.location}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Urgency: {job.urgency}
                </span>
                <span className="text-muted-foreground">
                  Status: {job.status}
                </span>
              </div>
            </div>

            {/* Access Info */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Link expires in:</span>
                <span className={timeUntilExpiry <= 3 ? 'text-destructive font-medium' : ''}>
                  {timeUntilExpiry} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Times accessed:</span>
                <span>{jobLink.accessed_count + 1}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={goToJobDetails}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Job Details
            </Button>

            {/* Expiry Warning */}
            {timeUntilExpiry <= 7 && (
              <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This link expires in {timeUntilExpiry} day{timeUntilExpiry !== 1 ? 's' : ''}. 
                  Save any important details now.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 This is a secure, time-limited job access link</p>
          <p>Links expire automatically for your security</p>
        </div>
      </div>
    </div>
  );
};

export default SecureJobAccess;