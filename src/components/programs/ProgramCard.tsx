'use client';

import { Card } from '@/components/ui/Card';
import { truncate } from '@/lib/utils';
import { Opportunity } from '@/types/opportunity';
import React from 'react';

interface ProgramCardProps {
    program: Opportunity;
    onSelect: (program: Opportunity) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect }) => {


    return (
        <Card variant="hoverable" className="h-full flex flex-col" onClick={() => onSelect(program)}>
            {/* Title */}
            <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                {program.title}
            </h3>
            <h3 className="text-sm text-primary mb-2 line-clamp-2">
                {program.organization_name}
            </h3>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs">
                {program.location && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-light/20 text-primary border border-primary/20">
                        📍 {program.location}
                    </span>
                )}
                {program.duration && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        ⏱ {program.duration}
                    </span>
                )}
                {program.stipend && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        💰 {program.stipend}
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow">
                {truncate(program.description, 120)}
            </p>

            {/* Highlights */}
            {program.perks.length > 0 && (
                <ul className="space-y-1 mb-4">
                    {program.perks.slice(0, 2).map((perk, index) => (
                        <li key={index} className="text-xs text-text-secondary flex items-start gap-1.5">
                            <span className="text-success mt-0.5">✓</span>
                            <span>{truncate(perk, 60)}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
                <span>
                    📅 Deadline:{' '}
                    {program.deadline
                        ? new Date(program.deadline).toLocaleDateString()
                        : 'N/A'}
                </span>
                <span className={''}>
                    {'→ View & Apply'}
                </span>
            </div>
        </Card>
    );
};
