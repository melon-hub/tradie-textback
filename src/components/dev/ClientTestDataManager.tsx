import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Package, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

export function ClientTestDataManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientJobs, setClientJobs] = useState<any[]>([]);
  
  const isClient = profile?.user_type === 'client';

  const handleCreateClientTestJobs = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_test_client_jobs');
      
      if (error) throw error;
      
      toast({
        title: 'Test Jobs Created',
        description: 'Client test jobs have been created with the test tradie'
      });
      
      // Refresh the page to show new data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create test jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClientJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_client_jobs');
      
      if (error) throw error;
      
      setClientJobs(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: 'No Jobs Found',
          description: 'Create some test jobs first',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load client jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Client Test Data</CardTitle>
          <CardDescription className="text-orange-700">
            Switch to a client account to use these features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-600">
            Log in as <code className="font-mono">testclient@dev.local</code> to test client features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Client Test Data
        </CardTitle>
        <CardDescription>
          Create test jobs as a client to test your job views
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="grid gap-2">
            <Button
              onClick={handleCreateClientTestJobs}
              disabled={loading}
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Client Test Jobs
            </Button>
            
            <Button
              onClick={handleViewClientJobs}
              disabled={loading}
              variant="outline"
              className="w-full justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              View My Jobs ({clientJobs.length})
            </Button>
          </div>
        </div>
        
        {clientJobs.length > 0 && (
          <div className="space-y-2">
            <Label>Your Jobs</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {clientJobs.map((job) => (
                <div key={job.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{job.job_type}</div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        job.status === 'completed' ? 'secondary' :
                        job.status === 'in_progress' ? 'default' :
                        'outline'
                      }>
                        {job.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {job.tradie_business || job.tradie_name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Creates jobs "submitted" to the test tradie</p>
          <p>• Jobs will appear in your client dashboard</p>
          <p>• Simulates real client-tradie interactions</p>
        </div>
      </CardContent>
    </Card>
  );
}