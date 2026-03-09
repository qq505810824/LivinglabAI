# CaseVault 平台技术架构与开发实施文档

## 📋 文档信息

**项目名称**: CaseVault - 真实世界 AI 项目对接平台  
**技术栈**: Next.js 15 + Supabase + TypeScript  
**文档版本**: v2.0  
**创建日期**: 2026-03-09  
**文档目的**: 提供完整的技术架构设计、数据库 schema、API 规范和开发指南

---

## 一、系统架构概览

### 1.1 技术选型

```
┌─────────────────────────────────────────────┐
│           Frontend Layer                    │
│  Next.js 15 (App Router) + TypeScript       │
│  Tailwind CSS + Shadcn/ui Components        │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│           API Layer                         │
│  Next.js API Routes (Route Handlers)        │
│  Business Logic in Hooks & Server Actions   │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Backend as a Service                │
│  Supabase (PostgreSQL + Auth + Storage)     │
│  Row Level Security (RLS)                   │
└─────────────────────────────────────────────┘
```

### 1.2 项目目录结构

```
src/
├── app/
│   ├── (auth)/                    # 认证相关页面
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (main)/                    # 主应用门户 (学生端)
│   │   ├── cases/                 # 问题银行
│   │   │   ├── page.tsx          # 案例列表页
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 案例详情页
│   │   │
│   │   ├── internships/           # 实习机会
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── programs/              # 暑期项目
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── projects/              # 我的项目
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── (org)/                     # 机构管理后台 (独立布局)
│   │   ├── dashboard/             # 企业仪表板
│   │   │   ├── page.tsx
│   │   │   ├── cases/            # 案例管理
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── opportunities/    # 机会管理
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── submissions/      # 作品审核
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── api/                       # API 路由
│   │   ├── cases/
│   │   │   ├── route.ts          # GET /api/cases, POST /api/cases
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET/PUT/DELETE /api/cases/:id
│   │   │
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   │
│   │   ├── opportunities/
│   │   │   └── ...
│   │   │
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                        # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   └── Modal.tsx
│   │
│   ├── cases/                     # 案例相关组件
│   │   ├── CaseCard.tsx
│   │   ├── CaseList.tsx
│   │   ├── CaseFilters.tsx
│   │   ├── CaseDetail.tsx
│   │   └── CaseForm/
│   │       ├── Step1Company.tsx
│   │       ├── Step2Problem.tsx
│   │       ├── Step3Deliverable.tsx
│   │       └── index.tsx
│   │
│   ├── projects/                  # 项目管理组件
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectProgress.tsx
│   │   └── SubmissionForm.tsx
│   │
│   ├── dashboard/                 # 仪表板组件
│   │   ├── StatCard.tsx
│   │   ├── DashboardOverview.tsx
│   │   └── SubmissionsTable.tsx
│   │
│   └── common/                    # 通用组件
│       ├── Header.tsx
│       ├── Footer.tsx
│   │   └── Loading.tsx
│   │
│   └── providers/                 # 全局 Provider
│       ├── AuthProvider.tsx
│       └── QueryProvider.tsx
│
├── hooks/                         # 自定义 Hooks (业务逻辑层)
│   ├── useCases.ts               # 案例数据获取与操作
│   ├── useProjects.ts            # 项目管理
│   ├── useOpportunities.ts       # 机会管理
│   ├── usePrograms.ts            # 暑期项目管理
│   ├── useAuth.ts                # 认证状态
│   ├── useSubmissions.ts         # 作品审核
│   └── useDashboard.ts           # 仪表板数据
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase 客户端配置
│   │   ├── server.ts             # SSR 服务端配置
│   │   └── middleware.ts         # 中间件配置
│   │
│   ├── validators/                # Zod 验证 schemas
│   │   ├── case.ts
│   │   ├── project.ts
│   │   └── opportunity.ts
│   │
│   └── utils.ts
│
├── types/
│   ├── database.ts               # Supabase 类型定义
│   ├── api.ts                    # API 响应类型
│   ├── case.ts                   # 案例相关类型
│   ├── project.ts                # 项目相关类型
│   ├── opportunity.ts            # 机会相关类型
│   ├── program.ts                # 暑期项目相关类型
│   └── index.ts
│
└── utils/
    ├── formatters.ts
    ├── constants.ts
    └── theme.ts                   # 主题配色配置
```

