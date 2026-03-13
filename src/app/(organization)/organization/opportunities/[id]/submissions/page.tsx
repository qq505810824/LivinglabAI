'use client';

import { PageBack } from '@/components/common/PageBack';
import { Card } from '@/components/ui/Card';
import { OpportunitySubmissionDetailModal } from '@/components/org/opportunities/OpportunitySubmissionDetailModal';
import { OpportunitySummaryCard } from '@/components/org/opportunities/OpportunitySummaryCard';
import { useAuth } from '@/hooks/useAuth';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useOpportunitySubmissions } from '@/hooks/useOpportunitySubmissions';
import type { Opportunity } from '@/types/opportunity';
import type { Submission } from '@/types/submission';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrgOpportunitySubmissionsPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const { getOpportunityById } = useOpportunities();

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [oppError, setOppError] = useState<string | null>(null);
    const [isOppLoading, setIsOppLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setIsOppLoading(true);
                const data = await getOpportunityById(id);
                if (!data) {
                    throw new Error('Opportunity not found');
                }
                setOpportunity(data as Opportunity);
                setOppError(null);
            } catch (e) {
                setOppError(e instanceof Error ? e.message : 'Failed to load opportunity');
            } finally {
                setIsOppLoading(false);
            }
        };

        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const { submissions, isLoading: isSubsLoading, error: subsError } = useOpportunitySubmissions(
        opportunity,
        user?.id ?? null,
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <PageBack label="Back to opportunities" href="/organization/opportunities" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1">Opportunity Submissions</h1>
                    {opportunity && (
                        <p className="text-sm text-text-secondary">
                            {opportunity.title} · {submissions.length} applications
                        </p>
                    )}
                </div>
            </div>

            {opportunity && <OpportunitySummaryCard item={opportunity} />}

            {oppError && (
                <div className="text-sm text-danger bg-danger/5 border border-danger/40 rounded-lg px-3 py-2">
                    {oppError}
                </div>
            )}

            <Card className="p-4 bg-background-secondary border-border">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Applications</h2>
                {isSubsLoading ? (
                    <div className="py-10 text-center text-xs text-text-tertiary">
                        Loading submissions...
                    </div>
                ) : subsError ? (
                    <div className="py-3 text-xs text-danger bg-danger/5 border border-danger/40 rounded-lg px-3">
                        {subsError}
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="py-10 text-center text-xs text-text-tertiary">
                        No applications for this opportunity yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border bg-background-secondary">
                        <table className="min-w-full text-xs">
                            <thead className="bg-background-tertiary/60">
                                <tr className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                                    <th className="px-4 py-3">Applicant</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">University</th>
                                    <th className="px-4 py-3">Submitted At</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-t border-border/60 hover:bg-background-primary/60 transition-colors"
                                    >
                                        <td className="px-4 py-3 align-top text-text-primary">
                                            {s.submitter_name || '—'}
                                        </td>
                                        <td className="px-4 py-3 align-top text-text-secondary">
                                            {s.submitter_email || '—'}
                                        </td>
                                        <td className="px-4 py-3 align-top text-text-secondary capitalize">
                                            {s.status}
                                        </td>
                                        <td className="px-4 py-3 align-top text-text-secondary">
                                            {s.university ?? (s.payload as any)?.university ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 align-top text-text-tertiary">
                                            {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-4 py-3 align-top text-right">
                                            <button
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-text-secondary hover:bg-background-tertiary"
                                                onClick={() => setSelectedSubmission(s)}
                                            >
                                                View Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {selectedSubmission && (
                <OpportunitySubmissionDetailModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}
        </div>
    );
}

