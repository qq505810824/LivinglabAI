'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type {
    CaseCategory,
    CaseIndustry,
    CompanySize,
    CreateCaseInput,
    DeliverableType,
    DifficultyLevel,
} from '@/types/case';
import React, { useCallback, useMemo, useState } from 'react';

const STEP_TITLES = ['Company', 'Problem', 'Deliverable', 'Review'];
const INPUT_CLASS =
    'w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
const LABEL_CLASS = 'block text-sm font-medium text-text-secondary mb-1';

interface CaseFormProps {
    mode: 'create' | 'edit';
    initialValues?: Partial<CreateCaseInput>;
    isSubmitting?: boolean;
    onSubmit: (values: CreateCaseInput) => Promise<void> | void;
    onCancel: () => void;
}

const emptyValues: CreateCaseInput = {
    title: '',
    company_name: '',
    industry: undefined,
    company_size: undefined,
    department: '',
    category: 'open',
    difficulty: 'intermediate',
    scenario: '',
    problem: '',
    existing_solution: '',
    deliverable: '',
    deliverable_type: undefined,
    public_data: '',
    estimated_hours: 10,
    skills: [],
};

const INDUSTRY_OPTIONS: { value: CaseIndustry; label: string }[] = [
    { value: 'tech', label: 'Technology' },
    { value: 'retail', label: 'Retail / E-commerce' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
];

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '200+', label: '200+' },
];

const DEPT_OPTIONS = [
    'Marketing',
    'Operations',
    'HR',
    'Finance',
    'Engineering',
    'Strategy',
];

const DELIVERABLE_TYPE_OPTIONS: { value: DeliverableType; label: string }[] = [
    { value: 'report', label: 'Research Report' },
    { value: 'prototype', label: 'Working Prototype / Demo' },
    { value: 'strategy', label: 'Strategy / Recommendations' },
    { value: 'policy', label: 'Policy Document' },
    { value: 'creative', label: 'Creative / Content Plan' },
];

