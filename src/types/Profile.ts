// Generated Supabase Profile type based on database schema
export type Profile = {
  id: string;
  email: string;
  user_type: 'client' | 'contractor' | 'admin';
  created_at: string;
  updated_at: string;
  // Add any additional fields from your Supabase profiles table here
};
