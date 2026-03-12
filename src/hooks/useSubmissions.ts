'use client';

import type { ApiResponse } from '@/types/meeting';
import type {
  Submission,
  SubmissionResourceType,
  SubmissionStatus,
} from '@/types/submission';
import { useCallback, useState } from 'react';

interface UseSubmissionsResult {
  submissions: Submission[];
  isLoading: boolean;
  error: Error | null;
  fetchMySubmissions: (opts: { userId: string; type?: SubmissionResourceType }) => Promise<void>;
  listByResource: (opts: {
    resourceType: SubmissionResourceType;
    resourceId: string;
    ownerId?: string;
    status?: SubmissionStatus;
  }) => Promise<Submission[]>;
}

export function useSubmissions(): UseSubmissionsResult {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMySubmissions = useCallback(
    async ({ userId, type }: { userId: string; type?: SubmissionResourceType }) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({ userId });
        if (type) {
          params.set('type', type);
        }
        const res = await fetch(`/api/submissions?${params.toString()}`);
        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as ApiResponse<never> | null;
          throw new Error(json?.message || json?.error || 'Failed to fetch submissions');
        }

        const json = (await res.json()) as ApiResponse<Submission[]>;
        if (!json.success || !json.data) {
          throw new Error(json.message || json.error || 'Failed to fetch submissions');
        }

        setSubmissions(json.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch submissions'));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const listByResource = useCallback(
    async ({
      resourceType,
      resourceId,
      ownerId,
      status,
    }: {
      resourceType: SubmissionResourceType;
      resourceId: string;
      ownerId?: string;
      status?: SubmissionStatus;
    }) => {
      const params = new URLSearchParams({
        resourceType,
        resourceId,
      });
      if (ownerId) params.set('ownerId', ownerId);
      if (status) params.set('status', status);

      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as ApiResponse<never> | null;
        throw new Error(json?.message || json?.error || 'Failed to fetch submissions');
      }

      const json = (await res.json()) as ApiResponse<Submission[]>;
      if (!json.success || !json.data) {
        throw new Error(json.message || json.error || 'Failed to fetch submissions');
      }

      return json.data;
    },
    [],
  );

  return {
    submissions,
    isLoading,
    error,
    fetchMySubmissions,
    listByResource,
  };
}

