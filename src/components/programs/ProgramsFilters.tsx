export function ProgramsFilters() {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
        <option>All Types</option>
        <option>University</option>
        <option>Company</option>
        <option>Institution</option>
      </select>
      <select className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary">
        <option>All Locations</option>
        <option>Remote</option>
        <option>On-site</option>
        <option>Hybrid</option>
      </select>
    </div>
  );
}

