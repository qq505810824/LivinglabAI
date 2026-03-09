'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { Case } from '@/types/case';
import { FileText, Pencil, Trash2, Users } from 'lucide-react';
import React from 'react';

interface CaseListProps {
    items: Case[];
    onEdit: (item: Case) => void;
    onDelete: (id: string) => void;
}

const getCategoryColor = (category: string): 'purple' | 'blue' | 'yellow' | 'pink' | 'green' => {
    switch (category) {
        case 'solved':
            return 'purple';
        case 'open':
            return 'blue';
        case 'process':
            return 'yellow';
        case 'policy':
            return 'pink';
        case 'content':
            return 'green';
        default:
            return 'purple';
    }
};

const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return '🟢';
        case 'intermediate':
            return '🟡';
        case 'advanced':
            return '🔴';
        default:
            return '⚪';
    }
};

export const CaseList: React.FC<CaseListProps> = ({ items, onEdit, onDelete }) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {items.map((caseItem) => (
                <Card key={caseItem.id} variant="hoverable" className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant={getCategoryColor(caseItem.category)}>
                                    {caseItem.category}
                                </Badge>
                                <span className="text-xs text-text-tertiary">
                                    {getDifficultyIcon(caseItem.difficulty)} {caseItem.difficulty}
                                </span>
                                <span className="text-xs text-text-tertiary">•</span>
                                <span className="text-xs text-text-tertiary">
                                    {new Date(caseItem.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-text-primary mb-2">
                                {caseItem.title}
                            </h3>
                            <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                                {caseItem.scenario}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {caseItem.skills.slice(0, 4).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-background-tertiary rounded text-xs text-text-secondary"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-text-tertiary">
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {caseItem.submissions_count} submissions
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    👁️ {caseItem.views_count}
                                </span>
                                <span>⏱️ {caseItem.estimated_hours}h estimated</span>
                            </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                            <button
                                className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                                onClick={() => onEdit(caseItem)}
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4 text-text-secondary" />
                            </button>
                            <button
                                className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                                onClick={() => onDelete(caseItem.id)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-danger" />
                            </button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

