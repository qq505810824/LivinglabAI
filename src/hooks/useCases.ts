'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type { Case, CreateCaseInput } from '@/types/case';
import { useEffect, useState } from 'react';

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createBrowserClient();

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          organizations (
            name,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data
      const transformedCases = (data || []).map((item) => ({
        ...item,
        organization_name: item.organizations?.name,
        organization_logo: item.organizations?.logo_url,
      }));

      setCases(transformedCases);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cases'));
    } finally {
      setIsLoading(false);
    }
  };

  const getCaseById = async (caseId: string): Promise<Case | null> => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          organizations (
            name,
            logo_url
          )
        `)
        .eq('id', caseId)
        .single();

      if (error) throw error;

      return {
        ...data,
        organization_name: data.organizations?.name,
        organization_logo: data.organizations?.logo_url,
      } as Case;
    } catch (err) {
      console.error('Error fetching case:', err);
      return null;
    }
  };

  const createCase = async (input: CreateCaseInput, organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .insert({
          ...input,
          organization_id: organizationId,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh list
      await fetchCases();
      return data;
    } catch (err) {
      console.error('Error creating case:', err);
      throw err;
    }
  };

  const deleteCase = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId);

      if (error) throw error;

      // Refresh list
      await fetchCases();
    } catch (err) {
      console.error('Error deleting case:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return {
    cases,
    isLoading,
    error,
    refreshCases: fetchCases,
    getCaseById,
    createCase,
    deleteCase,
  };
}
