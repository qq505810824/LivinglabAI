'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { CaseCategory, CreateCaseInput, DifficultyLevel } from '@/types/case';
import React, { useState } from 'react';

interface CaseFormProps {
    mode: 'create' | 'edit';
    initialValues?: Partial<CreateCaseInput>;
    isSubmitting?: boolean;
    onSubmit: (values: CreateCaseInput) => Promise<void> | void;
    onCancel: () => void;
}

const emptyValues: CreateCaseInput = {
    title: '',
    department: '',
    category: 'open',
    difficulty: 'beginner',
    scenario: '',
    problem: '',
    existing_solution: '',
    deliverable: '',
    public_data: '',
    estimated_hours: 10,
    skills: [],
};

export const CaseForm: React.FC<CaseFormProps> = ({
    mode,
    initialValues,
    isSubmitting,
    onSubmit,
    onCancel,
}) => {
    const [form, setForm] = useState<CreateCaseInput>({
        ...emptyValues,
        ...initialValues,
        estimated_hours: initialValues?.estimated_hours ?? emptyValues.estimated_hours,
        skills: initialValues?.skills ?? [],
    });

    const handleChange = (field: keyof CreateCaseInput, value: any) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSkillsChange = (value: string) => {
        const skills = value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        handleChange('skills', skills);
    };

    const skillsText = form.skills.join(',');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(form);
    };

    return (
        <Card className="mb-8 p-6 bg-background-secondary border-border">
            <h2 className="text-xl font-bold text-text-primary mb-4">
                {mode === 'create' ? 'Create New Case' : 'Edit Case'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Title"
                        placeholder="AI-Powered Customer Service"
                        required
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />
                    <Input
                        label="Department"
                        placeholder="Engineering"
                        required
                        value={form.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Category
                        </label>
                        <select
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm"
                            required
                            value={form.category}
                            onChange={(e) => handleChange('category', e.target.value as CaseCategory)}
                        >
                            <option value="solved">Solved</option>
                            <option value="open">Open</option>
                            <option value="process">Process Optimization</option>
                            <option value="policy">Policy Making</option>
                            <option value="content">Content Creation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Difficulty
                        </label>
                        <select
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm"
                            required
                            value={form.difficulty}
                            onChange={(e) => handleChange('difficulty', e.target.value as DifficultyLevel)}
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <textarea
                    className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[100px]"
                    placeholder="Scenario Description"
                    required
                    value={form.scenario}
                    onChange={(e) => handleChange('scenario', e.target.value)}
                />

                <textarea
                    className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[80px]"
                    placeholder="Problem Statement"
                    required
                    value={form.problem}
                    onChange={(e) => handleChange('problem', e.target.value)}
                />

                <textarea
                    className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[80px]"
                    placeholder="Deliverable (what should students produce?)"
                    required
                    value={form.deliverable}
                    onChange={(e) => handleChange('deliverable', e.target.value)}
                />

                <textarea
                    className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[80px]"
                    placeholder="Public data or resources (optional)"
                    value={form.public_data || ''}
                    onChange={(e) => handleChange('public_data', e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Estimated Hours"
                        type="number"
                        min={1}
                        value={form.estimated_hours}
                        onChange={(e) => handleChange('estimated_hours', Number(e.target.value) || 1)}
                    />
                    <Input
                        label="Skills (comma separated)"
                        placeholder="Python, ML, NLP"
                        value={skillsText}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        {mode === 'create' ? 'Create Case' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
};

