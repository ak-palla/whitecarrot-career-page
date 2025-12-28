/**
 * User type definitions
 * Based on Supabase Auth user schema
 */

export interface User {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at?: string;
  // Additional profile fields can be added here
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

