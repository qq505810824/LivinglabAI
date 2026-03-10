'use client';

import { OpportunityForm } from '@/components/org/opportunities/OpportunityForm';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrgOpportunityEditPage() {
    const { id } = useParams<{ id: string }>();
    const { getOpportunityById, updateOpportunity } = useOpportunities();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [initialValues, setInitialValues] = useState<any | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const data = await getOpportunityById(id);
                if (!cancelled && data) {
                    setInitialValues({
                        type: data.type,
                        title: data.title,
                        description: data.description,
                        location: data.location,
                        duration: data.duration,
                        stipend: data.stipend,
                        deadline: data.deadline,
                        requirements: data.requirements,
                        perks: data.perks,
                        skills_required: data.skills_required,
                        status: data.status,
                    });
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setInitialLoaded(true);
                }
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoading && !initialLoaded) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Edit Opportunity</h1>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!initialValues) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Opportunity not found</h1>
                <p className="text-text-secondary mb-4">
                    The opportunity you are trying to edit could not be found.
                </p>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                    onClick={() => router.push('/dashboard/opportunities')}
                >
                    Back to Opportunities
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <OpportunityForm
                mode="edit"
                initialValues={initialValues}
                isSubmitting={isSubmitting}
                onSubmit={async (values) => {
                    setIsSubmitting(true);
                    try {
                        await updateOpportunity(id, values);
                        router.push('/organization/opportunities');
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
                onCancel={() => router.push('/organization/opportunities')}
            />
        </div>
    );
}