export const CaseForm: React.FC<CaseFormProps> = ({
    mode,
    initialValues,
    isSubmitting,
    onSubmit,
    onCancel,
}) => {
    const [step, setStep] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const initialForm = useMemo(
        () => ({
            ...emptyValues,
            ...initialValues,
            title: initialValues?.title ?? emptyValues.title,
            company_name: initialValues?.company_name ?? emptyValues.company_name,
            department: initialValues?.department ?? emptyValues.department,
            scenario: initialValues?.scenario ?? emptyValues.scenario,
            problem: initialValues?.problem ?? emptyValues.problem,
            deliverable: initialValues?.deliverable ?? emptyValues.deliverable,
            estimated_hours: initialValues?.estimated_hours ?? emptyValues.estimated_hours,
            skills: initialValues?.skills ?? emptyValues.skills,
        }),
        [],
    );
    const [form, setForm] = useState<CreateCaseInput>(initialForm);

    const handleChange = (field: keyof CreateCaseInput, value: unknown) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrorMessage(null);
    };

    const [skillInput, setSkillInput] = useState('');
    const skillsList = Array.isArray(form.skills) ? form.skills : [];

    const addSkill = useCallback((raw: string) => {
        const value = raw.trim();
        if (!value) return;
        setForm((prev) => {
            const list = Array.isArray(prev.skills) ? prev.skills : [];
            if (list.includes(value)) return prev;
            return { ...prev, skills: [...list, value] };
        });
        setErrorMessage(null);
        setSkillInput('');
    }, []);

    const removeSkill = useCallback((index: number) => {
        setForm((prev) => ({
            ...prev,
            skills: (Array.isArray(prev.skills) ? prev.skills : []).filter((_, i) => i !== index),
        }));
        setErrorMessage(null);
    }, []);

    // Step 0: Company Name*, Industry*, Company Size, Department*, Title*
    const validateStep0 = (): boolean => {
        if (!form.company_name?.trim()) {
            setErrorMessage('Please enter Company Name');
            return false;
        }
        if (!form.industry) {
            setErrorMessage('Please select Industry');
            return false;
        }
        if (!form.department?.trim()) {
            setErrorMessage('Please select Department');
            return false;
        }
        if (!form.title?.trim()) {
            setErrorMessage('Please enter Case Title');
            return false;
        }
        setErrorMessage(null);
        return true;
    };

    // Step 1: Scenario*, Problem*
    const validateStep1 = (): boolean => {
        if (!form.scenario?.trim()) {
            setErrorMessage('Please describe the scenario');
            return false;
        }
        if (!form.problem?.trim()) {
            setErrorMessage("Please describe the problem or challenge");
            return false;
        }
        setErrorMessage(null);
        return true;
    };

    // Step 2: Deliverable type*, Deliverable desc*, Difficulty*, Hours*, Skills optional
    const validateStep2 = (): boolean => {
        if (!form.deliverable_type) {
            setErrorMessage('Please select a deliverable type');
            return false;
        }
        if (!form.deliverable?.trim()) {
            setErrorMessage('Please describe the expected deliverable');
            return false;
        }
        if (!form.difficulty) {
            setErrorMessage('Please select difficulty');
            return false;
        }
        if (form.estimated_hours == null || form.estimated_hours < 1) {
            setErrorMessage('Please set estimated hours (min 1)');
            return false;
        }
        setErrorMessage(null);
        return true;
    };

    const handleNext = () => {
        if (step === 0 && !validateStep0()) return;
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep((s) => Math.min(s + 1, 3));
    };

    const handleBack = () => {
        setErrorMessage(null);
        setStep((s) => Math.max(s - 1, 0));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        if (step !== 3) return;
        await onSubmit(form);
    };

    const renderStep0 = () => (
        <>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                🏢 Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Company Name *"
                    placeholder="e.g. TechCorp Inc."
                    value={form.company_name ?? ''}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                />
                <div>
                    <label className={LABEL_CLASS}>Industry *</label>
                    <select
                        className={INPUT_CLASS}
                        value={form.industry ?? ''}
                        onChange={(e) =>
                            handleChange('industry', e.target.value ? (e.target.value as CaseIndustry) : undefined)
                        }
                    >
                        <option value="">Select...</option>
                        {INDUSTRY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className={LABEL_CLASS}>Company Size</label>
                    <select
                        className={INPUT_CLASS}
                        value={form.company_size ?? ''}
                        onChange={(e) =>
                            handleChange('company_size', e.target.value ? (e.target.value as CompanySize) : undefined)
                        }
                    >
                        <option value="">Select...</option>
                        {SIZE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={LABEL_CLASS}>Department *</label>
                    <select
                        className={INPUT_CLASS}
                        value={form.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                    >
                        <option value="">Select...</option>
                        {DEPT_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                                {d === 'HR' ? 'Human Resources' : d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-4">
                <Input
                    label="Case Title *"
                    placeholder="e.g. AI-Powered Customer Service"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>
            <div className="flex justify-end mt-6">
                <Button type="button" onClick={handleNext}>
                    Next →
                </Button>
            </div>
        </>
    );

    const renderStep1 = () => (
        <>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                💡 Problem Description
            </h3>
            <div className="space-y-4">
                <div>
                    <label className={LABEL_CLASS}>Describe the scenario *</label>
                    <textarea
                        className={`${INPUT_CLASS} min-h-[80px]`}
                        placeholder="What does your team do? What's the context?"
                        value={form.scenario}
                        onChange={(e) => handleChange('scenario', e.target.value)}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASS}>What's the problem or challenge? *</label>
                    <textarea
                        className={`${INPUT_CLASS} min-h-[80px]`}
                        placeholder="What pain point are you experiencing?"
                        value={form.problem}
                        onChange={(e) => handleChange('problem', e.target.value)}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Have you tried any solutions?</label>
                    <textarea
                        className={`${INPUT_CLASS} min-h-[60px]`}
                        placeholder="Any tools or approaches tried?"
                        value={form.existing_solution ?? ''}
                        onChange={(e) => handleChange('existing_solution', e.target.value)}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASS}>What public data can you share?</label>
                    <textarea
                        className={`${INPUT_CLASS} min-h-[60px]`}
                        placeholder="e.g. sample documents, process diagrams, templates..."
                        value={form.public_data ?? ''}
                        onChange={(e) => handleChange('public_data', e.target.value)}
                    />
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handleBack}>
                    ← Back
                </Button>
                <Button type="button" onClick={handleNext}>
                    Next →
                </Button>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                📦 Expected Output
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        What type of deliverable do you want? *
                    </label>
                    <select
                        className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                        value={form.deliverable_type ?? ''}
                        onChange={(e) =>
                            handleChange(
                                'deliverable_type',
                                e.target.value ? (e.target.value as DeliverableType) : undefined,
                            )
                        }
                    >
                        <option value="">Select...</option>
                        {DELIVERABLE_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Describe the ideal deliverable *
                    </label>
                    <textarea
                        className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[60px]"
                        placeholder="What would success look like?"
                        value={form.deliverable}
                        onChange={(e) => handleChange('deliverable', e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Suggested Difficulty *
                        </label>
                        <select
                            className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
                            value={form.difficulty}
                            onChange={(e) =>
                                handleChange('difficulty', e.target.value as DifficultyLevel)
                            }
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <Input
                        label="Estimated Hours *"
                        type="number"
                        min={1}
                        max={100}
                        value={form.estimated_hours}
                        onChange={(e) =>
                            handleChange('estimated_hours', Number(e.target.value) || 1)
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Category
                    </label>
                    <select
                        className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary"
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
                    <label className={LABEL_CLASS}>Relevant Skills</label>
                    <div
                        className={`${INPUT_CLASS} min-h-[42px] flex flex-wrap items-center gap-2 py-1.5`}
                    >
                        {skillsList.map((s, i) => (
                            <span
                                key={`${s}-${i}`}
                                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/15 text-primary text-sm"
                            >
                                {s}
                                <button
                                    type="button"
                                    aria-label={`Remove ${s}`}
                                    className="rounded-full p-0.5 hover:bg-primary/30 text-primary"
                                    onClick={() => removeSkill(i)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-tertiary py-0.5"
                            placeholder={skillsList.length === 0 ? 'e.g. Python, NLP, Data Analysis (Enter or comma to add)' : 'Add skill…'}
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    addSkill(skillInput);
                                } else if (e.key === 'Backspace' && !skillInput && skillsList.length > 0) {
                                    removeSkill(skillsList.length - 1);
                                }
                            }}
                            onBlur={() => {
                                if (skillInput.trim()) addSkill(skillInput);
                            }}
                        />
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                        Press Enter or comma to add a tag; click × to remove.
                    </p>
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handleBack}>
                    ← Back
                </Button>
                <Button type="button" onClick={handleNext}>
                    Review →
                </Button>
            </div>
        </>
    );

    const deliverableTypeLabel =
        DELIVERABLE_TYPE_OPTIONS.find((o) => o.value === form.deliverable_type)?.label ??
        form.deliverable_type;

    const renderStep3 = () => (
        <>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                ✅ Review & Submit
            </h3>
            <div className="space-y-4 mb-4">
                <div className="bg-background-tertiary rounded-xl p-4">
                    <h4 className="text-primary text-sm font-semibold mb-2">COMPANY</h4>
                    <p className="text-sm text-text-secondary">
                        <strong>{form.company_name}</strong> · {form.industry ?? '—'} ·{' '}
                        {form.company_size ? `${form.company_size} employees` : '—'} ·{' '}
                        {form.department} Dept
                    </p>
                </div>
                <div className="bg-background-tertiary rounded-xl p-4">
                    <h4 className="text-primary text-sm font-semibold mb-2">PROBLEM</h4>
                    <p className="text-sm text-text-secondary mb-1">
                        <strong>Scenario:</strong> {form.scenario}
                    </p>
                    <p className="text-sm text-text-secondary mb-1">
                        <strong>Problem:</strong> {form.problem}
                    </p>
                    {form.existing_solution && (
                        <p className="text-sm text-text-secondary mb-1">
                            <strong>Tried:</strong> {form.existing_solution}
                        </p>
                    )}
                    {form.public_data && (
                        <p className="text-sm text-text-secondary">
                            <strong>Public data:</strong> {form.public_data}
                        </p>
                    )}
                </div>
                <div className="bg-background-tertiary rounded-xl p-4">
                    <h4 className="text-primary text-sm font-semibold mb-2">DELIVERABLE</h4>
                    <p className="text-sm text-text-secondary">
                        <strong>Type:</strong> {deliverableTypeLabel} ·{' '}
                        <strong>Difficulty:</strong> {form.difficulty} ·{' '}
                        <strong>Hours:</strong> ~{form.estimated_hours}h
                    </p>
                    {form.deliverable && (
                        <p className="text-sm text-text-secondary mt-1">{form.deliverable}</p>
                    )}
                    {form.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {form.skills.map((s) => (
                                <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <p className="text-sm text-primary">
                        🤖 After submission, our AI will automatically structure this into a full
                        project brief with background, goals, steps, and evaluation criteria for
                        students.
                    </p>
                </div>
            </div>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                    ← Edit
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {mode === 'create' ? '✅ Submit Case' : 'Save Changes'}
                </Button>
            </div>
        </>
    );

    return (
        <Card className="mb-8 p-6 bg-background-secondary border-border">
            <h2 className="text-xl font-bold text-text-primary mb-2">
                {mode === 'create' ? 'Create New Case' : 'Edit Case'}
            </h2>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
                {STEP_TITLES.map((title, i) => (
                    <React.Fragment key={title}>
                        <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                                i === step
                                    ? 'bg-primary text-white'
                                    : i < step
                                      ? 'bg-primary/20 text-primary'
                                      : 'bg-background-tertiary text-text-tertiary'
                            }`}
                        >
                            {i + 1}
                        </span>
                        {i < 3 && (
                            <span
                                className={`flex-1 h-px max-w-6 ${
                                    i < step ? 'bg-primary/30' : 'bg-border'
                                }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </form>
            <div className="mt-4 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Card>
    );
};
