import type { Case, CaseCategory, DifficultyLevel } from '@/types/case';
import { useCallback, useMemo, useState } from 'react';

export type CaseCategoryFilter = 'all' | CaseCategory;
export type CaseDifficultyFilter = 'all' | DifficultyLevel;
export type CaseSortOption = 'newest' | 'popular' | 'submissions';

interface UseCaseFiltersResult {
    search: string;
    category: CaseCategoryFilter;
    difficulty: CaseDifficultyFilter;
    sortBy: CaseSortOption;
    setSearch: (value: string) => void;
    setCategory: (value: CaseCategoryFilter) => void;
    setDifficulty: (value: CaseDifficultyFilter) => void;
    setSortBy: (value: CaseSortOption) => void;
    resetFilters: () => void;
    hasActiveFilters: boolean;
    filteredCases: Case[];
}

export function useCaseFilters(cases: Case[]): UseCaseFiltersResult {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<CaseCategoryFilter>('all');
    const [difficulty, setDifficulty] = useState<CaseDifficultyFilter>('all');
    const [sortBy, setSortBy] = useState<CaseSortOption>('newest');

    const resetFilters = useCallback(() => {
        setSearch('');
        setCategory('all');
        setDifficulty('all');
        setSortBy('newest');
    }, []);

    const filteredCases = useMemo(() => {
        const term = search.trim().toLowerCase();

        let result = cases;

        if (term) {
            result = result.filter((c) => {
                const title = c.title?.toLowerCase() ?? '';
                const scenario = c.scenario?.toLowerCase() ?? '';
                const problem = c.problem?.toLowerCase() ?? '';
                const company =
                    c.company_name?.toLowerCase() ??
                    c.organization_name?.toLowerCase() ??
                    '';

                return (
                    title.includes(term) ||
                    scenario.includes(term) ||
                    problem.includes(term) ||
                    company.includes(term)
                );
            });
        }

        if (category !== 'all') {
            result = result.filter((c) => c.category === category);
        }

        if (difficulty !== 'all') {
            result = result.filter((c) => c.difficulty === difficulty);
        }

        const sorted = [...result];
        sorted.sort((a, b) => {
            if (sortBy === 'submissions') {
                return b.submissions_count - a.submissions_count;
            }
            if (sortBy === 'popular') {
                // combine views and saves as a simple popularity score
                const scoreA = (a.views_count ?? 0) + (a.saves_count ?? 0);
                const scoreB = (b.views_count ?? 0) + (b.saves_count ?? 0);
                return scoreB - scoreA;
            }

            // default: newest first
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return sorted;
    }, [cases, search, category, difficulty, sortBy]);

    const hasActiveFilters =
        search.trim().length > 0 ||
        category !== 'all' ||
        difficulty !== 'all' ||
        sortBy !== 'newest';

    return {
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
    };
}

