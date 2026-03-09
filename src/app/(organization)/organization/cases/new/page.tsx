'use client';

import { CaseForm } from '@/components/org/cases/CaseForm';
import { useCases } from '@/hooks/useCases';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OrgCaseCreatePage() {
  const { createCase } = useCases();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create Case</h1>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Sign in required</h1>
        <p className="text-text-secondary">Please sign in as an organization to create cases.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <CaseForm
        mode="create"
        isSubmitting={isSubmitting}
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            await createCase(values, user.id);
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

