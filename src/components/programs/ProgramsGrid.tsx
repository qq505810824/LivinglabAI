import { ProgramCard } from '@/components/programs/ProgramCard';
import type { Opportunity } from '@/types/opportunity';
interface ProgramsGridProps {
    programs: Opportunity[];
    onSelect: (program: Opportunity) => void;
}

export function ProgramsGrid({ programs, onSelect }: ProgramsGridProps) {
    if (programs.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No Programs Available
                </h3>
                <p className="text-text-secondary">Check back later for new opportunities.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
                <ProgramCard key={program.id} program={program} onSelect={onSelect} />
            ))}
        </div>
    );
}