---

## 二、数据库设计 (Supabase Schema)

### 2.1 核心数据表

#### users 表
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role_enum DEFAULT 'student',
  university VARCHAR(255),
  major VARCHAR(255),
  bio TEXT,
  skills TEXT[],
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 枚举类型
CREATE TYPE user_role_enum AS ENUM ('student', 'organization');
```

#### organizations 表
```sql
-- 机构表
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50), -- '1-10', '11-50', '51-200', '200+'
  website VARCHAR(255),
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  location VARCHAR(255),
  founded_year INTEGER,
  social_links JSONB, -- {linkedin, twitter, facebook}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加外键关联
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

#### cases 表
```sql
-- 案例表
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
  skills TEXT[],
  submissions_count INTEGER DEFAULT 0,
  status case_status_enum DEFAULT 'active',
  ai_generated_brief TEXT,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 枚举类型
CREATE TYPE case_category_enum AS ENUM ('solved', 'open', 'process', 'policy', 'content');
CREATE TYPE difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE case_status_enum AS ENUM ('draft', 'active', 'closed');

-- 索引优化
CREATE INDEX idx_cases_organization ON cases(organization_id);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_difficulty ON cases(difficulty);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
```

#### projects 表
```sql
-- 项目表 (学生开始的案例)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  user_id UUID NOT NULL REFERENCES users(id),
  team_type team_type_enum NOT NULL,
  team_member_ids UUID[],
  goal TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status project_status_enum DEFAULT 'not_started',
  start_date DATE DEFAULT CURRENT_DATE,
  submission JSONB, -- {summary, key_findings, demo_url, repository_url, share_with_company, submitted_at}
  feedback JSONB, -- {rating, comment, reviewed_by, reviewed_at}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(case_id, user_id) -- 一个学生对同一案例只能开始一次
);

-- 枚举类型
CREATE TYPE team_type_enum AS ENUM ('solo', 'pair', 'team');
CREATE TYPE project_status_enum AS ENUM ('not_started', 'in_progress', 'submitted', 'completed');

-- 索引
CREATE INDEX idx_projects_case ON projects(case_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

#### opportunities 表
```sql
-- 机会表 (实习/项目)
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
  requirements TEXT[],
  perks TEXT[],
  skills_required TEXT[],
  applicants_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE opportunity_type_enum AS ENUM ('internship', 'program');

-- 索引
CREATE INDEX idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
```

#### applications 表
```sql
-- 申请表
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
  related_project_ids UUID[],
  resume_url TEXT,
  status application_status_enum DEFAULT 'pending',
  review_notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE application_status_enum AS ENUM ('pending', 'under_review', 'accepted', 'rejected');

-- 索引
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 唯一约束 (同一用户对同一机会只能申请一次)
CREATE UNIQUE INDEX idx_unique_application ON applications(opportunity_id, user_id);
```

### 2.2 Row Level Security (RLS) 策略

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users 策略
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Cases 策略
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

-- Projects 策略
CREATE POLICY "Students can view their own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Students can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update their own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.uid());

-- 企业可以查看其发布案例的所有项目
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
```

---

## 三、API 设计规范

### 3.1 RESTful API 规范

**基础路径**: `/api/v1`

