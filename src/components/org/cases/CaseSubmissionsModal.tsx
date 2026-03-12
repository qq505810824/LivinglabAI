import type { Submission } from '@/types/submission';
import type { Case } from '@/types/case';
import { useEffect, useState } from 'react';

interface CaseSubmissionsModalProps {
  caseItem: Case | null;
  ownerId: string | null;
  onClose: () => void;
}

export function CaseSubmissionsModal({ caseItem, ownerId, onClose }: CaseSubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!caseItem || !ownerId) return;
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          resourceType: 'case_project',
          resourceId: caseItem.id,
          ownerId,
        });
        const res = await fetch(`/api/admin/submissions?${params.toString()}`);
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.message || json?.error || 'Failed to load submissions');
        }
        const json = await res.json();
        setSubmissions((json.data || []) as Submission[]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [caseItem, ownerId]);

  if (!caseItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-in fade-in-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-w-3xl w-full bg-background-primary rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            Submissions for: <span className="font-bold">{caseItem.title}</span>
          </h2>
          <button
            className="text-text-tertiary hover:text-text-secondary text-lg"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-text-secondary">Loading...</div>
          ) : error ? (
            <div className="py-3 text-sm text-danger bg-danger/10 border border-danger/40 rounded-lg px-3">
              {error}
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-10 text-center text-sm text-text-secondary">
              No submissions for this case yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-background-secondary">
              <table className="min-w-full text-sm">
                <thead className="bg-background-tertiary/60">
                  <tr className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Team Setup</th>
                    <th className="px-4 py-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t border-border/60 hover:bg-background-primary/60 transition-colors"
                    >
                      <td className="px-4 py-3 align-top text-xs text-text-primary">
                        {s.submitter_name || '—'}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-text-secondary">
                        {s.submitter_email || '—'}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-text-secondary capitalize">
                        {s.status}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-text-secondary">
                        {s.team_setup ?? s.payload?.teamSetup ?? '—'}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-text-tertiary">
                        {s.submitted_at
                          ? new Date(s.submitted_at).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end">
          <button
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-background-tertiary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

