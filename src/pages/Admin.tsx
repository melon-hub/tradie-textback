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
          <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2 md:gap-4 items-center">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile?.name || 'Admin'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px] sm:max-w-[500px] md:max-w-[600px] mx-auto lg:mx-0">
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Jobs</span>
            <span className="sm:hidden">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
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