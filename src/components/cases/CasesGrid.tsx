import { CaseCard } from '@/components/cases/CaseCard';
import type { Case } from '@/types/case';

interface CasesGridProps {
    cases: Case[];
    onSelect: (caseItem: Case) => void;
    isFiltered?: boolean;
    onResetFilters?: () => void;
}

export function CasesGrid({ cases, onSelect, isFiltered, onResetFilters }: CasesGridProps) {
    if (cases.length === 0) {
        if (isFiltered) {
            return (
                <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-background-secondary/40">
                    <div className="text-5xl mb-3">🤔</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                        No cases match your filters
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                        Try adjusting your search terms or reset all filters to see more cases.
                    </p>
                    {onResetFilters && (
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-background-tertiary"
                            onClick={onResetFilters}
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No Cases Available
                </h3>
                <p className="text-text-secondary">Check back later for new opportunities.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} onClick={() => onSelect(caseItem)} />
            ))}
        </div>
    );
}


