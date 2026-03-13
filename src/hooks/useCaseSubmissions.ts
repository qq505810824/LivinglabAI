import { useSubmissions } from '@/hooks/useSubmissions';
import type { Submission } from '@/types/submission';
import { useEffect, useState } from 'react';

export function useCaseSubmissions(caseId: string | null, ownerId: string | null) {
  const { listByResource } = useSubmissions();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!caseId || !ownerId) return;
      try {
        setIsLoading(true);
        const data = await listByResource({
          resourceType: 'case_project',
          resourceId: caseId,
          ownerId,
        });
        setSubmissions(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [caseId, ownerId, listByResource]);

  return { submissions, isLoading, error };
}

