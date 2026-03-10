'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { CreateOpportunityInput, OpportunityType } from '@/types/opportunity';
import React, { useState } from 'react';

interface OpportunityFormProps {
    mode: 'create' | 'edit';
    initialValues?: Partial<CreateOpportunityInput>;
    isSubmitting?: boolean;
    onSubmit: (values: CreateOpportunityInput) => Promise<void> | void;
    onCancel: () => void;
}

const emptyValues: CreateOpportunityInput = {
    type: 'internship',
    title: '',
    description: '',
    location: '',
    duration: '',
    stipend: '',
    deadline: '',
    requirements: [],
    perks: [],
    skills_required: [],
    status: 'active',
};

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
    mode,
    initialValues,
    isSubmitting,
    onSubmit,
    onCancel,
}) => {
    const [form, setForm] = useState<CreateOpportunityInput>({
        ...emptyValues,
        ...initialValues,
        requirements: initialValues?.requirements ?? [],
        perks: initialValues?.perks ?? [],
        skills_required: initialValues?.skills_required ?? [],
    });

    const handleChange = (field: keyof CreateOpportunityInput, value: any) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const toText = (arr?: string[]) => (arr && arr.length ? arr.join(', ') : '');
    const fromLines = (value: string) =>
        value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(form);
    };

    return (
        <Card className="mb-8 p-6 bg-background-secondary border-border">
            <h2 className="text-xl font-bold text-text-primary mb-4">
                {mode === 'create' ? 'Create New Opportunity' : 'Edit Opportunity'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Title *"
                        placeholder="e.g. AI Product Intern"
                        required
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Opportunity Type *
                        </label>
                        <select
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm"
                            required
                            value={form.type}
                            onChange={(e) => handleChange('type', e.target.value as OpportunityType)}
                        >
                            <option value="internship">💼 Internship</option>
                            <option value="program">🎓 Summer Program</option>
                        </select>
                    </div>
                </div>

                <Input
                    label="Organization / Company *"
                    placeholder="e.g. TechCorp"
                    required
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                />

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Description *
                    </label>
                    <textarea
                        className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[100px]"
                        placeholder="What will participants do? What will they learn?"
                        required
                        value={form.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Location"
                        placeholder="San Francisco, CA"
                        value={form.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                    />
                    <Input
                        label="Duration"
                        placeholder="e.g. 3 months"
                        value={form.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}
                    />
                    <Input
                        label="Stipend / Cost"
                        placeholder="e.g. NT$30,000/month or Free"
                        value={form.stipend}
                        onChange={(e) => handleChange('stipend', e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Application Deadline
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            value={form.deadline}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Requirements (one per line)
                    </label>
                    <textarea
                        className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[80px]"
                        placeholder={'e.g.\nPython proficiency\nInterest in AI\nPortfolio preferred'}
                        value={form.requirements.join('\n')}
                        onChange={(e) => handleChange('requirements', fromLines(e.target.value))}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        {mode === 'create' ? 'Create Opportunity' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
};

