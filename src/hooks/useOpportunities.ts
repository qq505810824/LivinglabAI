'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type { CreateOpportunityInput, Opportunity } from '@/types/opportunity';
import { useEffect, useState } from 'react';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createBrowserClient();

  const fetchOpportunities = async (organizationId?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setOpportunities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch opportunities'));
    } finally {
      setIsLoading(false);
    }
  };

  const getOpportunityById = async (opportunityId: string): Promise<Opportunity | null> => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single();

      if (error) throw error;
      return data as Opportunity;
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      return null;
    }
  };

  const createOpportunity = async (input: CreateOpportunityInput, organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...input,
          organization_id: organizationId,
          status: input.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOpportunities(organizationId);
      return data;
    } catch (err) {
      console.error('Error creating opportunity:', err);
      throw err;
    }
  };

  const updateOpportunity = async (
    opportunityId: string,
    updates: Partial<Opportunity>,
    organizationId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', opportunityId);

      if (error) throw error;

      if (organizationId) {
        await fetchOpportunities(organizationId);
      }
    } catch (err) {
      console.error('Error updating opportunity:', err);
      throw err;
    }
  };

  const deleteOpportunity = async (opportunityId: string, organizationId?: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      if (organizationId) {
        await fetchOpportunities(organizationId);
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    isLoading,
    error,
    refreshOpportunities: fetchOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };
}
