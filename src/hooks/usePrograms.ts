'use client';

import type { Program } from '@/types/program';
import type { ApiResponse } from '@/types/meeting';
import { useEffect, useState } from 'react';

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/programs');
      if (!res.ok) {
        throw new Error('Failed to fetch programs');
      }

      const json = (await res.json()) as ApiResponse<Program[]>;
      if (!json.success || !json.data) {
        throw new Error(json.message || json.error || 'Failed to fetch programs');
      }

      setPrograms(json.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch programs'));
    } finally {
      setIsLoading(false);
    }
  };

  const getProgramById = async (programId: string): Promise<Program | null> => {
    try {
      const res = await fetch(`/api/programs/${programId}`);
      if (!res.ok) {
        return null;
      }

      const json = (await res.json()) as ApiResponse<Program>;
      if (!json.success || !json.data) {
        return null;
      }

      return json.data;
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
      const res = await fetch(`/api/programs/${programId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as ApiResponse<any> | null;
        throw new Error(json?.message || json?.error || 'Failed to apply to program');
      }

      const json = (await res.json()) as ApiResponse<any>;
      if (!json.success) {
        throw new Error(json.message || json.error || 'Failed to apply to program');
      }

      // Refresh list to reflect applicants_count update
      await fetchPrograms();
      return json.data;
    } catch (err) {
      console.error('Error applying to program:', err);
      throw err;
    }
  };

  useEffect(() => {
    void fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
