import { supabase } from '@/integrations/supabase/client';

export interface TestJobConfig {
  customerName: string;
  phone: string;
  location: string;
  jobType: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  estimatedValue: number;
  hoursAgo: number;
  lastContactHoursAgo?: number;
}

export class TestDataManager {
  static async clearTestUserData(email?: string): Promise<void> {
    // Use the current user version that doesn't need email
    const { error } = await supabase.rpc('clear_current_user_test_data');
    
    if (error) {
      console.error('Error clearing test data:', error);
      throw error;
    }
  }

  static async createTestJob(tradieEmail: string, config: TestJobConfig): Promise<string> {
    // Use the current user version
    const { data, error } = await supabase.rpc('create_test_job_for_current_user', {
      customer_name: config.customerName,
      phone: config.phone,
      location: config.location,
      job_type: config.jobType,
      urgency: config.urgency,
      status: config.status,
      description: config.description,
      estimated_value: config.estimatedValue,
      hours_ago: config.hoursAgo,
      last_contact_hours_ago: config.lastContactHoursAgo
    });
    
    if (error) {
      console.error('Error creating test job:', error);
      throw error;
    }
    
    return data;
  }

  static async createTimeBasedTestJobs(tradieEmail?: string): Promise<void> {
    // Use the current user version
    const { error } = await supabase.rpc('create_time_based_test_jobs_for_current_user');
    
    if (error) {
      console.error('Error creating time-based test jobs:', error);
      throw error;
    }
  }

  static async getJobAgeStats(tradieEmail?: string) {
    // Use the current user version
    const { data, error } = await supabase.rpc('get_current_user_job_age_stats');
    
    if (error) {
      console.error('Error getting job age stats:', error);
      throw error;
    }
    
    return data;
  }

  // Preset job configurations for quick testing
  static readonly presets = {
    urgentNow: {
      customerName: 'Emergency Test',
      phone: '+61400000001',
      location: '1 Test St, Sydney NSW 2000',
      jobType: 'Emergency Plumbing',
      urgency: 'urgent' as const,
      status: 'new' as const,
      description: 'URGENT: Water leak flooding bathroom',
      estimatedValue: 500,
      hoursAgo: 0
    },
    todayMedium: {
      customerName: 'Today Test',
      phone: '+61400000002',
      location: '2 Test St, Sydney NSW 2000',
      jobType: 'Tap Repair',
      urgency: 'medium' as const,
      status: 'new' as const,
      description: 'Kitchen tap needs replacement',
      estimatedValue: 250,
      hoursAgo: 4
    },
    yesterdayInProgress: {
      customerName: 'Yesterday Test',
      phone: '+61400000003',
      location: '3 Test St, Sydney NSW 2000',
      jobType: 'Toilet Repair',
      urgency: 'high' as const,
      status: 'in_progress' as const,
      description: 'Toilet not flushing properly',
      estimatedValue: 300,
      hoursAgo: 28,
      lastContactHoursAgo: 24
    },
    lastWeekCompleted: {
      customerName: 'Last Week Test',
      phone: '+61400000004',
      location: '4 Test St, Sydney NSW 2000',
      jobType: 'Pipe Installation',
      urgency: 'low' as const,
      status: 'completed' as const,
      description: 'Install new water pipes for renovation',
      estimatedValue: 1200,
      hoursAgo: 168,
      lastContactHoursAgo: 168
    }
  };

  // Generate a range of jobs for testing time-based features
  static generateTimeRangeJobs(tradieEmail?: string, count: number = 20) {
    const jobs: Promise<string>[] = [];
    const statuses: TestJobConfig['status'][] = ['new', 'in_progress', 'completed'];
    const urgencies: TestJobConfig['urgency'][] = ['low', 'medium', 'high', 'urgent'];
    const jobTypes = ['Blocked Drain', 'Leaking Tap', 'Hot Water System', 'Toilet Repair', 'Gas Fitting'];
    
    for (let i = 0; i < count; i++) {
      const hoursAgo = Math.floor(Math.random() * 720); // Up to 30 days
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      
      const job: TestJobConfig = {
        customerName: `Test Customer ${i + 1}`,
        phone: `+614${String(i).padStart(8, '0')}`,
        location: `${i + 1} Test St, Sydney NSW 2000`,
        jobType,
        urgency,
        status,
        description: `Test job ${i + 1} - ${jobType}`,
        estimatedValue: 100 + Math.floor(Math.random() * 900),
        hoursAgo,
        lastContactHoursAgo: status !== 'new' ? hoursAgo - Math.floor(Math.random() * 24) : undefined
      };
      
      // Pass empty string for tradieEmail since we're using current user
      jobs.push(this.createTestJob('', job));
    }
    
    return Promise.all(jobs);
  }
}