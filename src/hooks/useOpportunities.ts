'use client';

import type { ApiResponse } from '@/types/meeting';
import type { CreateOpportunityInput, Opportunity, OpportunityType } from '@/types/opportunity';
import { useEffect, useState } from 'react';

export function useOpportunities() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchOpportunities = async (organizationId?: string, type?: OpportunityType) => {
        try {
            setIsLoading(true);
            const url = organizationId
                ? `/api/opportunities?organizationId=${encodeURIComponent(organizationId)}&type=${encodeURIComponent(type ?? '')}`
                : `/api/opportunities?type=${encodeURIComponent(type ?? '')}`;

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch opportunities');
            }

            const json = (await res.json()) as ApiResponse<Opportunity[]>;
            if (!json.success || !json.data) {
                throw new Error(json.message || json.error || 'Failed to fetch opportunities');
            }

            setOpportunities(json.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch opportunities'));
        } finally {
            setIsLoading(false);
        }
    };

    const getOpportunityById = async (opportunityId: string): Promise<Opportunity | null> => {
        if (!opportunityId || opportunityId === 'undefined') {
            return null;
        }

        try {
            const res = await fetch(`/api/opportunities/${opportunityId}`);
            if (!res.ok) {
                return null;
            }

            const json = (await res.json()) as ApiResponse<Opportunity>;
            if (!json.success || !json.data) {
                return null;
            }

            return json.data;
        } catch (err) {
            console.error('Error fetching opportunity:', err);
            return null;
        }
    };

    const createOpportunity = async (input: CreateOpportunityInput, organizationId: string) => {
        try {
            const res = await fetch('/api/opportunities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input, organizationId }),
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => null)) as ApiResponse<Opportunity> | null;
                throw new Error(json?.message || json?.error || 'Failed to create opportunity');
            }

            const json = (await res.json()) as ApiResponse<Opportunity>;
            if (!json.success || !json.data) {
                throw new Error(json.message || json.error || 'Failed to create opportunity');
            }

            await fetchOpportunities(organizationId);
            return json.data;
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
            const res = await fetch(`/api/opportunities/${opportunityId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => null)) as ApiResponse<null> | null;
                throw new Error(json?.message || json?.error || 'Failed to update opportunity');
            }

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
            const res = await fetch(`/api/opportunities/${opportunityId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => null)) as ApiResponse<null> | null;
                throw new Error(json?.message || json?.error || 'Failed to delete opportunity');
            }

            if (organizationId) {
                await fetchOpportunities(organizationId);
            }
        } catch (err) {
            console.error('Error deleting opportunity:', err);
            throw err;
        }
    };

    useEffect(() => {
        void fetchOpportunities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
