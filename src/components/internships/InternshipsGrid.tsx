import { InternshipCard } from '@/components/internships/InternshipCard';
import type { Opportunity } from '@/types/opportunity';

interface InternshipsGridProps {
  internships: Opportunity[];
  appliedIds: string[];
  onSelect: (opp: Opportunity) => void;
}

export function InternshipsGrid({
  internships,
  appliedIds,
  onSelect,
}: InternshipsGridProps) {
  if (internships.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No internships available
        </h3>
        <p className="text-text-secondary">
          Check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {internships.map((opp) => (
        <InternshipCard
          key={opp.id}
          opportunity={opp}
          applied={appliedIds.includes(opp.id)}
          onClick={() => onSelect(opp)}
        />
      ))}
    </div>
  );
}

