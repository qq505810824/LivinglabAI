'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { PageBack } from '@/components/common/PageBack';
import { Card } from '@/components/ui/Card';
import { useCases } from '@/hooks/useCases';
import type { Case } from '@/types/case';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function StartProjectPage() {
    const params = useParams();
    const id = params.id as string;
    const { getCaseById } = useCases();
    const [caseItem, setCaseItem] = useState<Case | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teamSetup, setTeamSetup] = useState('solo');
    const [goal, setGoal] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadCase = async () => {
            try {
                setIsLoading(true);
                if (!id || id === 'undefined') {
                    throw new Error('Invalid case id');
                }

                const data = await getCaseById(id);
                if (!data) {
                    throw new Error('Case not found');
                }

                setCaseItem(data as Case);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load case');
            } finally {
                setIsLoading(false);
            }
        };

        loadCase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(false);

        if (!teamSetup) {
            setSubmitError('Please select a team setup.');
            return;
        }

        setSubmitError(null);

        const payload = {
            caseId: id,
            teamSetup,
            goal: goal.trim() || null,
        };

        // For now just print to console as requested
        // eslint-disable-next-line no-console
        console.log('Start project payload:', payload);

        setSubmitted(true);
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <CardLoader count={3} />
            </div>
        );
    }

    if (error || !caseItem) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <PageBack label="Back to cases" href="/cases" />
                <div className="mt-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                    {error || 'Case not found.'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
            <PageBack label="Back to case" href="/cases" />

            <Card className="p-6 bg-background-secondary border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Start Project</h1>
                <p className="text-sm text-text-secondary mb-4">
                    You&apos;re about to start working on:{' '}
                    <span className="font-semibold text-text-primary">{caseItem.title}</span>
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Team Setup *
                        </label>
                        <select
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            value={teamSetup}
                            onChange={(e) => setTeamSetup(e.target.value)}
                        >
                            <option value="solo">Solo Project</option>
                            <option value="pair">Pair (2 people)</option>
                            <option value="team">Team (3-5 people)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Your Goal (optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[80px]"
                            placeholder="What do you hope to learn or achieve?"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                        />
                    </div>

                    <div className="bg-background-tertiary rounded-xl border border-border/60 px-4 py-3 text-sm text-text-secondary space-y-1">
                        <p>
                            ⏱ Estimated time:{' '}
                            <span className="font-semibold text-text-primary">
                                {caseItem.estimated_hours} hours
                            </span>
                        </p>
                        {caseItem.deliverable && (
                            <p>
                                📦 Deliverable:{' '}
                                <span className="text-text-primary">{caseItem.deliverable}</span>
                            </p>
                        )}
                    </div>

                    {submitError && (
                        <div className="text-sm text-danger bg-danger/5 border border-danger/40 rounded-lg px-3 py-2">
                            {submitError}
                        </div>
                    )}

                    {submitted && !submitError && (
                        <div className="text-sm text-success bg-success/5 border border-success/40 rounded-lg px-3 py-2">
                            Form submitted. Check console for payload.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                        >
                            ✓ Confirm &amp; Start
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

