'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setState({
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          loading: false,
          initialized: true,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState({
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        });

        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to sign in');
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        toast.success('Check your email for the confirmation link!');
      }

      return data;
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to create account');
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to sign out');
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent!');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to send reset email');
      throw error;
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    initialized: state.initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}