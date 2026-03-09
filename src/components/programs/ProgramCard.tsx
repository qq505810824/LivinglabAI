'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate, truncate } from '@/lib/utils';
import type { Program } from '@/types/program';
import Link from 'next/link';
import React from 'react';

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const orgTypeColors: Record<string, 'blue' | 'purple' | 'green'> = {
    university: 'blue',
    company: 'purple',
    institution: 'green',
  };

  const orgTypeIcons = {
    university: '🎓',
    company: '🏢',
    institution: '🏛️',
  };

  return (
    <Link href={`/programs/${program.id}`}>
      <Card variant="hoverable" className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: program.logo_color || '#818cf8' }}
            >
              {program.organization.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">{program.organization}</p>
              <p className="text-xs text-text-tertiary">
                {orgTypeIcons[program.org_type]} {program.org_type}
              </p>
            </div>
          </div>
          <Badge variant={orgTypeColors[program.org_type] as any}>
            {program.status}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
          {program.title}
        </h3>

        {/* Duration & Location */}
        <div className="flex items-center gap-2 mb-3 text-xs text-text-tertiary">
          <span>⏱️ {program.duration}</span>
          <span>•</span>
          <span>📍 {program.location || 'Remote'}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow">
          {truncate(program.description, 120)}
        </p>

        {/* Highlights */}
        {program.highlights.length > 0 && (
          <ul className="space-y-1 mb-4">
            {program.highlights.slice(0, 2).map((highlight, index) => (
              <li key={index} className="text-xs text-text-secondary flex items-start gap-1.5">
                <span className="text-success mt-0.5">✓</span>
                <span>{truncate(highlight, 60)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
          <div>
            <span className="block">Deadline:</span>
            <span className="font-medium text-danger">{formatDate(program.deadline)}</span>
          </div>
          <div className="text-right">
            <span className="block">Applicants:</span>
            <span className="font-medium">{program.applicants_count}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
