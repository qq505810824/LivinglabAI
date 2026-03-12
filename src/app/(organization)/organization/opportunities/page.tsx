'use client';

import { InternshipDetailModal } from '@/components/internships/InternshipDetailModal';
import { OpportunitySubmissionsModal } from '@/components/org/opportunities/OpportunitySubmissionsModal';
import { OpportunityList } from '@/components/org/opportunities/OpportunityList';
import { useAuth } from '@/hooks/useAuth';
import { useOpportunities } from '@/hooks/useOpportunities';
import type { Opportunity } from '@/types/opportunity';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OrgOpportunitiesPage() {
    const { opportunities, isLoading, deleteOpportunity } = useOpportunities();
    const { user } = useAuth();
    const router = useRouter();
    const [selected, setSelected] = useState<Opportunity | null>(null);
    const [selectedForSubmissions, setSelectedForSubmissions] = useState<Opportunity | null>(null);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                    📌 Opportunities Management
                </h1>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        📌 Opportunities Management
                    </h1>
                    <p className="text-text-secondary">
                        Post and manage internship and program opportunities.
                    </p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                    onClick={() => router.push('/organization/opportunities/new')}
                >
                    <Plus className="w-4 h-4" />
                    Create Opportunity
                </button>
            </div>

            {/* List */}
            {opportunities.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-border rounded-2xl">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                        No Opportunities Yet
                    </h3>
                    <p className="text-text-secondary mb-4">
                        Start by creating your first opportunity
                    </p>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                        onClick={() => router.push('/organization/opportunities/new')}
                    >
                        <Plus className="w-4 h-4" />
                        Create Opportunity
                    </button>
                </div>
            ) : (
                <>
                    <OpportunityList
                        items={opportunities}
                        onEdit={(item) => {
                            router.push(`/organization/opportunities/${item.id}/edit`);
                        }}
                        onDelete={(id) => {
                            void deleteOpportunity(id);
                        }}
                        onSelect={(item) => setSelected(item)}
                        onViewSubmissions={(item) => setSelectedForSubmissions(item)}
                    />
                    <InternshipDetailModal
                        selected={selected}
                        applied={false}
                        onApply={() => {
                            /* no-op in org dashboard */
                        }}
                        onClose={() => setSelected(null)}
                        hideActions
                    />
                    <OpportunitySubmissionsModal
                        opportunity={selectedForSubmissions}
                        ownerId={user?.id ?? null}
                        onClose={() => setSelectedForSubmissions(null)}
                    />
                </>
            )}
        </div>
    );
}
