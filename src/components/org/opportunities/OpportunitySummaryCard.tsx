'use client';

import { Card } from '@/components/ui/Card';
import type { Opportunity } from '@/types/opportunity';

interface OpportunitySummaryCardProps {
  item: Opportunity;
}

export function OpportunitySummaryCard({ item }: OpportunitySummaryCardProps) {
  const isInternship = item.type === 'internship';

  return (
    <Card className="bg-background-secondary/80 border-border">
      <div className="px-4 py-4 md:px-6 md:py-5 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center text-sm font-semibold text-text-primary shrink-0">
            {(item.organization_name || 'Org').charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              {item.organization_name || 'Organization'}
            </div>
            <div className="text-sm md:text-base font-semibold text-text-primary line-clamp-1">
              {item.title}
            </div>
            {item.location && (
              <div className="text-xs text-text-tertiary">
                {item.location}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
          {item.duration && (
            <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
              <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
                Duration
              </div>
              <div className="text-text-primary">{item.duration}</div>
            </div>
          )}
          {item.stipend && (
            <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
              <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
                Stipend / Cost
              </div>
              <div className="text-text-primary">{item.stipend}</div>
            </div>
          )}
          {item.deadline && (
            <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
              <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
                Application Deadline
              </div>
              <div className="text-text-primary">
                {new Date(item.deadline).toLocaleDateString()}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
            <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
              {isInternship ? 'Applications' : 'Applications'}
            </div>
            <div className="text-text-primary">
              {item.applicants_count ?? 0} total
            </div>
          </div>
        </div>
      </div>

      {item.description && (
        <div className="px-4 pb-4 md:px-6 md:pb-5 border-t border-border/60">
          <div className="font-semibold text-text-primary mb-1 text-sm">
            {isInternship ? 'About the Role' : 'About'}
          </div>
          <p className="text-xs md:text-sm text-text-secondary line-clamp-3">
            {item.description}
          </p>
        </div>
      )}
    </Card>
  );
}

