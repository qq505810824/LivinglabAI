'use client';

import { Card } from '@/components/ui/Card';
import type { Case } from '@/types/case';

interface CaseSummaryCardProps {
  item: Case;
}

export function CaseSummaryCard({ item }: CaseSummaryCardProps) {
  return (
    <Card className="bg-background-secondary/80 border-border">
      <div className="px-4 py-4 md:px-6 md:py-5 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <div className="flex items-start gap-3 min-w-0">
          {item.organization_logo ? (
            <img
              src={item.organization_logo}
              alt={item.organization_name || ''}
              className="w-10 h-10 rounded-lg object-cover bg-background-tertiary shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
              {(item.organization_name || 'Organization').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              {item.organization_name || 'Organization'}
            </div>
            <div className="text-sm md:text-base font-semibold text-text-primary line-clamp-1">
              {item.title}
            </div>
            {item.department && (
              <div className="text-xs text-text-tertiary">
                {item.department} Department
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
          <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
            <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
              Difficulty
            </div>
            <div className="text-text-primary capitalize">{item.difficulty}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
            <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
              Est. Hours
            </div>
            <div className="text-text-primary whitespace-nowrap">
              {item.estimated_hours} hours
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
            <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
              Category
            </div>
            <div className="text-text-primary capitalize">{item.category}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background-primary/80 px-3 py-2.5 flex flex-col gap-1">
            <div className="text-[10px] font-medium tracking-wide text-text-tertiary uppercase">
              Students
            </div>
            <div className="text-text-primary">
              {item.submissions_count ?? 0} working
            </div>
          </div>
        </div>
      </div>

      {(item.scenario || item.problem) && (
        <div className="px-4 pb-4 md:px-6 md:pb-5 border-t border-border/60 grid gap-3 md:grid-cols-2 text-xs md:text-sm">
          {item.scenario && (
            <div className="space-y-1">
              <div className="font-semibold text-text-primary">📋 Scenario</div>
              <p className="text-text-secondary line-clamp-3">{item.scenario}</p>
            </div>
          )}
          {item.problem && (
            <div className="space-y-1">
              <div className="font-semibold text-text-primary">❓ Problem</div>
              <p className="text-text-secondary line-clamp-3">{item.problem}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

