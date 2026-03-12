'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { PageBack } from '@/components/common/PageBack';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useOpportunities } from '@/hooks/useOpportunities';
import type { Opportunity } from '@/types/opportunity';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function ApplyInternshipPage() {
    const params = useParams();
    const id = params.id as string;
    const { getOpportunityById } = useOpportunities();
    const { user } = useAuth();

    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [university, setUniversity] = useState('');
    const [url, setUrl] = useState('');
    const [why, setWhy] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadOpportunity = async () => {
            try {
                setIsLoading(true);
                if (!id || id === 'undefined') {
                    throw new Error('Invalid opportunity id');
                }

                const data = await getOpportunityById(id);
                if (!data) {
                    throw new Error('Opportunity not found');
                }

                setOpportunity(data as Opportunity);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load opportunity');
            } finally {
                setIsLoading(false);
            }
        };

        void loadOpportunity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(false);

        if (!fullName.trim()) {
            setSubmitError('Please enter your full name.');
            return;
        }
        if (!email.trim()) {
            setSubmitError('Please enter your email.');
            return;
        }
        if (!why.trim()) {
            setSubmitError('Please tell us why you are interested.');
            return;
        }

        if (!user) {
            setSubmitError('You need to be logged in to apply.');
            return;
        }

        setSubmitError(null);

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    resourceType: 'internship_application',
                    resourceId: id,
                    submitterName: fullName.trim() || user.username,
                    submitterEmail: email.trim() || user.email,
                    payload: {
                        fullName: fullName.trim(),
                        email: email.trim(),
                        university: university.trim() || null,
                        url: url.trim() || null,
                        why: why.trim(),
                    },
                }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.message || json?.error || 'Failed to submit application');
            }

            setSubmitted(true);
        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : 'Failed to submit application. Please try again.',
            );
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <CardLoader count={3} />
            </div>
        );
    }

    if (error || !opportunity) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <PageBack label="Back to internships" href="/internships" />
                <div className="mt-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                    {error || 'Opportunity not found.'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
            <PageBack label="Back to opportunity" href="/internships" />

            <Card className="p-6 bg-background-secondary border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">
                    Apply: {opportunity.title}
                </h1>
                <p className="text-sm text-text-secondary mb-4">
                    Fill out this short form to express your interest in this internship.
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Full Name *
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            placeholder="Your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            University &amp; Major
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            placeholder="e.g. NTU - Computer Science"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Portfolio / LinkedIn URL
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            placeholder="https://..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Why are you interested? *
                        </label>
                        <textarea
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[100px]"
                            placeholder="Tell us what excites you about this role..."
                            value={why}
                            onChange={(e) => setWhy(e.target.value)}
                        />
                    </div>

                    {submitError && (
                        <div className="text-sm text-danger bg-danger/5 border border-danger/40 rounded-lg px-3 py-2">
                            {submitError}
                        </div>
                    )}

                    {submitted && !submitError && (
                        <div className="text-sm text-success bg-success/5 border border-success/40 rounded-lg px-3 py-2">
                            Application submitted. Check console for payload.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                        >
                            📨 Submit Application
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