**统一响应格式**:
```typescript
// 成功响应
{
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// 错误响应
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### 3.2 核心 API 端点

#### 案例模块

```typescript
// app/api/v1/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const caseQuerySchema = z.object({
  category: z.enum(['all', 'solved', 'open', 'process', 'policy', 'content']).optional(),
  difficulty: z.enum(['all', 'beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
  skills: z.string().optional(), // comma-separated
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // 验证查询参数
    const queryParams = caseQuerySchema.parse(Object.fromEntries(searchParams));
    
    // 构建查询条件
    let query = supabase
      .from('cases')
      .select(`
        *,
        organization:organizations (
          id,
          name,
          industry,
          logo_url
        )
      `, { count: 'exact' })
      .eq('status', 'active');
    
    // 应用筛选
    if (queryParams.category && queryParams.category !== 'all') {
      query = query.eq('category', queryParams.category);
    }
    if (queryParams.difficulty && queryParams.difficulty !== 'all') {
      query = query.eq('difficulty', queryParams.difficulty);
    }
    if (queryParams.search) {
      query = query.or(`
        title.ilike.%${queryParams.search}%,
        scenario.ilike.%${queryParams.search}%
      `);
    }
    
    // 分页
    const from = (queryParams.page - 1) * queryParams.limit;
    const to = from + queryParams.limit - 1;
    query = query.range(from, to);
    
    const { data: cases, error, count } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: cases,
      meta: {
        total: count || 0,
        page: queryParams.page,
        limit: queryParams.limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch cases:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'FETCH_ERROR',
          message: 'Failed to fetch cases',
        } 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 检查认证
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    
    // 获取用户所属组织
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();
    
    if (!userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not an organization' } },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // 验证请求体
    const caseSchema = z.object({
      title: z.string().min(10).max(150),
      department: z.string(),
      category: z.enum(['solved', 'open', 'process', 'policy', 'content']),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      scenario: z.string().min(500).max(2000),
      problem: z.string().min(200).max(1000),
      existing_solution: z.string().optional(),
      deliverable: z.string(),
      public_data: z.string().optional(),
      estimated_hours: z.number().min(1).max(100),
      skills: z.array(z.string()),
    });
    
    const validatedData = caseSchema.parse(body);
    
    // 创建案例
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        ...validatedData,
        organization_id: userData.organization_id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // TODO: 触发 AI 简报生成
    
    return NextResponse.json({
      success: true,
      data: newCase,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          } 
        },
        { status: 400 }
      );
    }
    
    console.error('Failed to create case:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

#### 项目模块

```typescript
// app/api/v1/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    
    const status = request.nextUrl.searchParams.get('status');
    
    let query = supabase
      .from('projects')
      .select(`
        *,
        case:cases (
          id,
          title,
          organization:organizations (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', user.id);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: projects, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch projects' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { caseId, teamType, goal } = body;
    
    // 检查是否已开始过
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: { code: 'DUPLICATE_PROJECT', message: 'You already started this case' } 
        },
        { status: 409 }
      );
    }
    
    // 创建项目
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        case_id: caseId,
        user_id: user.id,
        team_type: teamType,
        goal,
        status: 'in_progress',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // 更新案例提交数
    await supabase
      .from('cases')
      .update({ submissions_count: supabase.raw('submissions_count + 1') })
      .eq('id', caseId);
    
    return NextResponse.json({
      success: true,
      data: newProject,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}
```

---

## 四、Hooks 设计 (业务逻辑层)

### 4.1 useCases Hook

```typescript
// hooks/useCases.ts
'use client';

import { useState, useCallback } from 'react';
import { Case, CaseFilters, CreateCaseDTO } from '@/types';

interface UseCasesReturn {
  cases: Case[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  filters: CaseFilters;
  setFilters: (filters: CaseFilters) => void;
  refreshCases: () => Promise<void>;
  loadMore: () => Promise<void>;
  getCaseById: (id: string) => Promise<Case | null>;
  createCase: (data: CreateCaseDTO) => Promise<Case | null>;
}

export function useCases(): UseCasesReturn {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<CaseFilters>({
    category: 'all',
    difficulty: 'all',
    search: '',
  });

  const fetchCases = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        limit: '20',
      });
      
      const response = await fetch(`/api/v1/cases?${params}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      if (reset) {
        setCases(result.data);
      } else {
        setCases(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.data.length === 20);
      setPage(currentPage + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cases'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  const refreshCases = useCallback(async () => {
    await fetchCases(true);
  }, [fetchCases]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchCases();
    }
  }, [fetchCases, isLoading, hasMore]);

  const getCaseById = useCallback(async (id: string): Promise<Case | null> => {
    try {
      const response = await fetch(`/api/v1/cases/${id}`);
      const result = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data;
    } catch {
      return null;
    }
  }, []);

  const createCase = useCallback(async (data: CreateCaseDTO): Promise<Case | null> => {
    try {
      const response = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      // 刷新列表
      await refreshCases();
      
      return result.data;
    } catch (err) {
      console.error('Failed to create case:', err);
      return null;
    }
  }, [refreshCases]);

  return {
    cases,
    isLoading,
    error,
    hasMore,
    filters,
    setFilters,
    refreshCases,
    loadMore,
    getCaseById,
    createCase,
  };
}
```

### 4.2 useProjects Hook

```typescript
// hooks/useProjects.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Project, StartProjectDTO, SubmitProjectDTO } from '@/types';

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  startProject: (data: StartProjectDTO) => Promise<Project | null>;
  updateProgress: (projectId: string, progress: number) => Promise<boolean>;
  submitWork: (projectId: string, data: SubmitProjectDTO) => Promise<boolean>;
  getProjectById: (id: string) => Promise<Project | null>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/projects');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      setProjects(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setIsLoading(false);
    }
  };

  const startProject = async (data: StartProjectDTO): Promise<Project | null> => {
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      // 添加到本地列表
      setProjects(prev => [result.data, ...prev]);
      
      return result.data;
    } catch (err) {
      console.error('Failed to start project:', err);
      return null;
    }
  };

  const updateProgress = async (projectId: string, progress: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      // 更新本地状态
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, progress } : p
      ));
      
      return true;
    } catch (err) {
      console.error('Failed to update progress:', err);
      return false;
    }
  };

  const submitWork = async (projectId: string, data: SubmitProjectDTO): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message);
      }
      
      // 更新本地状态
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, status: 'submitted', ...result.data.submission } : p
      ));
      
      return true;
    } catch (err) {
      console.error('Failed to submit work:', err);
      return false;
    }
  };

  const getProjectById = async (id: string): Promise<Project | null> => {
    try {
      const response = await fetch(`/api/v1/projects/${id}`);
      const result = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data;
    } catch {
      return null;
    }
  };

  return {
    projects,
    isLoading,
    error,
    startProject,
    updateProgress,
    submitWork,
    getProjectById,
  };
}
```

---

## 五、组件设计与封装

### 5.1 基础 UI 组件

```typescript
// components/ui/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hoverable';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  className, 
  variant = 'default', 
  onClick,
  children,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-xl p-5 transition-all duration-200',
        variant === 'hoverable' && 'cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// components/ui/Badge.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
  {
    variants: {
      variant: {
        purple: 'bg-purple-500/15 text-purple-400',
        green: 'bg-green-500/15 text-green-400',
        yellow: 'bg-yellow-500/15 text-yellow-400',
        red: 'bg-red-500/15 text-red-400',
        blue: 'bg-blue-500/15 text-blue-400',
        pink: 'bg-pink-500/15 text-pink-400',
      },
    },
    defaultVariants: {
      variant: 'purple',
    },
  }
);

interface BadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant, 
  children,
  ...props 
}) => {
  return (
    <span 
      className={cn(badgeVariants({ variant }), className)} 
      {...props}
    >
      {children}
    </span>
  );
};
```

---

## 五、UI/UX 设计规范与主题系统

### 5.1 设计原则

1. **效率优先**: 减少点击次数，常用操作一键直达
2. **信息清晰**: 数据可视化，重要信息突出显示
3. **一致性**: 统一的设计语言和交互模式
4. **响应式**: 支持桌面、平板、手机
5. **深色主题**: 保持与原原型一致的深空蓝紫风格

### 5.2 颜色系统 (与原型保持一致)

```css
/* 主题色 - 深空蓝紫 */
:root {
  /* 背景色系 */
  --bg-primary: #0f172a;        /* 主背景 - 深蓝灰 */
  --bg-secondary: #1e293b;      /* 次要背景 - 中蓝灰 */
  --bg-tertiary: #334155;       /* 第三背景 - 浅蓝灰 */
  
  /* 主色调 - 靛蓝色 */
  --primary: #818cf8;           /* 亮靛蓝 */
  --primary-hover: #6366f1;     /* 深靛蓝 */
  --primary-light: rgba(129, 140, 248, 0.1);  /* 浅色透明 */
  
  /* 功能色 */
  --success: #34d399;           /* 成功 - 翠绿 */
  --success-bg: rgba(52, 211, 153, 0.15);
  --warning: #fbbf24;           /* 警告 - 琥珀 */
  --warning-bg: rgba(251, 191, 36, 0.15);
  --danger: #f87171;            /* 危险 - 珊瑚红 */
  --danger-bg: rgba(248, 113, 113, 0.15);
  --info: #60a5fa;              /* 信息 - 天蓝 */
  --info-bg: rgba(96, 165, 250, 0.15);
  
  /* 文字色 */
  --text-primary: #f1f5f9;      /* 主文字 - 浅灰白 */
  --text-secondary: #94a3b8;    /* 次要文字 - 中灰 */
  --text-tertiary: #64748b;     /* 提示文字 - 深灰 */
  
  /* 边框色 */
  --border: rgba(71, 85, 105, 0.3);  /* 默认边框 */
  --border-hover: rgba(129, 140, 248, 0.3);  /* 悬停边框 */
  
  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

### 5.3 Tailwind CSS 配置

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        primary: {
          DEFAULT: '#818cf8',
          hover: '#6366f1',
          light: 'rgba(129, 140, 248, 0.1)',
        },
        success: {
          DEFAULT: '#34d399',
          bg: 'rgba(52, 211, 153, 0.15)',
        },
        warning: {
          DEFAULT: '#fbbf24',
          bg: 'rgba(251, 191, 36, 0.15)',
        },
        danger: {
          DEFAULT: '#f87171',
          bg: 'rgba(248, 113, 113, 0.15)',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          tertiary: '#64748b',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
```

### 5.4 页面布局规范

#### 认证页面布局 ((auth))

```typescript
// app/(auth)/layout.tsx
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary relative overflow-hidden">
      {/* 背景装饰光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-success opacity-10 rounded-full blur-3xl" />
      </div>
      
      {/* 内容区域 */}
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}
```

#### 学生端布局 ((main))

```typescript
// app/(main)/layout.tsx
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary">
      <Header variant="student" />
      <main className="pt-[56px] pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

#### 机构端布局 ((org)) - 独立于 (main)

```typescript
// app/(org)/layout.tsx
import React from 'react';
import { OrgHeader } from '@/components/layout/OrgHeader';

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary">
      <OrgHeader variant="organization" />
      <main className="pt-[56px]">
        {children}
      </main>
      {/* 机构端无 Footer，专注于工作台 */}
    </div>
  );
}
```

**布局区别说明**:
| 布局 | 导航栏 | Footer | 使用场景 |
|------|--------|--------|----------|
| `(auth)` | 无 | 无 | 登录/注册页 |
| `(main)` | Header (完整) | Footer | 学生端所有页面 |
| `(org)` | OrgHeader (简化) | 无 | 机构管理后台 |

### 5.5 徽章颜色映射

```typescript
// utils/theme.ts

/**
 * 徽章颜色映射表 (与原型保持一致)
 */
export const badgeColors = {
  // 案例类别
  category: {
    solved: 'purple',    // ✅ 已解决
    open: 'blue',        // 💬 开放中
    process: 'yellow',   // ⚙️ 流程优化
    policy: 'pink',      // 📜 政策制定
    content: 'green',    // 📣 内容创作
  },
  // 难度等级
  difficulty: {
    beginner: 'green',       // 🟢 入门
    intermediate: 'yellow',  // 🟡 中级
    advanced: 'red',         // 🔴 高级
  },
} as const;

// 组件中使用示例
const colorClasses = {
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  green: 'bg-green-500/15 text-green-400 border border-green-500/20',
  yellow: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  red: 'bg-red-500/15 text-red-400 border border-red-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  pink: 'bg-pink-500/15 text-pink-400 border border-pink-500/20',
};
```

---

## 六、统一 Loading 加载状态组件

```typescript
// components/cases/CaseCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Case } from '@/types';
import { useRouter } from 'next/navigation';

interface CaseCardProps {
  caseItem: Case;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem }) => {
  const router = useRouter();
  
  const difficultyColors = {
    beginner: 'green',
    intermediate: 'yellow',
    advanced: 'red',
  } as const;
  
  const categoryColors = {
    solved: 'purple',
    open: 'blue',
    process: 'yellow',
    policy: 'pink',
    content: 'green',
  } as const;

  return (
    <Card 
      variant="hoverable"
      onClick={() => router.push(`/cases/${caseItem.id}`)}
    >
      {/* 公司标识 */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: caseItem.organization.logo_color }}
        >
          {caseItem.organization.logo_initials}
        </div>
        <span className="text-xs text-slate-400">
          {caseItem.organization.name} · {caseItem.department}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-base font-bold mb-2 line-clamp-2">
        {caseItem.title}
      </h3>

      {/* 元数据标签 */}
      <div className="flex gap-2 flex-wrap mb-3">
        <Badge variant={categoryColors[caseItem.category]}>
          {caseItem.category}
        </Badge>
        <Badge variant={difficultyColors[caseItem.difficulty]}>
          {caseItem.difficulty}
        </Badge>
        <Badge variant="purple">~{caseItem.estimated_hours}h</Badge>
      </div>

      {/* 场景描述 */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-3">
        {caseItem.scenario}
      </p>

      {/* 技能标签 */}
      <div className="flex gap-1 flex-wrap mb-4">
        {caseItem.skills.slice(0, 3).map(skill => (
          <span 
            key={skill}
            className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">
          👥 {caseItem.submissions_count} students working
        </span>
        <span className="text-xs text-indigo-400 font-medium">
          → View Details
        </span>
      </div>
    </Card>
  );
};
```

```typescript
// components/dashboard/StatCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  onClick,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <Card 
      variant="hoverable"
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend.direction === 'up' 
              ? 'text-green-600 bg-green-50' 
              : trend.direction === 'down'
              ? 'text-red-600 bg-red-50'
              : 'text-slate-600 bg-slate-50'
          )}>
            {trend.direction === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend.direction === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
            {trend.label}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
      </div>
    </Card>
  );
};
```

---

## 六、页面组件示例

### 6.1 案例列表页

```typescript
// app/(main)/cases/page.tsx
'use client';

