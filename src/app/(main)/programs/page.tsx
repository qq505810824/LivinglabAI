'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { usePrograms } from '@/hooks/usePrograms';

export default function ProgramsPage() {
  const { programs, isLoading, error } = usePrograms();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">🎓 Summer Programs</h1>
        <p className="text-text-secondary mb-8">
          University and industry programs to level up your AI skills.
        </p>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">🎓 Summer Programs</h1>
        <p className="text-text-secondary">
          Discover summer opportunities from top universities and companies.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Types</option>
          <option>University</option>
          <option>Company</option>
          <option>Institution</option>
        </select>
        <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Locations</option>
          <option>Remote</option>
          <option>On-site</option>
          <option>Hybrid</option>
        </select>
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Programs Available</h3>
          <p className="text-text-secondary">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
