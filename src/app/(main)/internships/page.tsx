'use client';

import { InternshipDetailModal } from '@/components/internships/InternshipDetailModal';
import { InternshipsGrid } from '@/components/internships/InternshipsGrid';
import { InternshipsHeader } from '@/components/internships/InternshipsHeader';
import { CardLoader } from '@/components/common/CardLoader';
import { useOpportunities } from '@/hooks/useOpportunities';
import type { Opportunity } from '@/types/opportunity';
import { useState } from 'react';

export default function InternshipsPage() {
  const { opportunities, isLoading, error } = useOpportunities();
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const internships = opportunities.filter(
    (opp) => opp.type === 'internship' && opp.status === 'active',
  );

  const handleApply = (id: string) => {
    setAppliedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <InternshipsHeader />
        <CardLoader count={9} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
          Failed to load internships. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <InternshipsHeader />
      <InternshipsGrid
        internships={internships}
        appliedIds={appliedIds}
        onSelect={setSelected}
      />
      <InternshipDetailModal
        selected={selected}
        applied={selected ? appliedIds.includes(selected.id) : false}
        onApply={handleApply}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
