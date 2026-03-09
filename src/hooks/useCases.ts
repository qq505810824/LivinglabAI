'use client';

import type { Case, CreateCaseInput } from '@/types/case';
import type { ApiResponse } from '@/types/meeting';
import { useEffect, useState } from 'react';

export function useCases() {
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCases = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/cases');
            if (!res.ok) {
                throw new Error('Failed to fetch cases');
            }

            const json = (await res.json()) as ApiResponse<Case[]>;
            if (!json.success || !json.data) {
                throw new Error(json.message || json.error || 'Failed to fetch cases');
            }

            setCases(json.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch cases'));
        } finally {
            setIsLoading(false);
        }
    };

    const getCaseById = async (caseId: string): Promise<Case | null> => {
        try {
            const res = await fetch(`/api/cases/${caseId}`);
            if (!res.ok) {
                return null;
            }

            const json = (await res.json()) as ApiResponse<Case>;
            if (!json.success || !json.data) {
                return null;
            }

            return json.data;
        } catch (err) {
            console.error('Error fetching case:', err);
            return null;
        }
    };

    const createCase = async (input: CreateCaseInput, organizationId: string) => {
        try {
            const res = await fetch('/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input, organizationId }),
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => null)) as ApiResponse<Case> | null;
                throw new Error(json?.message || json?.error || 'Failed to create case');
            }

            const json = (await res.json()) as ApiResponse<Case>;
            if (!json.success || !json.data) {
                throw new Error(json.message || json.error || 'Failed to create case');
            }

            await fetchCases();
            return json.data;
        } catch (err) {
            console.error('Error creating case:', err);
            throw err;
        }
    };

    const deleteCase = async (caseId: string) => {
        try {
            const res = await fetch(`/api/cases/${caseId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => null)) as ApiResponse<null> | null;
                throw new Error(json?.message || json?.error || 'Failed to delete case');
            }

            await fetchCases();
        } catch (err) {
            console.error('Error deleting case:', err);
            throw err;
        }
    };

    useEffect(() => {
        void fetchCases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
