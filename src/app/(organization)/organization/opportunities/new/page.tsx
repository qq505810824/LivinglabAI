'use client';

import { OpportunityForm } from '@/components/org/opportunities/OpportunityForm';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OrgOpportunityCreatePage() {
  const { createOpportunity } = useOpportunities();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create Opportunity</h1>
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
        <p className="text-text-secondary">Please sign in as an organization to create opportunities.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <OpportunityForm
        mode="create"
        isSubmitting={isSubmitting}
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            await createOpportunity(values, user.id);
            router.push('/dashboard/opportunities');
          } finally {
            setIsSubmitting(false);
          }
        }}
        onCancel={() => router.push('/dashboard/opportunities')}
      />
    </div>
  );
}

