import { Badge } from '@/components/ui/Badge';
import type { Case } from '@/types/case';

interface CaseDetailModalProps {
    selected: Case | null;
    onClose: () => void;
    hideActions?: boolean;
}

export function CaseDetailModal({ selected, onClose, hideActions }: CaseDetailModalProps) {
    if (!selected) return null;

    const difficultyVariant =
        selected.difficulty === 'beginner'
            ? 'green'
            : selected.difficulty === 'intermediate'
              ? 'yellow'
              : 'red';

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 animate-in fade-in-0"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="max-w-2xl w-full bg-background-primary rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-bold text-text-primary">{selected.title}</h2>
                    <button
                        className="text-text-tertiary hover:text-text-secondary text-lg"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Company badge */}
                    <div className="flex items-center gap-3 mb-4">
                        {selected.organization_logo ? (
                            <img
                                src={selected.organization_logo}
                                alt={selected.organization_name || ''}
                                className="w-10 h-10 rounded-lg object-cover bg-background-tertiary"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                                {(selected.organization_name || 'Organization')
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="font-semibold text-text-primary">
                                {selected.organization_name || 'Organization'}
                            </div>
                            <div className="text-xs text-text-tertiary">
                                {selected.department} Department
                            </div>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                        <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                            <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                Difficulty
                            </div>
                            <div className="text-text-primary">
                                <Badge variant={difficultyVariant} className="capitalize">
                                    {selected.difficulty}
                                </Badge>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                            <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                Est. Hours
                            </div>
                            <div className="text-text-primary">{selected.estimated_hours} hours</div>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                            <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                Category
                            </div>
                            <div className="text-text-primary capitalize">{selected.category}</div>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                            <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                Students
                            </div>
                            <div className="text-text-primary">
                                {selected.submissions_count} working
                            </div>
                        </div>
                    </div>

                    {/* Scenario */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-text-primary mb-1">📋 Scenario</h4>
                        <p className="text-sm text-text-secondary">{selected.scenario}</p>
                    </div>

                    {/* Problem */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-text-primary mb-1">❓ Problem</h4>
                        <p className="text-sm text-text-secondary">{selected.problem}</p>
                    </div>

                    {/* Existing solution */}
                    {selected.existing_solution && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-text-primary mb-1">
                                🔧 Existing Solution
                            </h4>
                            <p className="text-sm text-text-secondary">
                                {selected.existing_solution}
                            </p>
                        </div>
                    )}

                    {/* Deliverable */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-text-primary mb-1">
                            📦 Expected Deliverable
                        </h4>
                        <p className="text-sm text-text-secondary">{selected.deliverable}</p>
                    </div>

                    {/* Public data */}
                    {selected.public_data && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-text-primary mb-1">
                                📂 Available Public Data
                            </h4>
                            <p className="text-sm text-text-secondary">{selected.public_data}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {selected.skills?.length > 0 && (
                        <div className="mb-2">
                            <h4 className="font-semibold text-text-primary mb-1">🛠 Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {selected.skills.map((s) => (
                                    <span
                                        key={s}
                                        className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <button
                        className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-background-tertiary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {!hideActions && (
                        <button
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                            onClick={() => {
                                // TODO: wire to actual "start project" flow
                                onClose();
                            }}
                        >
                            🚀 Start Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

