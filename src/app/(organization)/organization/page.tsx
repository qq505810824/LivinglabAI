'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function OrgDashboardPage() {
  const stats = [
    { label: 'Active Cases', value: '0', icon: '📝', color: 'bg-primary' },
    { label: 'Total Submissions', value: '0', icon: '📥', color: 'bg-success' },
    { label: 'Pending Reviews', value: '0', icon: '⏳', color: 'bg-warning' },
    { label: 'Opportunities Posted', value: '0', icon: '📌', color: 'bg-info' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">📊 Dashboard</h1>
        <p className="text-text-secondary">Manage your organization&apos;s cases and opportunities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/cases">
          <Card variant="hoverable" className="p-6 h-full">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Create New Case</h3>
            <p className="text-sm text-text-secondary">
              Post a new challenge for students to solve.
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/opportunities">
          <Card variant="hoverable" className="p-6 h-full">
            <div className="text-4xl mb-3">📌</div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Post Opportunity</h3>
            <p className="text-sm text-text-secondary">
              Share internship or program opportunities.
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/submissions">
          <Card variant="hoverable" className="p-6 h-full">
            <div className="text-4xl mb-3">👀</div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Review Submissions</h3>
            <p className="text-sm text-text-secondary">
              Review student work and provide feedback.
            </p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h3>
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-5xl mb-4">📭</div>
          <p>No recent activity yet.</p>
        </div>
      </Card>
    </div>
  );
}
