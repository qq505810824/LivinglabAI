'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type { Program } from '@/types/program';
import { useEffect, useState } from 'react';

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createBrowserClient();

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'active')
        .order('deadline', { ascending: true });

      if (queryError) throw queryError;
      setPrograms(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch programs'));
    } finally {
      setIsLoading(false);
    }
  };

  const getProgramById = async (programId: string): Promise<Program | null> => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (error) throw error;
      return data as Program;
    } catch (err) {
      console.error('Error fetching program:', err);
      return null;
    }
  };

  interface ApplicationData {
    user_id: string;
    full_name: string;
    email: string;
    university?: string;
    year?: string;
    major?: string;
    statement: string;
    resume_url?: string;
    portfolio_url?: string;
  }

  const applyToProgram = async (programId: string, applicationData: ApplicationData) => {
    try {
      const { data, error } = await supabase
        .from('program_applications')
        .insert({
          program_id: programId,
          ...applicationData,
        })
        .select()
        .single();

      if (error) throw error;

      // Increment applicants count
      const program = await getProgramById(programId);
      if (program) {
        await supabase
          .from('programs')
          .update({ applicants_count: program.applicants_count + 1 })
          .eq('id', programId);
      }

      return data;
    } catch (err) {
      console.error('Error applying to program:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return {
    programs,
    isLoading,
    error,
    refreshPrograms: fetchPrograms,
    getProgramById,
    applyToProgram,
  };
}
