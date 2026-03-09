'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCases } from '@/hooks/useCases';
import { FileText, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

export default function OrgCasesPage() {
  const { cases, isLoading, createCase, deleteCase } = useCases();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const getCategoryColor = (category: string): 'purple' | 'blue' | 'yellow' | 'pink' | 'green' => {
    switch (category) {
      case 'solved': return 'purple';
      case 'open': return 'blue';
      case 'process': return 'yellow';
      case 'policy': return 'pink';
      case 'content': return 'green';
      default: return 'purple';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

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
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Create Case
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-8 p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">Create New Case</h2>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setIsCreating(true);
            // TODO: Implement actual form submission with all fields
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsCreating(false);
            setShowCreateForm(false);
          }}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Title" placeholder="AI-Powered Customer Service" required />
              <Input label="Department" placeholder="Engineering" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm" required>
                <option value="">Select Category</option>
                <option value="solved">Solved</option>
                <option value="open">Open</option>
                <option value="process">Process Optimization</option>
                <option value="policy">Policy Making</option>
                <option value="content">Content Creation</option>
              </select>

              <select className="px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm" required>
                <option value="">Select Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <textarea
              className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[100px]"
              placeholder="Scenario Description"
              required
            />

            <textarea
              className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[80px]"
              placeholder="Problem Statement"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Estimated Hours" type="number" placeholder="40" />
              <Input label="Skills (comma separated)" placeholder="Python, ML, NLP" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isCreating}>Create Case</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Cases Yet</h3>
          <p className="text-text-secondary mb-4">Start by creating your first case study</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            Create Case
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} variant="hoverable" className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getCategoryColor(caseItem.category)}>{caseItem.category}</Badge>
                    <span className="text-xs text-text-tertiary">
                      {getDifficultyIcon(caseItem.difficulty)} {caseItem.difficulty}
                    </span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <span className="text-xs text-text-tertiary">
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-2">{caseItem.title}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{caseItem.scenario}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {caseItem.skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-background-tertiary rounded text-xs text-text-secondary">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {caseItem.submissions_count} submissions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      👁️ {caseItem.views_count}
                    </span>
                    <span>⏱️ {caseItem.estimated_hours}h estimated</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-2 hover:bg-background-tertiary rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button
                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                    onClick={() => deleteCase(caseItem.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