import React, { useState } from 'react';
import { useCases } from '@/hooks/useCases';
import { CaseCard } from '@/components/cases/CaseCard';
import { CaseFilters } from '@/components/cases/CaseFilters';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';

export default function CasesPage() {
  const { 
    cases, 
    isLoading, 
    filters, 
    setFilters, 
    loadMore,
    hasMore 
  } = useCases();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Problem Bank</h1>
        <p className="text-slate-400">
          Real business cases from real companies. Pick one and start building.
        </p>
      </div>

      {/* 筛选器 */}
      <CaseFilters 
        filters={filters}
        onChange={setFilters}
      />

      {/* 结果统计 */}
      <p className="text-sm text-slate-500 mb-6">
        {cases.length} case{cases.length !== 1 ? 's' : ''} found
      </p>

      {/* 案例列表 */}
      {isLoading && cases.length === 0 ? (
        <Loading />
      ) : cases.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No cases match your filters"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 6.2 企业仪表板页

```typescript
// app/(main)/dashboard/page.tsx
'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { SubmissionsTable } from '@/components/dashboard/SubmissionsTable';
import { FileText, Users, Briefcase, Star } from 'lucide-react';
import { Loading } from '@/components/common/Loading';

export default function DashboardPage() {
  const { stats, recentSubmissions, isLoading } = useDashboard();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Organization Dashboard</h1>
        <p className="text-slate-400">
          Manage your contributed cases and posted opportunities.
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Cases"
          value={stats.activeCases}
          icon={FileText}
          color="blue"
          trend={{ direction: 'up', label: '+2 this week' }}
        />
        <StatCard
          title="Student Submissions"
          value={stats.totalSubmissions}
          icon={Users}
          color="green"
          trend={{ direction: 'up', label: '+5 new today' }}
        />
        <StatCard
          title="Opportunities Posted"
          value={stats.opportunitiesPosted}
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating}/5.0`}
          icon={Star}
          color="orange"
        />
      </div>

      {/* 最近提交 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📋 Recent Submissions</h2>
        <SubmissionsTable submissions={recentSubmissions} />
      </div>

      {/* 快捷操作 */}
      <div className="flex gap-4 flex-wrap">
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
          📝 Submit New Case
        </button>
        <button className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 font-medium rounded-lg transition-colors">
          📌 Post Opportunity
        </button>
      </div>
    </div>
  );
}
```

---

## 七、数据库初始化 SQL 脚本

创建文件：`supabase/migrations/001_initial_schema.sql`

```sql
-- ====================================
-- CaseVault Database Schema
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

