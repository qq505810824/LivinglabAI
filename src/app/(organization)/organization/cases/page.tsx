'use client';

import { CaseList } from '@/components/org/cases/CaseList';
import { useCases } from '@/hooks/useCases';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrgCasesPage() {
  const { cases, isLoading, deleteCase } = useCases();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">📝 Cases Management</h1>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">📝 Cases Management</h1>
          <p className="text-text-secondary">Create and manage your organization&apos;s case studies.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          onClick={() => router.push('/dashboard/cases/new')}
        >
          <Plus className="w-4 h-4" />
          Create Case
        </button>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Cases Yet</h3>
          <p className="text-text-secondary mb-4">Start by creating your first case study</p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            onClick={() => router.push('/dashboard/cases/new')}
          >
            <Plus className="w-4 h-4" />
            Create Case
          </button>
        </div>
      ) : (
        <CaseList
          items={cases}
          onEdit={(item) => {
            router.push(`/dashboard/cases/${item.id}/edit`);
          }}
          onDelete={(id) => {
            void deleteCase(id);
          }}
        />
      )}
    </div>
  );
}
