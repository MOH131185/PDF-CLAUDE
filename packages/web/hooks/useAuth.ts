'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { auth } from '@/lib/supabase';
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
        const { user, error } = await auth.getCurrentUser();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setState({
          user: user,
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
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
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
      
      const { user, session, error } = await auth.signIn(email, password);

      if (error) {
        throw error;
      }

      return { user, session };
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
      
      const { user, session, error } = await auth.signUp(email, password);

      if (error) {
        throw error;
      }

      if (user && !session) {
        toast.success('Check your email for the confirmation link!');
      }

      return { user, session };
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
      
      const { error } = await auth.signOut();
      
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
      const { error } = await auth.resetPassword(email);

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