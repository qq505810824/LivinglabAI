'use client';

import { Card } from '@/components/ui/Card';
import type { Opportunity } from '@/types/opportunity';
import React from 'react';

interface InternshipCardProps {
  opportunity: Opportunity;
  applied: boolean;
  onClick: () => void;
}

const companyColorPalette = [
  'bg-[#4F46E5]',
  'bg-[#059669]',
  'bg-[#EF4444]',
  'bg-[#EC4899]',
  'bg-[#F97316]',
  'bg-[#0EA5E9]',
];

function getCompanyColor(name?: string) {
  if (!name) return companyColorPalette[0];
  const code = name.charCodeAt(0) || 0;
  return companyColorPalette[code % companyColorPalette.length];
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  opportunity,
  applied,
  onClick,
}) => {
  const companyName = opportunity.organization_name || 'Organization';
  const firstLetter = companyName.charAt(0).toUpperCase();
  const colorClass = getCompanyColor(companyName);

  return (
    <Card
      variant="hoverable"
      className="cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      {/* Company badge */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white ${colorClass}`}
        >
          {firstLetter}
        </div>
        <span className="text-sm text-text-secondary">{companyName}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-text-primary mb-2">
        {opportunity.title}
      </h3>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        {opportunity.location && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-light/20 text-primary border border-primary/20">
            📍 {opportunity.location}
          </span>
        )}
        {opportunity.duration && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
            ⏱ {opportunity.duration}
          </span>
        )}
        {opportunity.stipend && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            💰 {opportunity.stipend}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-1">
        {opportunity.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-tertiary pt-3 border-t border-border">
        <span>
          📅 Deadline:{' '}
          {opportunity.deadline
            ? new Date(opportunity.deadline).toLocaleDateString()
            : 'N/A'}
        </span>
        <span className={applied ? 'text-success' : ''}>
          {applied ? '✅ Applied' : '→ View & Apply'}
        </span>
      </div>
    </Card>
  );
};

