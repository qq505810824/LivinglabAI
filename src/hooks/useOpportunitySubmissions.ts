import { useSubmissions } from '@/hooks/useSubmissions';
import type { Submission } from '@/types/submission';
import type { Opportunity } from '@/types/opportunity';
import { useEffect, useState } from 'react';

export function useOpportunitySubmissions(
  opportunity: Opportunity | null,
  ownerId: string | null,
) {
  const { listByResource } = useSubmissions();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!opportunity || !ownerId) return;
      try {
        setIsLoading(true);
        const resourceType =
          opportunity.type === 'internship' ? 'internship_application' : 'program_application';
        const data = await listByResource({
          resourceType,
          resourceId: opportunity.id,
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
  }, [opportunity, ownerId, listByResource]);

  return { submissions, isLoading, error };
}

