'use client';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { Opportunity } from '@/types/opportunity';
import { Eye, Loader2, Pencil, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

interface OpportunityListProps {
    items: Opportunity[];
    onEdit: (item: Opportunity) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
    onSelect?: (item: Opportunity) => void;
}

const getStatusColor = (status: string): 'green' | 'red' | 'yellow' => {
    switch (status) {
        case 'active':
            return 'green';
        case 'closed':
            return 'red';
        case 'draft':
            return 'yellow';
        default:
            return 'yellow';
    }
};

const getTypeIcon = (type: string) => {
    return type === 'internship' ? '💼' : '🎓';
};

export const OpportunityList: React.FC<OpportunityListProps> = ({
    items,
    onEdit,
    onDelete,
    isLoading,
    onSelect,
}) => {
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!items.length) {
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
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Deadline</th>
                            <th className="px-4 py-3">Applicants</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((opp) => (
                            <tr
                                key={opp.id}
                                className="border-t border-border/60 hover:bg-background-primary/60 transition-colors"
                            >
                                <td className="px-4 py-3 align-top">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-text-primary line-clamp-2">
                                            {opp.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <span className="flex items-center gap-1 text-sm">
                                        <span className="capitalize text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full">
                                            {opp.type}
                                        </span>
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <Badge variant={getStatusColor(opp.status) as any}>
                                        {opp.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 align-top text-xs text-text-secondary">
                                    {opp.location || '—'}
                                </td>
                                <td className="px-4 py-3 align-top text-xs text-text-secondary">
                                    {opp.duration || '—'}
                                </td>
                                <td className="px-4 py-3 align-top text-xs text-text-secondary">
                                    {opp.deadline
                                        ? new Date(opp.deadline).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                                        <Users className="w-3 h-3" />
                                        {opp.applicants_count}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-secondary hover:bg-background-tertiary"
                                            onClick={() => onSelect?.(opp)}
                                            title="View"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </button>
                                        <button
                                            className="p-1.5 hover:bg-background-tertiary rounded-lg transition-colors"
                                            onClick={() => onEdit(opp)}
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                                        </button>
                                        <button
                                            className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                                            onClick={() => setPendingDeleteId(opp.id)}
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
                title="Delete opportunity?"
                description={
                    'This will permanently remove the opportunity from your dashboard.\nThis action cannot be undone.'
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

