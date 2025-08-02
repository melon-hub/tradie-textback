import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, BarChart3, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { JobManagementTable } from '@/components/admin/JobManagementTable';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">
              {profile?.name || 'Admin'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>
                View and manage all jobs across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}