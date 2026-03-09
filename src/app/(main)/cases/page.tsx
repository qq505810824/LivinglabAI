'use client';

import { CaseCard } from '@/components/cases/CaseCard';
import { CardLoader } from '@/components/common/CardLoader';
import { useCases } from '@/hooks/useCases';
import type { Case } from '@/types/case';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';

export default function CasesPage() {
  const { cases, isLoading, error } = useCases();
  const [selected, setSelected] = useState<Case | null>(null);

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
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onClick={() => setSelected(caseItem)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-2xl w-full bg-background-primary rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-text-primary">
                {selected.title}
              </h2>
              <button
                className="text-text-tertiary hover:text-text-secondary text-lg"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Company badge */}
              <div className="flex items-center gap-3 mb-4">
                {selected.organization_logo ? (
                  <img
                    src={selected.organization_logo}
                    alt={selected.organization_name || ''}
                    className="w-10 h-10 rounded-lg object-cover bg-background-tertiary"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {(selected.organization_name || 'Org').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-text-primary">
                    {selected.organization_name || 'Organization'}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {selected.department} Department
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-xs text-text-tertiary">Difficulty</div>
                  <div className="text-text-primary">
                    <Badge
                      variant={
                        selected.difficulty === 'beginner'
                          ? 'green'
                          : selected.difficulty === 'intermediate'
                          ? 'yellow'
                          : 'red'
                      }
                      className="capitalize"
                    >
                      {selected.difficulty}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary">Est. Hours</div>
                  <div className="text-text-primary">
                    {selected.estimated_hours} hours
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary">Category</div>
                  <div className="text-text-primary capitalize">
                    {selected.category}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary">Students</div>
                  <div className="text-text-primary">
                    {selected.submissions_count} working
                  </div>
                </div>
              </div>

              {/* Scenario */}
              <div className="mb-4">
                <h4 className="font-semibold text-text-primary mb-1">
                  📋 Scenario
                </h4>
                <p className="text-sm text-text-secondary">
                  {selected.scenario}
                </p>
              </div>

              {/* Problem */}
              <div className="mb-4">
                <h4 className="font-semibold text-text-primary mb-1">
                  ❓ Problem
                </h4>
                <p className="text-sm text-text-secondary">
                  {selected.problem}
                </p>
              </div>

              {/* Existing solution */}
              {selected.existing_solution && (
                <div className="mb-4">
                  <h4 className="font-semibold text-text-primary mb-1">
                    🔧 Existing Solution
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {selected.existing_solution}
                  </p>
                </div>
              )}

              {/* Deliverable */}
              <div className="mb-4">
                <h4 className="font-semibold text-text-primary mb-1">
                  📦 Expected Deliverable
                </h4>
                <p className="text-sm text-text-secondary">
                  {selected.deliverable}
                </p>
              </div>

              {/* Public data */}
              {selected.public_data && (
                <div className="mb-4">
                  <h4 className="font-semibold text-text-primary mb-1">
                    📂 Available Public Data
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {selected.public_data}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selected.skills?.length > 0 && (
                <div className="mb-2">
                  <h4 className="font-semibold text-text-primary mb-1">
                    🛠 Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <button
                className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-background-tertiary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                onClick={() => {
                  // TODO: wire to actual "start project" flow
                  setSelected(null);
                }}
              >
                🚀 Start Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
