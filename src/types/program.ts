export type OrgType = 'university' | 'company' | 'institution';
export type ProgramStatus = 'active' | 'closed' | 'upcoming';

export interface Program {
  id: string;
  title: string;
  organization: string;
  org_type: OrgType;
  duration: string;
  dates: string;
  deadline: string;
  description: string;
  highlights: string[];
  location?: string;
  cost?: string;
  capacity?: number;
  target_audience?: string;
  prerequisites?: string[];
  certificate?: boolean;
  application_url?: string;
  website_url?: string;
  contact_email?: string;
  logo_color?: string;
  status: ProgramStatus;
  applicants_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramInput {
  title: string;
  organization: string;
  org_type: OrgType;
  duration: string;
  dates: string;
  deadline: string;
  description: string;
  highlights: string[];
  location?: string;
  cost?: string;
  capacity?: number;
  target_audience?: string;
  prerequisites?: string[];
  certificate?: boolean;
  application_url?: string;
  website_url?: string;
  contact_email?: string;
  logo_color?: string;
}
