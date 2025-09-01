'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from './useAuth';

type Operation = Database['public']['Tables']['operations']['Row'];

interface UseOperationsReturn {
  operations: Operation[];
  isLoading: boolean;
  error: string | null;
  createOperation: (operation: Omit<Operation, 'id' | 'user_id' | 'created_at'>) => Promise<Operation | null>;
  updateOperation: (id: string, updates: Partial<Operation>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useOperations(): UseOperationsReturn {
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOperations = useCallback(async () => {
    if (!user) {
      setOperations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOperations(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch operations';
      setError(message);
      console.error('Error fetching operations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  const createOperation = useCallback(
    async (operation: Omit<Operation, 'id' | 'user_id' | 'created_at'>): Promise<Operation | null> => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('operations')
          .insert({
            ...operation,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setOperations(prev => [data, ...prev]);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create operation';
        setError(message);
        console.error('Error creating operation:', err);
        return null;
      }
    },
    [user]
  );

  const updateOperation = useCallback(
    async (id: string, updates: Partial<Operation>): Promise<boolean> => {
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      try {
        const { data, error } = await supabase
          .from('operations')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setOperations(prev =>
          prev.map(op => (op.id === id ? data : op))
        );
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

  const refetch = useCallback(async () => {
    await fetchOperations();
  }, [fetchOperations]);

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
  }, [user]);

  return {
    operations,
    isLoading,
    error,
    createOperation,
    updateOperation,
    refetch,
  };
}