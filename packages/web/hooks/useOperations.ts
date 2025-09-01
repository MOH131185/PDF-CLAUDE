'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, db, Database } from '@/lib/supabase';
import { useAuth } from './useAuth';

type Operation = Database['public']['Tables']['operations']['Row'];

interface UseOperationsReturn {
  operations: Operation[];
  isLoading: boolean;
  error: string | null;
  remainingOperations: number;
  isProUser: boolean;
  subscription: Database['public']['Tables']['user_subscriptions']['Row'] | null;
  trackOperation: (operationType: 'merge' | 'split' | 'compress', filename: string, fileSize: number) => Promise<Operation | null>;
  updateOperationStatus: (operationId: string, status: 'completed' | 'failed', errorMessage?: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  checkUsageLimits: () => Promise<{ canProceed: boolean; remaining: number; isProUser: boolean }>;
}

export function useOperations(): UseOperationsReturn {
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingOperations, setRemainingOperations] = useState(0);
  const [isProUser, setIsProUser] = useState(false);
  const [subscription, setSubscription] = useState<Database['public']['Tables']['user_subscriptions']['Row'] | null>(null);

  const fetchOperations = useCallback(async () => {
    if (!user) {
      setOperations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { operations: fetchedOps, error } = await db.getUserOperations(user.id, 20);

      if (error) {
        throw error;
      }

      setOperations(fetchedOps);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch operations';
      setError(message);
      console.error('Error fetching operations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUsageLimits = useCallback(async () => {
    if (!user) {
      setRemainingOperations(0);
      setIsProUser(false);
      return;
    }

    try {
      const { remaining, isProUser: isPro, error } = await db.getRemainingOperations(user.id);
      
      if (error) {
        console.error('Error fetching usage limits:', error);
        setRemainingOperations(0);
        setIsProUser(false);
        return;
      }

      setRemainingOperations(remaining);
      setIsProUser(isPro);
    } catch (err) {
      console.error('Error fetching usage limits:', err);
      setRemainingOperations(0);
      setIsProUser(false);
    }
  }, [user]);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      const { subscription: userSub, error } = await db.getUserSubscription(user.id);
      
      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
        return;
      }

      setSubscription(userSub);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setSubscription(null);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOperations();
      fetchUsageLimits();
      fetchSubscription();
    }
  }, [user, fetchOperations, fetchUsageLimits, fetchSubscription]);

  const trackOperation = useCallback(
    async (operationType: 'merge' | 'split' | 'compress', filename: string, fileSize: number): Promise<Operation | null> => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        const { data, error } = await db.trackOperation(user.id, operationType, filename, fileSize);

        if (error) {
          throw error;
        }

        // Update local state
        if (data) {
          setOperations(prev => [data, ...prev]);
        }
        
        // Update remaining operations
        await fetchUsageLimits();
        
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to track operation';
        setError(message);
        console.error('Error tracking operation:', err);
        return null;
      }
    },
    [user, fetchUsageLimits]
  );

  const updateOperationStatus = useCallback(
    async (operationId: string, status: 'completed' | 'failed', errorMessage?: string): Promise<boolean> => {
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      try {
        const { data, error } = await db.updateOperationStatus(operationId, status, errorMessage);

        if (error) {
          throw error;
        }

        // Update local state
        if (data) {
          setOperations(prev =>
            prev.map(op => (op.id === operationId ? data : op))
          );
        }
        
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update operation';
        setError(message);
        console.error('Error updating operation:', err);
        return false;
      }
    },
    [user]
  );

  const checkUsageLimits = useCallback(async (): Promise<{ canProceed: boolean; remaining: number; isProUser: boolean }> => {
    if (!user) {
      return { canProceed: false, remaining: 0, isProUser: false };
    }

    try {
      const { remaining, isProUser: isPro, error } = await db.getRemainingOperations(user.id);
      
      if (error) {
        console.error('Error checking usage limits:', error);
        return { canProceed: false, remaining: 0, isProUser: false };
      }

      const canProceed = isPro || remaining > 0;
      
      // Update local state
      setRemainingOperations(remaining);
      setIsProUser(isPro);
      
      return { canProceed, remaining, isProUser: isPro };
    } catch (err) {
      console.error('Error checking usage limits:', err);
      return { canProceed: false, remaining: 0, isProUser: false };
    }
  }, [user]);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchOperations(),
      fetchUsageLimits(),
      fetchSubscription()
    ]);
  }, [fetchOperations, fetchUsageLimits, fetchSubscription]);

  // Real-time subscription for operations
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('operations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOperations(prev => [payload.new as Operation, ...prev]);
            fetchUsageLimits(); // Refresh limits when new operation is added
          } else if (payload.eventType === 'UPDATE') {
            setOperations(prev =>
              prev.map(op => (op.id === payload.new.id ? payload.new as Operation : op))
            );
          } else if (payload.eventType === 'DELETE') {
            setOperations(prev => prev.filter(op => op.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchUsageLimits]);

  return {
    operations,
    isLoading,
    error,
    remainingOperations,
    isProUser,
    subscription,
    trackOperation,
    updateOperationStatus,
    refetch,
    checkUsageLimits,
  };
}