'use client';

import { CaseCard } from '@/components/cases/CaseCard';
import { CardLoader } from '@/components/common/CardLoader';
import { useCases } from '@/hooks/useCases';

export default function CasesPage() {
  const { cases, isLoading, error } = useCases();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">🔍 Problem Bank</h1>
        <p className="text-text-secondary mb-8">
          Explore real-world challenges posted by organizations.
        </p>
        <CardLoader count={9} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
          Failed to load cases. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">🔍 Problem Bank</h1>
        <p className="text-text-secondary">
          Explore real-world challenges and apply your AI skills to solve them.
        </p>
      </div>

      {/* Filters (Placeholder) */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Categories</option>
          <option>Solved</option>
          <option>Open</option>
          <option>Process Optimization</option>
          <option>Policy</option>
          <option>Content Creation</option>
        </select>
        <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Difficulties</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
          <option>Sort by: Newest</option>
          <option>Most Popular</option>
          <option>Most Submissions</option>
        </select>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Cases Available</h3>
          <p className="text-text-secondary">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} />
          ))}
        </div>
      )}
    </div>
  );
}
