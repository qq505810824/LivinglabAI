import type { Opportunity } from '@/types/opportunity';

interface ProgramDetailModalProps {
    selected: Opportunity | null;
    applied: boolean;
    onApply: (id: string) => void;
    onClose: () => void;
    hideActions?: boolean;
}

export function ProgramDetailModal({
    selected,
    applied,
    onApply,
    onClose,
    hideActions,
}: ProgramDetailModalProps) {
    if (!selected) return null;

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

                        <div className="font-semibold text-primary">
                            {selected.organization_name || 'Organization'}
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                        {selected.duration && (
                            <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                                <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                    Duration
                                </div>
                                <div className="text-text-primary">{selected.duration}</div>
                            </div>
                        )}
                        {selected.stipend && (
                            <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                                <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                    Stipend / Cost
                                </div>
                                <div className="text-text-primary">{selected.stipend}</div>
                            </div>
                        )}
                        {selected.location && (
                            <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                                <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                    Location
                                </div>
                                <div className="text-text-primary">{selected.location}</div>
                            </div>
                        )}
                        {selected.deadline && (
                            <div className="rounded-xl border border-border/60 bg-background-secondary/70 px-3 py-2.5 flex flex-col gap-1">
                                <div className="text-[11px] font-medium tracking-wide text-text-tertiary uppercase">
                                    Application Deadline
                                </div>
                                <div className="text-text-primary">
                                    {new Date(selected.deadline).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* About */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-text-primary mb-1">About</h4>
                        <p className="text-sm text-text-secondary">{selected.description}</p>
                    </div>

                    {/* Requirements */}
                    {selected.requirements?.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-text-primary mb-1">Highlights</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                                {selected.requirements.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Perks */}
                    {selected.perks?.length > 0 && (
                        <div className="mb-2">
                            <h4 className="font-semibold text-text-primary mb-1">Perks</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                                {selected.perks.map((p) => (
                                    <li key={p}>{p}</li>
                                ))}
                            </ul>
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
                    {!hideActions &&
                        (applied ? (
                            <button
                                className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium cursor-default"
                                disabled
                            >
                                ✅ Applied
                            </button>
                        ) : (
                            <button
                                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                                onClick={() => onApply(selected.id)}
                            >
                                📝 Apply Now
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}

