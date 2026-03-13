import type { Submission } from '@/types/submission';
import { formatCaseProjectFields } from '@/utils/submissionDisplay';

interface CaseSubmissionDetailModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export function CaseSubmissionDetailModal({
  submission,
  onClose,
}: CaseSubmissionDetailModalProps) {
  if (!submission) return null;

  const fields = formatCaseProjectFields(submission);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-in fade-in-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-w-xl w-full bg-background-primary rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Submission Detail</h2>
          <button
            className="text-text-tertiary hover:text-text-secondary text-lg"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto text-xs space-y-3">
          <div>
            <div className="font-semibold text-text-secondary mb-1">Student</div>
            <div className="text-text-primary">
              {submission.submitter_name || '—'} ({submission.submitter_email || '—'})
            </div>
          </div>
          <div>
            <div className="font-semibold text-text-secondary mb-1">Status</div>
            <div className="text-text-primary capitalize">{submission.status}</div>
          </div>
          <div>
            <div className="font-semibold text-text-secondary mb-1">Submitted At</div>
            <div className="text-text-primary">
              {submission.submitted_at
                ? new Date(submission.submitted_at).toLocaleString()
                : '—'}
            </div>
          </div>
          {fields.length > 0 ? (
            <div>
              <div className="font-semibold text-text-secondary mb-1">Form Data</div>
              <dl className="grid grid-cols-1 gap-y-2">
                {fields.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4">
                    <dt className="text-text-secondary">{f.label}</dt>
                    <dd className="text-text-primary text-right">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="text-text-tertiary text-xs">No additional form data.</div>
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

