import type { CaseCategory, DifficultyLevel } from '@/types/case';
import { useEffect, useState } from 'react';

type CategoryFilter = 'all' | CaseCategory;
type DifficultyFilter = 'all' | DifficultyLevel;
type SortFilter = 'newest' | 'popular' | 'submissions';

interface CasesFiltersProps {
    search: string;
    category: CategoryFilter;
    difficulty: DifficultyFilter;
    sortBy: SortFilter;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: CategoryFilter) => void;
    onDifficultyChange: (value: DifficultyFilter) => void;
    onSortByChange: (value: SortFilter) => void;
}

export function CasesFilters({
    search,
    category,
    difficulty,
    sortBy,
    onSearchChange,
    onCategoryChange,
    onDifficultyChange,
    onSortByChange,
}: CasesFiltersProps) {
    const [keyword, setKeyword] = useState(search);

    useEffect(() => {
        setKeyword(search);
    }, [search]);

    const triggerSearch = () => {
        onSearchChange(keyword.trim());
    };

    return (
        <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div className="flex items-center gap-3">
                <div className="min-w-[200px] w-[280px]">
                    <input
                        type="search"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                triggerSearch();
                            }
                        }}
                        placeholder="Search by title, company, or description..."
                        className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/60"
                    />
                </div>
                <button
                    type="button"
                    onClick={triggerSearch}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover"
                >
                    Search
                </button>
            </div>
            <select
                className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
            >
                <option value="all">All Categories</option>
                <option value="solved">Solved</option>
                <option value="open">Open</option>
                <option value="process">Process Optimization</option>
                <option value="policy">Policy</option>
                <option value="content">Content Creation</option>
            </select>
            <select
                className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={difficulty}
                onChange={(e) => onDifficultyChange(e.target.value as DifficultyFilter)}
            >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
            </select>
            <select
                className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortFilter)}
            >
                <option value="newest">Sort by: Newest</option>
                <option value="popular">Most Popular</option>
                <option value="submissions">Most Submissions</option>
            </select>
        </div>
    );
}

