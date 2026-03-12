export type SubmissionResourceType =
  | 'case_project'
  | 'internship_application'
  | 'program_application';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface Submission {
  id: string;
  user_id: string;
  owner_id: string;
  resource_type: SubmissionResourceType;
  resource_id: string;
  status: SubmissionStatus;

  title?: string;
  organization_name?: string;
  submitter_name?: string;
  submitter_email?: string;

  team_setup?: string;
  university?: string;
  portfolio_url?: string;

  payload: any;
  submitted_at: string;
  updated_at: string;
  completed_at?: string;
  meta?: any;
}

