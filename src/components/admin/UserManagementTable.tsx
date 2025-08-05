import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { LoginAsButton } from './LoginAsButton';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  user_type: string;
  is_admin: boolean;
  created_at: string;
  address: string | null;
}

export function UserManagementTable() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProfiles();
  }, [currentPage, searchTerm]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setProfiles(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${currentStatus ? 'removed from' : 'added to'} admin role`,
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Table with responsive wrapper */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <Table className="min-w-[600px] md:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.name || 'Unnamed User'}
                  </TableCell>
                  <TableCell>
                    {profile.phone || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.user_type === 'tradie' ? 'default' : 'secondary'}>
                      {profile.user_type === 'tradie' ? <User className="h-3 w-3 mr-1" /> : null}
                      {profile.user_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {profile.is_admin ? (
                      <Badge variant="destructive">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(profile.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={profile.is_admin ? 'destructive' : 'default'}
                        onClick={() => toggleAdmin(profile.user_id, profile.is_admin)}
                      >
                        {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      {profile.user_id !== user?.id && (
                        <LoginAsButton 
                          userId={profile.user_id} 
                          userName={profile.name} 
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} users
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}