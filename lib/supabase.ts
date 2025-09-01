import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      operations: {
        Row: {
          id: string;
          user_id: string;
          type: 'merge' | 'split' | 'compress';
          filename: string;
          file_size: number;
          status: 'processing' | 'completed' | 'failed';
          created_at: string;
          completed_at?: string;
          error_message?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'merge' | 'split' | 'compress';
          filename: string;
          file_size: number;
          status?: 'processing' | 'completed' | 'failed';
          created_at?: string;
          completed_at?: string;
          error_message?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'merge' | 'split' | 'compress';
          filename?: string;
          file_size?: number;
          status?: 'processing' | 'completed' | 'failed';
          created_at?: string;
          completed_at?: string;
          error_message?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};