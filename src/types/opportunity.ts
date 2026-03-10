export type OpportunityType = 'internship' | 'program';
export type OpportunityStatus = 'active' | 'closed' | 'draft';

export interface Opportunity {
    id: string;
    type: OpportunityType;
    organization_id: string;
    title: string;
    description: string;
    location?: string;
    duration?: string;
    stipend?: string;
    deadline?: string;
    requirements: string[];
    perks: string[];
    skills_required: string[];
    applicants_count: number;
    status: OpportunityStatus;
    created_at: string;
    updated_at: string;

    // Computed fields
    organization_name?: string;
}

export interface CreateOpportunityInput {
    type: OpportunityType;
    organization_name: string;
    title: string;
    description: string;
    location?: string;
    duration?: string;
    stipend?: string;
    deadline?: string;
    requirements: string[];
    perks: string[];
    skills_required: string[];
    status?: OpportunityStatus;
}
