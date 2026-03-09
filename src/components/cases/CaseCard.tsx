'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { truncate } from '@/lib/utils';
import type { Case } from '@/types/case';
import React from 'react';

interface CaseCardProps {
    caseItem: Case;
    onClick?: () => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onClick }) => {
    const categoryColors: Record<string, 'purple' | 'blue' | 'yellow' | 'pink' | 'green'> = {
        solved: 'purple',
        open: 'blue',
        process: 'yellow',
        policy: 'pink',
        content: 'green',
    };

    const difficultyIcons = {
        beginner: '🟢',
        intermediate: '🟡',
        advanced: '🔴',
    };

    return (
        <Card
            variant="hoverable"
            className="h-full flex flex-col cursor-pointer"
            onClick={onClick}
        >
            {/* Company badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {caseItem.organization_logo ? (
                        <img
                            src={caseItem.organization_logo}
                            alt={caseItem.organization_name || ''}
                            className="w-8 h-8 rounded-lg object-cover bg-background-tertiary"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                            {(caseItem.organization_name || 'Org').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm font-medium text-text-secondary">
                        {caseItem.organization_name || 'Organization'} · {caseItem.department}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                {caseItem.title}
            </h3>

            {/* Meta badges: category, difficulty, hours */}
            <div className="flex items-center flex-wrap gap-2 mb-3 text-xs">
                <Badge variant={categoryColors[caseItem.category] as any} className="capitalize">
                    {caseItem.category}
                </Badge>
                <Badge
                    variant="yellow"
                    className="flex items-center gap-1 capitalize"
                >
                    {difficultyIcons[caseItem.difficulty]} {caseItem.difficulty}
                </Badge>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[11px]">
                    ~{caseItem.estimated_hours}h
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-text-secondary mb-4 line-clamp-2 grow">
                {truncate(caseItem.scenario, 150)}
            </p>

            {/* Skills */}
            {caseItem.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {caseItem.skills.slice(0, 4).map((skill, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-background-tertiary rounded-full text-xs text-text-secondary"
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
                <span>👥 {caseItem.submissions_count} students working</span>
                <span className="text-primary font-medium">→ View Details</span>
            </div>
        </Card>
    );
};
