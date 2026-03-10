'use client';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { Opportunity } from '@/types/opportunity';
import { Loader2, Pencil, Trash2, Users } from 'lucide-react';
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((opp) => (
                    <Card
                        key={opp.id}
                        variant="hoverable"
                        className="p-5 cursor-pointer"
                        onClick={() => onSelect?.(opp)}
                    >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{getTypeIcon(opp.type)}</span>
                                <Badge variant={getStatusColor(opp.status) as any}>{opp.status}</Badge>
                                <span className="text-xs text-text-tertiary">
                                    {new Date(opp.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-text-primary mb-2">{opp.title}</h3>
                            <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                                {opp.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {opp.location && (
                                    <span className="px-3 py-1 bg-background-tertiary rounded-full text-xs text-text-secondary">
                                        📍 {opp.location}
                                    </span>
                                )}
                                {opp.duration && (
                                    <span className="px-3 py-1 bg-background-tertiary rounded-full text-xs text-text-secondary">
                                        ⏱️ {opp.duration}
                                    </span>
                                )}
                                {opp.stipend && (
                                    <span className="px-3 py-1 bg-success-bg rounded-full text-xs text-success">
                                        💰 {opp.stipend}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-text-tertiary">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {opp.applicants_count} applicants
                                </span>
                                {opp.deadline && (
                                    <span>⏰ Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                            <div className="flex gap-2 ml-4">
                                <button
                                    className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(opp);
                                    }}
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4 text-text-secondary" />
                                </button>
                                <button
                                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingDeleteId(opp.id);
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4 text-danger" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
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