-- ====================================
-- ROW LEVEL SECURITY
-- ====================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

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

-- ====================================
-- SEED DATA (Optional)
-- ====================================

-- 这里可以添加测试数据，参考 index.html 中的 mock 数据
```

---

## 八、环境配置与部署

### 8.1 环境变量

创建 `.env.local` 文件:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth (如果使用)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# AI Services (可选)
OPENAI_API_KEY=your_openai_api_key

# Email Service (可选)
RESEND_API_KEY=your_resend_api_key

# File Storage (可选，如使用 S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=your_bucket_name
```

### 8.2 package.json 依赖

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.4",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "@tanstack/react-query": "^5.17.0",
    "next-auth": "^4.24.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 九、开发路线图

### Phase 1: 基础架构 (2 周)
- [ ] 初始化 Next.js 项目
- [ ] 配置 Supabase 客户端
- [ ] 执行数据库迁移脚本
- [ ] 实现用户认证系统
- [ ] 搭建基础 UI 组件库

### Phase 2: 核心功能 (3 周)
- [ ] 案例 CRUD API
- [ ] 案例列表页与筛选
- [ ] 案例详情页
- [ ] 项目管理功能
- [ ] 作品提交流程

### Phase 3: 企业功能 (2 周)
- [ ] 企业仪表板
- [ ] 多步骤案例发布表单
- [ ] 作品审核界面
- [ ] 机会管理模块

