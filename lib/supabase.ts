import { createClient, User, AuthError, Session } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database Types
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
          operation_date: string;
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
          operation_date?: string;
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
          operation_date?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id?: string;
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
          plan_id: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id?: string;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
          plan_id: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
          plan_id?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Auth Functions
export const auth = {
  // Sign up a new user
  async signUp(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (data.user && !error) {
        // Create user profile
        await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: data.user.id,
              email: data.user.email!,
              full_name: '',
            }
          ]);
      }

      return { user: data.user, session: data.session, error };
    } catch (err) {
      console.error('Sign up error:', err);
      return { user: null, session: null, error: err as AuthError };
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { user: data.user, session: data.session, error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { user: null, session: null, error: err as AuthError };
    }
  },

  // Sign out user
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: err as AuthError };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (err) {
      console.error('Get current user error:', err);
      return { user: null, error: err as AuthError };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: err as AuthError };
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database Functions
export const db = {
  // Track a PDF operation
  async trackOperation(
    userId: string, 
    operationType: 'merge' | 'split' | 'compress',
    filename: string,
    fileSize: number
  ): Promise<{ data: Database['public']['Tables']['operations']['Row'] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('operations')
        .insert([
          {
            user_id: userId,
            type: operationType,
            filename,
            file_size: fileSize,
            status: 'processing',
            operation_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
          }
        ])
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Track operation error:', err);
      return { data: null, error: err as Error };
    }
  },

  // Update operation status
  async updateOperationStatus(
    operationId: string,
    status: 'completed' | 'failed',
    errorMessage?: string
  ): Promise<{ data: Database['public']['Tables']['operations']['Row'] | null; error: Error | null }> {
    try {
      const updates: Database['public']['Tables']['operations']['Update'] = {
        status,
        completed_at: new Date().toISOString()
      };

      if (errorMessage) {
        updates.error_message = errorMessage;
      }

      const { data, error } = await supabase
        .from('operations')
        .update(updates)
        .eq('id', operationId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Update operation status error:', err);
      return { data: null, error: err as Error };
    }
  },

  // Get remaining operations for today (for free users)
  async getRemainingOperations(userId: string): Promise<{ remaining: number; isProUser: boolean; error: Error | null }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if user is Pro
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('plan_id', 'pro')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        return { remaining: 0, isProUser: false, error: subError };
      }

      const isProUser = !!subscription;
      
      // Pro users have unlimited operations
      if (isProUser) {
        return { remaining: Infinity, isProUser: true, error: null };
      }

      // Count today's operations for free users
      const { data, error } = await supabase
        .from('operations')
        .select('id')
        .eq('user_id', userId)
        .eq('operation_date', today);

      if (error) {
        return { remaining: 0, isProUser: false, error };
      }

      const usedOperations = data?.length || 0;
      const dailyLimit = 5; // Free tier limit
      const remaining = Math.max(0, dailyLimit - usedOperations);

      return { remaining, isProUser: false, error: null };
    } catch (err) {
      console.error('Get remaining operations error:', err);
      return { remaining: 0, isProUser: false, error: err as Error };
    }
  },

  // Get user subscription details
  async getUserSubscription(userId: string): Promise<{ subscription: Database['public']['Tables']['user_subscriptions']['Row'] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return { subscription: null, error };
      }

      return { subscription: data, error: null };
    } catch (err) {
      console.error('Get user subscription error:', err);
      return { subscription: null, error: err as Error };
    }
  },

  // Get user operations history
  async getUserOperations(userId: string, limit: number = 10): Promise<{ operations: Database['public']['Tables']['operations']['Row'][]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { operations: data || [], error };
    } catch (err) {
      console.error('Get user operations error:', err);
      return { operations: [], error: err as Error };
    }
  },

  // Create or update user subscription
  async upsertUserSubscription(subscriptionData: Database['public']['Tables']['user_subscriptions']['Insert']): Promise<{ data: Database['public']['Tables']['user_subscriptions']['Row'] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Upsert user subscription error:', err);
      return { data: null, error: err as Error };
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<{ profile: Database['public']['Tables']['user_profiles']['Row'] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { profile: data, error };
    } catch (err) {
      console.error('Get user profile error:', err);
      return { profile: null, error: err as Error };
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['user_profiles']['Update']>): Promise<{ data: Database['public']['Tables']['user_profiles']['Row'] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Update user profile error:', err);
      return { data: null, error: err as Error };
    }
  }
};