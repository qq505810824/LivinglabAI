'use client';

import { CaseForm } from '@/components/org/cases/CaseForm';
import { useCases } from '@/hooks/useCases';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrgCaseEditPage() {
    const { id } = useParams<{ id: string }>();
    const { getCaseById, updateCase } = useCases();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [initialValues, setInitialValues] = useState<any | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const data = await getCaseById(id);
                if (!cancelled && data) {
                    setInitialValues({
                        title: data.title,
                        department: data.department,
                        category: data.category,
                        difficulty: data.difficulty,
                        scenario: data.scenario,
                        problem: data.problem,
                        existing_solution: data.existing_solution,
                        deliverable: data.deliverable,
                        public_data: data.public_data,
                        estimated_hours: data.estimated_hours,
                        skills: data.skills,
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
                <h1 className="text-3xl font-bold text-text-primary mb-2">Edit Case</h1>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!initialValues) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Case not found</h1>
                <p className="text-text-secondary mb-4">
                    The case you are trying to edit could not be found.
                </p>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                    onClick={() => router.push('/dashboard/cases')}
                >
                    Back to Cases
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <CaseForm
                mode="edit"
                initialValues={initialValues}
                isSubmitting={isSubmitting}
                onSubmit={async (values) => {
                    setIsSubmitting(true);
                    try {
                        await updateCase(id, values);
                        router.push('/dashboard/cases');
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
                onCancel={() => router.push('/dashboard/cases')}
            />
        </div>
    );
}

