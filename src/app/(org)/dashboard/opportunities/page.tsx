'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

export default function OrgOpportunitiesPage() {
  const { opportunities, isLoading, createOpportunity, deleteOpportunity } = useOpportunities();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const getStatusColor = (status: string): 'green' | 'red' | 'yellow' => {
    switch (status) {
      case 'active': return 'green';
      case 'closed': return 'red';
      case 'draft': return 'yellow';
      default: return 'yellow';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'internship' ? '💼' : '🎓';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">📌 Opportunities Management</h1>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">📌 Opportunities Management</h1>
          <p className="text-text-secondary">Post and manage internship and program opportunities.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Create Opportunity
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-8 p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">Create New Opportunity</h2>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setIsCreating(true);
            // TODO: Implement form submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsCreating(false);
            setShowCreateForm(false);
          }}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Title" placeholder="Software Engineering Intern" required />
              <select className="px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm" required>
                <option value="internship">Internship</option>
                <option value="program">Program</option>
              </select>
            </div>
            <textarea
              className="w-full px-4 py-2 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary min-h-[100px]"
              placeholder="Description"
              required
            />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Location" placeholder="San Francisco, CA" />
              <Input label="Duration" placeholder="3 months" />
              <Input label="Stipend" placeholder="$5000/month" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isCreating}>Create</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      {opportunities.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Opportunities Yet</h3>
          <p className="text-text-secondary mb-4">Start by creating your first opportunity</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            Create Opportunity
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} variant="hoverable" className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(opp.type)}</span>
                    <Badge variant={getStatusColor(opp.status) as any}>{opp.status}</Badge>
                    <span className="text-xs text-text-tertiary">
                      {new Date(opp.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-2">{opp.title}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{opp.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {opp.location && (
                      <span className="px-3 py-1 bg-background-tertiary rounded-full text-xs text-text-secondary">
                        📍 {opp.location}
                      </span>
                    )}
                    {opp.duration && (
                      <span className="px-3 py-1 bg-background-tertiary rounded-full text-xs text-text-secondary">
                        ⏱️ {opp.duration}
                      </span>
                    )}
                    {opp.stipend && (
                      <span className="px-3 py-1 bg-success-bg rounded-full text-xs text-success">
                        💰 {opp.stipend}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {opp.applicants_count} applicants
                    </span>
                    {opp.deadline && (
                      <span>⏰ Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-2 hover:bg-background-tertiary rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button
                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                    onClick={() => deleteOpportunity(opp.id)}
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
