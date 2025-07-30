import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalJobs: number;
  newJobs: number;
  completedJobs: number;
  totalValue: number;
  avgResponseTime: number;
  conversionRate: number;
  urgentJobs: number;
  weeklyGrowth: number;
  popularJobTypes: Array<{ type: string; count: number }>;
  monthlyStats: Array<{ month: string; jobs: number; value: number }>;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all jobs for analysis
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      if (!jobs) {
        setAnalytics(null);
        return;
      }

      // Calculate current week and previous week
      const now = new Date();
      const currentWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Filter jobs by time periods
      const currentWeekJobs = jobs.filter(job => 
        new Date(job.created_at) >= currentWeekStart
      );
      const previousWeekJobs = jobs.filter(job => {
        const createdAt = new Date(job.created_at);
        return createdAt >= previousWeekStart && createdAt < currentWeekStart;
      });

      // Calculate basic metrics
      const totalJobs = jobs.length;
      const newJobs = jobs.filter(job => job.status === 'new').length;
      const completedJobs = jobs.filter(job => job.status === 'completed').length;
      const urgentJobs = jobs.filter(job => job.urgency === 'high').length;
      const totalValue = jobs.reduce((sum, job) => sum + (job.estimated_value || 0), 0);

      // Calculate conversion rate (completed / total)
      const conversionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

      // Calculate weekly growth
      const weeklyGrowth = previousWeekJobs.length > 0 
        ? ((currentWeekJobs.length - previousWeekJobs.length) / previousWeekJobs.length) * 100 
        : currentWeekJobs.length > 0 ? 100 : 0;

      // Calculate average response time (mock data for now)
      const avgResponseTime = jobs.length > 0 ? Math.random() * 24 + 1 : 0; // Hours

      // Calculate popular job types
      const jobTypeCounts = jobs.reduce((acc, job) => {
        acc[job.job_type] = (acc[job.job_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularJobTypes = Object.entries(jobTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate monthly stats (last 6 months)
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthJobs = jobs.filter(job => {
          const createdAt = new Date(job.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        });

        const monthValue = monthJobs.reduce((sum, job) => sum + (job.estimated_value || 0), 0);

        monthlyStats.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          jobs: monthJobs.length,
          value: monthValue
        });
      }

      const analyticsData: AnalyticsData = {
        totalJobs,
        newJobs,
        completedJobs,
        totalValue,
        avgResponseTime,
        conversionRate,
        urgentJobs,
        weeklyGrowth,
        popularJobTypes,
        monthlyStats
      };

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Track events (for future integration with analytics services)
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    console.log('Analytics Event:', event, properties);
    // Here you could integrate with services like Mixpanel, Google Analytics, etc.
  };

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          fetchAnalytics(); // Refresh analytics when jobs change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    trackEvent
  };
};