### Phase 4: 进阶功能 (2 周)
- [ ] AI 简报生成集成
- [ ] 邮件通知系统
- [ ] 数据统计与图表
- [ ] 性能优化

---

## 十、总结

本文档提供了基于 Next.js + Supabase 的完整技术方案，包括:

✅ **清晰的项目架构**: 分层明确，职责单一  
✅ **完整的数据库设计**: 包含 RLS 安全策略  
✅ **统一的 API 规范**: RESTful 风格，类型安全  
✅ **可复用的组件系统**: UI 与业务解耦  
✅ **Hooks 业务封装**: 逻辑复用，易于测试  
✅ **开箱即用的 SQL 脚本**: 方便快速初始化  
✅ **统一的颜色主题**: 与原原型保持一致 (深空蓝紫风格)  
✅ **独立的布局系统**: `(auth)`, `(main)`, `(org)` 三分离  
✅ **完善的 Loading 状态**: LoadingButton, PageLoader, CardLoader, TableLoader  
✅ **暑期项目模块**: 完整的数据结构、API、组件实现

所有文档和代码均存放在 `docs` 和 `src` 目录下，便于后续开发和维护。

---

**文档版本**: v2.1  
**最后更新**: 2026-03-09  
**下一步**: 开始 Phase 1 开发
