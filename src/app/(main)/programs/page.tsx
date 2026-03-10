'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { ProgramDetailModal } from '@/components/programs/ProgramDetailModal';
import { ProgramsFilters } from '@/components/programs/ProgramsFilters';
import { ProgramsGrid } from '@/components/programs/ProgramsGrid';
import { ProgramsHeader } from '@/components/programs/ProgramsHeader';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Opportunity } from '@/types/opportunity';
import { useState } from 'react';

export default function ProgramsPage() {
    const { opportunities, isLoading, error } = useOpportunities();
    const [selected, setSelected] = useState<Opportunity | null>(null);

    const programs = opportunities.filter(
        (opp) => opp.type === 'program' && opp.status === 'active',
    );

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <ProgramsHeader />
                <CardLoader count={6} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
                    Failed to load programs. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <ProgramsHeader />
            <ProgramsFilters />
            <ProgramsGrid programs={programs} onSelect={setSelected} />
            <ProgramDetailModal
                selected={selected}
                applied={false}
                onApply={() => { }}
                onClose={() => setSelected(null)}
            />
        </div>
    );
}
