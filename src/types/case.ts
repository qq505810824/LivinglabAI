export type CaseCategory = 'solved' | 'open' | 'process' | 'policy' | 'content';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CaseStatus = 'draft' | 'active' | 'closed';

export interface Case {
  id: string;
  title: string;
  organization_id: string;
  department: string;
  category: CaseCategory;
  difficulty: DifficultyLevel;
  scenario: string;
  problem: string;
  existing_solution?: string;
  deliverable: string;
  public_data?: string;
  estimated_hours: number;
  skills: string[];
  submissions_count: number;
  status: CaseStatus;
  ai_generated_brief?: string;
  views_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;

  // Computed fields (from joins)
  organization_name?: string;
  organization_logo?: string;
}

export interface CreateCaseInput {
  title: string;
  department: string;
  category: CaseCategory;
  difficulty: DifficultyLevel;
  scenario: string;
  problem: string;
  existing_solution?: string;
  deliverable: string;
  public_data?: string;
  estimated_hours: number;
  skills: string[];
}
