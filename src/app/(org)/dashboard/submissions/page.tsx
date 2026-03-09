'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CheckCircle, Clock, FileText, Star, User, XCircle } from 'lucide-react';
import { useState } from 'react';

// Mock data for demo (replace with real data from Supabase)
const mockSubmissions = [
  {
    id: '1',
    case_title: 'AI-Powered Customer Service',
    student_name: 'Alice Chen',
    student_avatar: 'A',
    submitted_at: '2026-03-08',
    status: 'pending',
    project_url: 'https://github.com/alice/ai-cs-project',
    video_url: '',
    rating: 0,
  },
  {
    id: '2',
    case_title: 'Data Pipeline Optimization',
    student_name: 'Bob Smith',
    student_avatar: 'B',
    submitted_at: '2026-03-07',
    status: 'reviewed',
    project_url: 'https://github.com/bob/data-pipeline',
    video_url: 'https://youtube.com/watch?v=xxx',
    rating: 4,
  },
  {
    id: '3',
    case_title: 'ML Model Deployment',
    student_name: 'Carol Wang',
    student_avatar: 'C',
    submitted_at: '2026-03-06',
    status: 'accepted',
    project_url: 'https://github.com/carol/ml-deploy',
    video_url: '',
    rating: 5,
  },
];

export default function OrgSubmissionsPage() {
  const [submissions] = useState(mockSubmissions);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'reviewed': return <FileText className="w-4 h-4 text-info" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-danger" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string): 'yellow' | 'blue' | 'green' | 'red' => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'reviewed': return 'blue';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'yellow';
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter !== 'all' && sub.status !== filter) return false;
    if (searchQuery && !sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sub.case_title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">👀 Student Submissions</h1>
        <p className="text-text-secondary">Review and provide feedback on student work.</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by student or case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({submissions.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending ({submissions.filter(s => s.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'reviewed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('reviewed')}
            >
              Reviewed
            </Button>
            <Button
              variant={filter === 'accepted' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('accepted')}
            >
              Accepted
            </Button>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Submissions Found</h3>
          <p className="text-text-secondary\">Try adjusting your filters</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} variant="hoverable" className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {submission.student_avatar}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1">{submission.status}</span>
                    </Badge>
                    <span className="text-xs text-text-tertiary">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-1">
                    {submission.case_title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3 text-sm text-text-secondary">
                    <User className="w-4 h-4" />
                    <span>{submission.student_name}</span>
                  </div>

                  {/* Links */}
                  <div className="flex gap-3 mb-3">
                    {submission.project_url && (
                      <a
                        href={submission.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Project
                      </a>
                    )}
                    {submission.video_url && (
                      <a
                        href={submission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        🎬 Watch Video
                      </a>
                    )}
                  </div>

                  {/* Rating */}
                  {submission.rating > 0 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < submission.rating
                              ? 'fill-warning text-warning'
                              : 'fill-background-tertiary text-text-tertiary'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {submission.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                      <Button size="sm" variant="danger">
                        Reject
                      </Button>
                      <Button size="sm" variant="secondary">
                        Accept
                      </Button>
                    </>
                  )}
                  {submission.status === 'reviewed' && (
                    <Button size="sm" variant="outline">
                      Edit Review
                    </Button>
                  )}
                  {(submission.status === 'accepted' || submission.status === 'rejected') && (
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
