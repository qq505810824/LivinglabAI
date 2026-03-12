'use client';

import { CardLoader } from '@/components/common/CardLoader';
import { PageBack } from '@/components/common/PageBack';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useSubmissions } from '@/hooks/useSubmissions';
import type { Submission } from '@/types/submission';
import { useEffect, useMemo, useState } from 'react';

type TabKey = 'all' | 'case_project' | 'internship_application' | 'program_application';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { submissions, isLoading, error, fetchMySubmissions } = useSubmissions();
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    if (!user) return;
    void fetchMySubmissions({ userId: user.id });
  }, [user, fetchMySubmissions]);

  const filtered = useMemo(() => {
    if (tab === 'all') return submissions;
    return submissions.filter((s) => s.resource_type === tab);
  }, [submissions, tab]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <PageBack />
        <div className="mt-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
          Please log in to view your projects and applications.
        </div>
      </div>
    );
  }

  if (isLoading && submissions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <CardLoader count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <PageBack />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">My Projects & Applications</h1>
          <p className="text-sm text-text-secondary">
            All your case projects, internship and program applications in one place.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-full border border-border bg-background-secondary p-1 text-xs">
        {([
          { key: 'all', label: 'All' },
          { key: 'case_project', label: 'Projects' },
          { key: 'internship_application', label: 'Internships' },
          { key: 'program_application', label: 'Programs' },
        ] as { key: TabKey; label: string }[]).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-sm text-danger bg-danger/5 border border-danger/40 rounded-lg px-3 py-2">
          {error.message}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-6 bg-background-secondary border-border text-sm text-text-secondary">
          <p>
            You don&apos;t have any {tab === 'all' ? '' : tab.replace('_', ' ')} submissions yet.
            Start a project or apply to an internship / program to see them here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <SubmissionRow key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  const typeLabel =
    submission.resource_type === 'case_project'
      ? '📦 Project'
      : submission.resource_type === 'internship_application'
        ? '💼 Internship'
        : '🎓 Program';

  const statusColor =
    submission.status === 'accepted'
      ? 'text-success'
      : submission.status === 'rejected'
        ? 'text-danger'
        : submission.status === 'completed'
          ? 'text-primary'
          : 'text-text-secondary';

  return (
    <Card className="p-4 bg-background-secondary border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{typeLabel}</span>
            <span>·</span>
            <span className={statusColor}>{submission.status}</span>
          </div>
          <div className="text-sm font-semibold text-text-primary">
            {submission.title || 'Untitled'}
          </div>
          {submission.organization_name && (
            <div className="text-xs text-text-secondary">{submission.organization_name}</div>
          )}
        </div>
        <div className="text-xs text-text-tertiary text-right">
          <div>Submitted</div>
          <div>
            {submission.submitted_at
              ? new Date(submission.submitted_at).toLocaleString()
              : '—'}
          </div>
        </div>
      </div>
    </Card>
  );
}

