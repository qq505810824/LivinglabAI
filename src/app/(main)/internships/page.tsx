'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { InternshipCard } from '@/components/internships/InternshipCard';
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
    setAppliedIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">💼 Internship Opportunities</h1>
        <p className="text-text-secondary mb-8">
          Intern positions from companies looking for AI-skilled talent.
        </p>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          💼 Internship Opportunities
        </h1>
        <p className="text-text-secondary">
          Intern positions from companies looking for AI-skilled talent.
        </p>
      </div>

      {/* Grid */}
      {internships.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No internships available
          </h3>
          <p className="text-text-secondary">
            Check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((opp) => (
            <InternshipCard
              key={opp.id}
              opportunity={opp}
              applied={appliedIds.includes(opp.id)}
              onClick={() => setSelected(opp)}
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
                <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center text-sm font-semibold text-text-primary">
                  {(selected.organization_name || 'Org').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-text-primary">
                    {selected.organization_name || 'Organization'}
                  </div>
                  {selected.location && (
                    <div className="text-xs text-text-tertiary">
                      {selected.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {selected.duration && (
                  <div>
                    <div className="text-xs text-text-tertiary">Duration</div>
                    <div className="text-text-primary">
                      {selected.duration}
                    </div>
                  </div>
                )}
                {selected.stipend && (
                  <div>
                    <div className="text-xs text-text-tertiary">Stipend</div>
                    <div className="text-text-primary">
                      {selected.stipend}
                    </div>
                  </div>
                )}
                {selected.location && (
                  <div>
                    <div className="text-xs text-text-tertiary">Location</div>
                    <div className="text-text-primary">
                      {selected.location}
                    </div>
                  </div>
                )}
                {selected.deadline && (
                  <div>
                    <div className="text-xs text-text-tertiary">Deadline</div>
                    <div className="text-text-primary">
                      {new Date(selected.deadline).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* About */}
              <div className="mb-4">
                <h4 className="font-semibold text-text-primary mb-1">
                  About the Role
                </h4>
                <p className="text-sm text-text-secondary">
                  {selected.description}
                </p>
              </div>

              {/* Requirements */}
              {selected.requirements?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-text-primary mb-1">
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                    {selected.requirements.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perks */}
              {selected.perks?.length > 0 && (
                <div className="mb-2">
                  <h4 className="font-semibold text-text-primary mb-1">
                    Perks
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                    {selected.perks.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
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
              {selected && appliedIds.includes(selected.id) ? (
                <button
                  className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium cursor-default"
                  disabled
                >
                  ✅ Applied
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                  onClick={() => {
                    if (selected) {
                      handleApply(selected.id);
                    }
                  }}
                >
                  📝 Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
