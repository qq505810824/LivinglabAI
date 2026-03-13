'use client';

import { PageBack } from '@/components/common/PageBack';
import { Card } from '@/components/ui/Card';
import { CaseSubmissionDetailModal } from '@/components/org/cases/CaseSubmissionDetailModal';
import { CaseSummaryCard } from '@/components/org/cases/CaseSummaryCard';
import { useAuth } from '@/hooks/useAuth';
import { useCaseSubmissions } from '@/hooks/useCaseSubmissions';
import { useCases } from '@/hooks/useCases';
import type { Case } from '@/types/case';
import type { Submission } from '@/types/submission';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrgCaseSubmissionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { getCaseById } = useCases();

  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);
  const [isCaseLoading, setIsCaseLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsCaseLoading(true);
        const data = await getCaseById(id);
        if (!data) {
          throw new Error('Case not found');
        }
        setCaseItem(data as Case);
        setCaseError(null);
      } catch (e) {
        setCaseError(e instanceof Error ? e.message : 'Failed to load case');
      } finally {
        setIsCaseLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { submissions, isLoading: isSubsLoading, error: subsError } = useCaseSubmissions(
    id,
    user?.id ?? null,
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <PageBack label="Back to cases" href="/organization/cases" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Case Submissions</h1>
          {caseItem && (
            <p className="text-sm text-text-secondary">
              {caseItem.title} · {submissions.length} submissions
            </p>
          )}
        </div>
      </div>

      {caseItem && <CaseSummaryCard item={caseItem} />}

      {caseError && (
        <div className="text-sm text-danger bg-danger/5 border border-danger/40 rounded-lg px-3 py-2">
          {caseError}
        </div>
      )}

      <Card className="p-4 bg-background-secondary border-border">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Submissions</h2>
        {isSubsLoading ? (
          <div className="py-10 text-center text-xs text-text-tertiary">
            Loading submissions...
          </div>
        ) : subsError ? (
          <div className="py-3 text-xs text-danger bg-danger/5 border border-danger/40 rounded-lg px-3">
            {subsError}
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-10 text-center text-xs text-text-tertiary">
            No submissions for this case yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-background-secondary">
            <table className="min-w-full text-xs">
              <thead className="bg-background-tertiary/60">
                <tr className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Team Setup</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-border/60 hover:bg-background-primary/60 transition-colors"
                  >
                    <td className="px-4 py-3 align-top text-text-primary">
                      {s.submitter_name || '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {s.submitter_email || '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary capitalize">
                      {s.status}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {s.team_setup ?? (s.payload as any)?.teamSetup ?? '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-text-tertiary">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-text-secondary hover:bg-background-tertiary"
                        onClick={() => setSelectedSubmission(s)}
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CaseSubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}

