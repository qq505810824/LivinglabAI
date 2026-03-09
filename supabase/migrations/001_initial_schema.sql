-- ====================================
-- CaseVault Database Schema
-- Target: Supabase (PostgreSQL)
-- Generated: 2026-03-09
-- ====================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- ENUM TYPES
-- ====================================

CREATE TYPE user_role_enum AS ENUM ('student', 'organization');
CREATE TYPE case_category_enum AS ENUM ('solved', 'open', 'process', 'policy', 'content');
CREATE TYPE difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE case_status_enum AS ENUM ('draft', 'active', 'closed');
CREATE TYPE team_type_enum AS ENUM ('solo', 'pair', 'team');
CREATE TYPE project_status_enum AS ENUM ('not_started', 'in_progress', 'submitted', 'completed');
CREATE TYPE opportunity_type_enum AS ENUM ('internship', 'program');
CREATE TYPE application_status_enum AS ENUM ('pending', 'under_review', 'accepted', 'rejected');

-- ====================================
-- TABLES
-- ====================================

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50),
  website VARCHAR(255),
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  location VARCHAR(255),
  founded_year INTEGER,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role_enum DEFAULT 'student',
  organization_id UUID REFERENCES organizations(id),
  university VARCHAR(255),
  major VARCHAR(255),
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  department VARCHAR(100) NOT NULL,
  category case_category_enum NOT NULL,
  difficulty difficulty_level_enum NOT NULL,
  scenario TEXT NOT NULL,
  problem TEXT NOT NULL,
  existing_solution TEXT,
  deliverable TEXT NOT NULL,
  public_data TEXT,
  estimated_hours INTEGER CHECK (estimated_hours BETWEEN 1 AND 100),
  skills TEXT[] DEFAULT '{}',
  submissions_count INTEGER DEFAULT 0,
  status case_status_enum DEFAULT 'active',
  ai_generated_brief TEXT,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  user_id UUID NOT NULL REFERENCES users(id),
  team_type team_type_enum NOT NULL,
  team_member_ids UUID[] DEFAULT '{}',
  goal TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status project_status_enum DEFAULT 'not_started',
  start_date DATE DEFAULT CURRENT_DATE,
  submission JSONB DEFAULT '{}',
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(case_id, user_id)
);

-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type opportunity_type_enum NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  duration VARCHAR(100),
  stipend VARCHAR(100),
  deadline DATE,
  requirements TEXT[] DEFAULT '{}',
  perks TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  applicants_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  user_id UUID NOT NULL REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  university VARCHAR(255),
  major VARCHAR(255),
  portfolio_url TEXT,
  statement TEXT NOT NULL,
  related_project_ids UUID[] DEFAULT '{}',
  resume_url TEXT,
  status application_status_enum DEFAULT 'pending',
  review_notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Programs table (Summer Programs)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  org_type VARCHAR(50) CHECK (org_type IN ('university', 'company', 'institution')),
  duration VARCHAR(100) NOT NULL,
  dates VARCHAR(255) NOT NULL,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  location VARCHAR(255),
  cost VARCHAR(100),
  capacity INTEGER,
  target_audience TEXT,
  prerequisites TEXT[],
  certificate BOOLEAN DEFAULT false,
  application_url TEXT,
  website_url TEXT,
  contact_email VARCHAR(255),
  logo_color VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  applicants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program Applications table
CREATE TABLE program_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id),
  user_id UUID NOT NULL REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  university VARCHAR(255),
  year VARCHAR(50),
  major VARCHAR(255),
  statement TEXT NOT NULL,
  resume_url TEXT,
  portfolio_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(program_id, user_id)
);

-- ====================================
-- INDEXES
-- ====================================

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cases_organization ON cases(organization_id);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_difficulty ON cases(difficulty);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_projects_case ON projects(case_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE UNIQUE INDEX idx_unique_application ON applications(opportunity_id, user_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_deadline ON programs(deadline);
CREATE INDEX idx_programs_org_type ON programs(org_type);
CREATE INDEX idx_program_applications_program ON program_applications(program_id);
CREATE INDEX idx_program_applications_user ON program_applications(user_id);
CREATE INDEX idx_program_applications_status ON program_applications(status);

-- ====================================
-- TRIGGERS
-- ====================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_applications ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  USING (true);

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Cases policies
CREATE POLICY "Active cases are viewable by everyone"
  ON cases FOR SELECT
  USING (status = 'active');

CREATE POLICY "Organization members can view their own cases"
  ON cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = cases.organization_id
      AND o.id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Organizations can insert their own cases"
  ON cases FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Projects policies
CREATE POLICY "Students can view their own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Students can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update their own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Organizations can view projects for their cases"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN organizations o ON c.organization_id = o.id
      WHERE c.id = projects.case_id
      AND o.id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Opportunities policies
CREATE POLICY "Opportunities are viewable by everyone"
  ON opportunities FOR SELECT
  USING (status = 'active');

CREATE POLICY "Organizations can insert their own opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications"
  ON applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizations can view applications for their opportunities"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM opportunities o
      WHERE o.id = applications.opportunity_id
      AND o.id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Programs policies
CREATE POLICY "Active programs are viewable by everyone"
  ON programs FOR SELECT
  USING (status = 'active');

-- Program Applications policies
CREATE POLICY "Users can view their own program applications"
  ON program_applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own program applications"
  ON program_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());
