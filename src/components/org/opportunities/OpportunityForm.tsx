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
  const fromText = (value: string) =>
    value
      .split(',')
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
            label="Title"
            placeholder="Software Engineering Intern"
            required
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Type
            </label>
            <select
              className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm"
              required
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value as OpportunityType)}
            >
              <option value="internship">Internship</option>
              <option value="program">Program</option>
            </select>
          </div>
        </div>

        <textarea
          className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[100px]"
          placeholder="Description"
          required
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Location"
            placeholder="San Francisco, CA"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          <Input
            label="Duration"
            placeholder="3 months"
            value={form.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
          />
          <Input
            label="Stipend"
            placeholder="$5000/month"
            value={form.stipend}
            onChange={(e) => handleChange('stipend', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Deadline (YYYY-MM-DD)"
            placeholder="2026-06-30"
            value={form.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Status
            </label>
            <select
              className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm"
              required
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as any)}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <Input
          label="Requirements (comma separated)"
          placeholder="Python, Teamwork"
          value={toText(form.requirements)}
          onChange={(e) => handleChange('requirements', fromText(e.target.value))}
        />

        <Input
          label="Perks (comma separated)"
          placeholder="Housing, Visa sponsorship"
          value={toText(form.perks)}
          onChange={(e) => handleChange('perks', fromText(e.target.value))}
        />

        <Input
          label="Required Skills (comma separated)"
          placeholder="React, TypeScript"
          value={toText(form.skills_required)}
          onChange={(e) => handleChange('skills_required', fromText(e.target.value))}
        />

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

