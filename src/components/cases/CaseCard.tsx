'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate, truncate } from '@/lib/utils';
import type { Case } from '@/types/case';
import Link from 'next/link';
import React from 'react';

interface CaseCardProps {
  caseItem: Case;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem }) => {
  const categoryColors: Record<string, 'purple' | 'blue' | 'yellow' | 'pink' | 'green'> = {
    solved: 'purple',
    open: 'blue',
    process: 'yellow',
    policy: 'pink',
    content: 'green',
  };

  const difficultyColors = {
    beginner: 'green',
    intermediate: 'yellow',
    advanced: 'red',
  };

  const difficultyIcons = {
    beginner: '🟢',
    intermediate: '🟡',
    advanced: '🔴',
  };

  return (
    <Link href={`/cases/${caseItem.id}`}>
      <Card variant="hoverable" className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {caseItem.organization_logo && (
              <img
                src={caseItem.organization_logo}
                alt={caseItem.organization_name || ''}
                className="w-8 h-8 rounded-lg object-cover bg-background-tertiary"
              />
            )}
            <span className="text-sm font-medium text-text-secondary">
              {caseItem.organization_name || 'Organization'}
            </span>
          </div>
          <Badge variant={categoryColors[caseItem.category] as any}>
            {caseItem.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
          {caseItem.title}
        </h3>

        {/* Department & Difficulty */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-text-tertiary">{caseItem.department}</span>
          <span className="text-xs text-text-tertiary">•</span>
          <span className="text-xs text-text-tertiary">
            {difficultyIcons[caseItem.difficulty]} {caseItem.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow">
          {truncate(caseItem.scenario, 150)}
        </p>

        {/* Skills */}
        {caseItem.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {caseItem.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-background-tertiary rounded text-xs text-text-secondary"
              >
                {skill}
              </span>
            ))}
            {caseItem.skills.length > 3 && (
              <span className="px-2 py-1 text-xs text-text-tertiary">
                +{caseItem.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
          <span>{formatDate(caseItem.created_at)}</span>
          <div className="flex items-center gap-3">
            <span>👁️ {caseItem.views_count}</span>
            <span>💾 {caseItem.saves_count}</span>
            <span>📝 {caseItem.submissions_count}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
