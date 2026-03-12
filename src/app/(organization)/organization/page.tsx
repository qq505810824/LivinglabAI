'use client';

import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import type { Submission } from '@/types/submission';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
    activeCases: number;
    totalSubmissions: number;
    pendingReviews: number;
    opportunitiesPosted: number;
}

export default function OrgDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        activeCases: 0,
        totalSubmissions: 0,
        pendingReviews: 0,
        opportunitiesPosted: 0,
    });
    const [recent, setRecent] = useState<Submission[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;
            try {
                setIsLoadingStats(true);
                const params = new URLSearchParams({
                    ownerId: user.id,
                    isSuperAdmin: 'false',
                });
                const res = await fetch(`/api/admin/submissions/stats?${params.toString()}`);
                if (!res.ok) {
                    throw new Error('Failed to load stats');
                }
                const json = await res.json();
                if (json?.data) {
                    setStats(json.data as DashboardStats);
                }
            } catch (e) {
                // swallow error, keep defaults
                console.error(e);
            } finally {
                setIsLoadingStats(false);
            }
        };

        const loadRecent = async () => {
            if (!user) return;
            try {
                setIsLoadingRecent(true);
                const params = new URLSearchParams({
                    ownerId: user.id,
                    isSuperAdmin: 'false',
                    limit: '5',
                });
                const res = await fetch(`/api/admin/submissions/recent?${params.toString()}`);
                if (!res.ok) {
                    throw new Error('Failed to load recent submissions');
                }
                const json = await res.json();
                setRecent((json.data || []) as Submission[]);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingRecent(false);
            }
        };

    void loadStats();
    void loadRecent();
    }, [user]);

    const statCards = [
        {
            label: 'Active Cases',
            value: isLoadingStats ? '—' : String(stats.activeCases),
            icon: '📝',
            color: 'bg-primary',
        },
        {
            label: 'Total Submissions',
            value: isLoadingStats ? '—' : String(stats.totalSubmissions),
            icon: '📥',
            color: 'bg-success',
        },
        {
            label: 'Pending Reviews',
            value: isLoadingStats ? '—' : String(stats.pendingReviews),
            icon: '⏳',
            color: 'bg-warning',
        },
        {
            label: 'Opportunities Posted',
            value: isLoadingStats ? '—' : String(stats.opportunitiesPosted),
            icon: '📌',
            color: 'bg-info',
        },
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
                {statCards.map((stat) => (
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
                <Link href="/organization/cases">
                    <Card variant="hoverable" className="p-6 h-full">
                        <div className="text-4xl mb-3">📝</div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Create New Case</h3>
                        <p className="text-sm text-text-secondary">
                            Post a new challenge for students to solve.
                        </p>
                    </Card>
                </Link>

                <Link href="/organization/opportunities">
                    <Card variant="hoverable" className="p-6 h-full">
                        <div className="text-4xl mb-3">📌</div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Post Opportunity</h3>
                        <p className="text-sm text-text-secondary">
                            Share internship or program opportunities.
                        </p>
                    </Card>
                </Link>

                <Link href="/organization/submissions">
                    <Card variant="hoverable" className="p-6 h-full">
                        <div className="text-4xl mb-3">👀</div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Review Submissions</h3>
                        <p className="text-sm text-text-secondary">
                            Review student work and provide feedback.
                        </p>
                    </Card>
                </Link>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h3>
                {isLoadingRecent ? (
                    <div className="text-center py-12 text-text-tertiary">
                        <div className="text-sm">Loading recent submissions...</div>
                    </div>
                ) : recent.length === 0 ? (
                    <div className="text-center py-12 text-text-tertiary">
                        <div className="text-5xl mb-4">📭</div>
                        <p>No recent activity yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recent.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background-secondary px-4 py-3 text-xs"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <div className="font-medium text-text-primary">
                                        {s.title || 'Untitled'}
                                    </div>
                                    {s.submitter_name && (
                                        <div className="text-text-secondary">
                                            {s.submitter_name} · {s.submitter_email}
                                        </div>
                                    )}
                                    <div className="text-text-tertiary">
                                        {s.resource_type === 'case_project'
                                            ? '📦 Project started'
                                            : s.resource_type === 'internship_application'
                                                ? '💼 Internship application'
                                                : '🎓 Program application'}
                                    </div>
                                </div>
                                <div className="text-right text-text-tertiary">
                                    <div>
                                        {s.submitted_at
                                            ? new Date(s.submitted_at).toLocaleString()
                                            : '—'}
                                    </div>
                                    <div className="capitalize">{s.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
