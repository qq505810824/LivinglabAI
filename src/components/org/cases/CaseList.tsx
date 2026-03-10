'use client';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { Case } from '@/types/case';
import { Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface CaseListProps {
    items: Case[];
    onEdit: (item: Case) => void;
    onDelete: (id: string) => void;
    onSelect?: (item: Case) => void;
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

export const CaseList: React.FC<CaseListProps> = ({ items, onEdit, onDelete, onSelect }) => {
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (items.length === 0) {
        return null;
    }

    const handleConfirmDelete = () => {
        if (pendingDeleteId) {
            onDelete(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-border bg-background-secondary">
                <table className="min-w-full text-sm">
                    <thead className="bg-background-tertiary/60">
                        <tr className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Difficulty</th>
                            <th className="px-4 py-3">Est. Hours</th>
                            <th className="px-4 py-3">Submissions</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((caseItem) => (
                            <tr
                                key={caseItem.id}
                                className="border-t border-border/60 hover:bg-background-primary/60 transition-colors"
                            >
                                <td className="px-4 py-3 align-top">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-text-primary line-clamp-2">
                                            {caseItem.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <Badge variant={getCategoryColor(caseItem.category)}>
                                        {caseItem.category}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <span className="text-xs text-text-tertiary flex items-center gap-1 capitalize">
                                        {getDifficultyIcon(caseItem.difficulty)} {caseItem.difficulty}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-top text-text-primary">
                                    {caseItem.estimated_hours}h
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                                        <FileText className="w-3 h-3" />
                                        {caseItem.submissions_count}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-top text-xs text-text-tertiary">
                                    {new Date(caseItem.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-secondary hover:bg-background-tertiary"
                                            onClick={() => onSelect?.(caseItem)}
                                            title="View"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </button>
                                        <button
                                            className="p-1.5 hover:bg-background-tertiary rounded-lg transition-colors"
                                            onClick={() => onEdit(caseItem)}
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                                        </button>
                                        <button
                                            className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                                            onClick={() => setPendingDeleteId(caseItem.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-danger" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog
                open={pendingDeleteId !== null}
                title="Delete case?"
                description={
                    'This will permanently remove the case and its data from your dashboard.\nThis action cannot be undone.'
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </>
    );
};

