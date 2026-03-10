'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { ProgramsFilters } from '@/components/programs/ProgramsFilters';
import { ProgramsGrid } from '@/components/programs/ProgramsGrid';
import { ProgramsHeader } from '@/components/programs/ProgramsHeader';
import { usePrograms } from '@/hooks/usePrograms';

export default function ProgramsPage() {
  const { programs, isLoading, error } = usePrograms();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgramsHeader />
        <CardLoader count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
          Failed to load programs. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ProgramsHeader />
      <ProgramsFilters />
      <ProgramsGrid programs={programs} />
    </div>
  );
}
