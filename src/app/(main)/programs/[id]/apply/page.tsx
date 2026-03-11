'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { PageBack } from '@/components/common/PageBack';
import { Card } from '@/components/ui/Card';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Opportunity } from '@/types/opportunity';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApplyProgramPage() {
    const params = useParams();
    const id = params.id as string;
    const { getOpportunityById } = useOpportunities();

    const [program, setProgram] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [university, setUniversity] = useState('');
    const [statement, setStatement] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadProgram = async () => {
            try {
                setIsLoading(true);
                if (!id || id === 'undefined') {
                    throw new Error('Invalid program id');
                }

                const data = await getOpportunityById(id);
                if (!data) {
                    throw new Error('Program not found');
                }

                setProgram(data as Opportunity);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load program');
            } finally {
                setIsLoading(false);
            }
        };

        void loadProgram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
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
        if (!statement.trim()) {
            setSubmitError('Please provide a statement of interest.');
            return;
        }

        setSubmitError(null);

        const payload = {
            programId: id,
            fullName: fullName.trim(),
            email: email.trim(),
            university: university.trim() || null,
            statement: statement.trim(),
        };

        // For now just print to console as requested
        // eslint-disable-next-line no-console
        console.log('Program application payload:', payload);

        setSubmitted(true);
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <CardLoader count={3} />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <PageBack label="Back to programs" href="/programs" />
                <div className="mt-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                    {error || 'Program not found.'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
            <PageBack label="Back to program" href="/programs" />

            <Card className="p-6 bg-background-secondary border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Apply: {program.title}</h1>
                <p className="text-sm text-text-secondary mb-4">
                    Tell us why you&apos;d like to join this program.
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
                            University &amp; Year
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            placeholder="e.g. NCCU - Junior"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Statement of Interest *
                        </label>
                        <textarea
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[120px]"
                            placeholder="Why do you want to join this program? What do you hope to gain?"
                            value={statement}
                            onChange={(e) => setStatement(e.target.value)}
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
                            📨 Submit
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

