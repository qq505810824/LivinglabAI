-- ====================================
-- CaseVault Database Schema
-- Target: Supabase (PostgreSQL)
-- Generated: 2026-03-09
-- ====================================


-- ====================================
-- TABLES
-- ====================================

CREATE TYPE case_category_enum AS ENUM ('solved', 'open', 'process', 'policy', 'content');
CREATE TYPE difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE case_status_enum AS ENUM ('draft', 'active', 'closed');
CREATE TYPE team_type_enum AS ENUM ('solo', 'pair', 'team');
CREATE TYPE project_status_enum AS ENUM ('not_started', 'in_progress', 'submitted', 'completed');
CREATE TYPE opportunity_type_enum AS ENUM ('internship', 'program');
CREATE TYPE application_status_enum AS ENUM ('pending', 'under_review', 'accepted', 'rejected');

-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
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
  user_id UUID NOT NULL REFERENCES users(id),
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
  org_type VARCHAR(50) NOT NULL,
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

CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_difficulty ON cases(difficulty);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_projects_case ON projects(case_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
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

