export type CaseCategory = 'solved' | 'open' | 'process' | 'policy' | 'content';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CaseStatus = 'draft' | 'active' | 'closed';

/** Industry (align with index.html) */
export type CaseIndustry =
  | 'tech'
  | 'retail'
  | 'finance'
  | 'healthcare'
  | 'manufacturing'
  | 'education'
  | 'other';

/** Company size (align with index.html) */
export type CompanySize = '1-10' | '11-50' | '51-200' | '200+';

/** Deliverable type (align with index.html) */
export type DeliverableType =
  | 'report'
  | 'prototype'
  | 'strategy'
  | 'policy'
  | 'creative';

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

  // Company info (align with index.html)
  company_name?: string;
  industry?: CaseIndustry;
  company_size?: CompanySize;
  deliverable_type?: DeliverableType;

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

  // Company info (align with index.html)
  company_name?: string;
  industry?: CaseIndustry;
  company_size?: CompanySize;
  deliverable_type?: DeliverableType;
}
