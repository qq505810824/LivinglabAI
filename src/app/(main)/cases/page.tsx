'use client';

import { CaseDetailModal } from '@/components/cases/CaseDetailModal';
import { CasesFilters } from '@/components/cases/CasesFilters';
import { CasesGrid } from '@/components/cases/CasesGrid';
import { CasesHeader } from '@/components/cases/CasesHeader';
import { CardLoader } from '@/components/common/CardLoader';
import { useCaseFilters } from '@/hooks/useCaseFilters';
import { useCases } from '@/hooks/useCases';
import type { Case } from '@/types/case';
import { useState } from 'react';

export default function CasesPage() {
    const { cases, isLoading, error } = useCases();
    const [selected, setSelected] = useState<Case | null>(null);
    const {
        search,
        category,
        difficulty,
        sortBy,
        setSearch,
        setCategory,
        setDifficulty,
        setSortBy,
        resetFilters,
        hasActiveFilters,
        filteredCases,
    } = useCaseFilters(cases);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <CardLoader count={9} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
                    Failed to load cases. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <CasesHeader />
            <CasesFilters
                search={search}
                category={category}
                difficulty={difficulty}
                sortBy={sortBy}
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
                onDifficultyChange={setDifficulty}
                onSortByChange={setSortBy}
            />
            <CasesGrid
                cases={filteredCases}
                onSelect={setSelected}
                isFiltered={hasActiveFilters && cases.length > 0}
                onResetFilters={resetFilters}
            />
            <CaseDetailModal selected={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

