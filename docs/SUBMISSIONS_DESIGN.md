## 背景与目标

目前已经实现了 3 类前台表单页面：

- `Start Project`：`/cases/[id]/start`（问题案例启动项目）
- `Apply Internship`：`/internships/[id]/apply`（实习申请）
- `Apply Program`：`/programs/[id]/apply`（项目/夏校申请）

这些表单：

- 现在只在前端打印 payload，没有落库。
- 字段结构各不相同，但本质都是「用户对某个资源（case / opportunity / program）的提交」。
- 未来需要统一管理提交记录，用于：
  - 用户查看自己的所有提交（“My Projects / My Applications”）。
  - 组织方按 case / opportunity / program 查看对应的所有提交。
  - 管理员做跨表单的统计分析（数量、转化、进度等）。
  - 个别表单需要“多阶段进度”和“状态机”（如项目分阶段）。
  - 表单字段未来会调整，希望尽量少动 schema 和后端代码。

目标：

1. **设计一个统一的数据库模型**，支撑多种表单类型的提交。
2. **给出 API & hooks & 页面设计**，覆盖当前和未来的主要使用场景。
3. **保留字段扩展能力**（新增字段、阶段进度等），避免频繁改 schema。

---

## 核心需求梳理（补充 & 明确）

### 1. 用户视角：我的项目 / 我的申请

- 用户能够在一个统一的入口（例如 `/me/projects`）看到：
  - 我启动过的所有 Case 项目（Start Project 表单）。
  - 我申请过的所有 Internships / Programs（Apply Internship / Program 表单）。
- 每条记录需要展示的核心信息：
  - 提交类型：`case_project` / `internship_application` / `program_application`。
  - 关联对象摘要：标题（Case / Internship / Program 的 title）、组织名、类型。
  - 提交时间。
  - 当前状态（例如：`submitted` / `under_review` / `accepted` / `rejected` / `in_progress` / `completed`）。
  - 简单的进度条（若该类型有阶段设计）。
- 用户可以点击某条记录查看「详情页 / 详情弹窗」，看到自己当时填写的表单内容。
- 短期内不需要编辑/撤回逻辑（可以预留，但不是刚需）。

### 2. 组织 / 管理员视角：按资源查看提交

- 在组织端 dashboard 中：
  - `Cases` 列表：点击某个 Case，可以查看「该 Case 下的所有提交」（所有学生启动的项目）。
  - `Opportunities` 列表（internship / program）：点击某个机会项，可以查看「该机会下的所有申请」。
- 列表页需要的能力：
  - 按提交类型、状态、时间等过滤。
  - 按 `resource_id`（case id / opportunity id / program id）查下属所有提交。
  - 看到申请人基本信息（姓名、邮箱、学校等）。
  - 点击一条提交打开详情（完整表单数据）。

### 3. 统计 & Dashboard 视角

- 在组织 Dashboard（例如 `organization/page.tsx`）中，希望显示和扩展如下统计：
  - Case 相关：
    - 某时间段内的 `Start Project` 次数。
    - 每个 Case 的项目启动数 / 完成数。
  - Internship / Program 相关：
    - 每个机会的申请数量（已在 `applicants_count`，但可以从 submissions 反推）。
    - 全局申请数趋势（按日/周聚合）。
  - 用户维度：
    - 单个学生的累计项目数 / 申请数。
- 需要方便在 SQL / Supabase / BI 工具中做聚合查询，避免复杂 JSON 解析。

### 4. 状态和多阶段进度

- 某些表单类型（尤其是 `case_project`）有多个阶段：
  - 例如：`draft` → `in_progress` → `submitted` → `reviewed` → `completed`。
- 某些表单类型只需要简单状态（例如申请：`submitted` / `accepted` / `rejected`）。
- 同一条 submission 需要：
  - 记录当前状态。
  - 记录状态变更的时间戳（至少部分关键状态，如 `submitted_at` / `completed_at`）。
  - 可选的「阶段进度」结构，支持未来追加字段而不改 schema。

### 5. 表单字段灵活扩展

- 不同表单类型字段差异较大：
  - Start Project：`team_setup`、`goal` 等。
  - Internship Apply：`full_name`、`email`、`university_major`、`portfolio_url`、`why` 等。
  - Program Apply：`full_name`、`email`、`university_year`、`statement` 等。
- 后续可能新增：
  - 推荐人信息、附件链接、打分、导师反馈等。
- 需求：
  - 希望可以在 **尽量不改表结构** 的情况下添加字段。
  - 同时保留一定的「半结构化」能力，便于统计（比如某些关键字段也可以冗余在列里）。

---

## 数据库设计方案

### 1. 新增统一表：`submissions`

**目标**：用一张表承载所有「用户对资源的提交」记录，统一管理和查询。

建议结构（Postgres / Supabase）：

```sql
create table submissions (
  id uuid primary key default gen_random_uuid(),

  -- 归属
  user_id uuid not null references auth.users(id),   -- 提交者（student / user）
  owner_id uuid not null references auth.users(id),  -- 资源创建者 / 拥有者（org admin），用于查询“我名下资源的提交”
  resource_type text not null check (resource_type in (
    'case_project',
    'internship_application',
    'program_application'
  )),
  resource_id text not null,                         -- 对应 case.id / opportunity.id / program.id

  -- 统一状态机（跨类型）
  status text not null default 'submitted' check (status in (
    'draft',
    'submitted',
    'under_review',
    'in_progress',
    'accepted',
    'rejected',
    'completed',
    'cancelled'
  )),

  -- 关键冗余字段（便于列表和统计）
  title text,                                        -- 资源标题快照（冗余）
  organization_name text,                            -- 组织名称快照（冗余）
  submitter_name text,                               -- full name
  submitter_email text,

  -- 类型特定的结构化字段（可选，选取统计最常用的）
  team_setup text,                                   -- case_project 专用 (solo/pair/team)
  university text,                                   -- internships/programs
  portfolio_url text,                                -- internships

  -- 通用的 JSON 字段，存储完整原始表单数据（灵活扩展）
  payload jsonb not null,                            -- 原始表单：所有字段

  -- 进度 & 时间
  submitted_at timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz,

  -- 额外元数据（可选）
  meta jsonb                                        -- 未来扩展：评分、标签、审核记录等
);

create index idx_submissions_user_id on submissions(user_id);
create index idx_submissions_owner_id on submissions(owner_id);
create index idx_submissions_resource on submissions(resource_type, resource_id);
create index idx_submissions_status on submissions(status);
create index idx_submissions_submitted_at on submissions(submitted_at);
```

**设计要点：**

- **resource_type + resource_id**：让同一张表下的 case / internship / program 提交都能区分出来。
- **owner_id**：
  - 指向资源的创建者 / 拥有者（例如 organization 用户）。
  - 在创建 submission 时，从关联资源（case / opportunity / program）读取其 `user_id` / `owner_id` 写入。
  - 这样组织方可以通过 `owner_id = current_user.id` 快速查询“我名下资源收到的所有提交”，无需对资源表再做 join。
- **payload JSONB**：
  - 每个表单的所有字段（包括必填 / 选填）都放进 `payload`，比如：
    - `case_project`：`{ teamSetup, goal }`
    - `internship_application`：`{ fullName, email, universityMajor, portfolioUrl, why }`
    - `program_application`：`{ fullName, email, universityYear, statement }`
  - 后续新增字段只改前端 & 插入 JSON，不需要改 schema。
- **关键字段冗余**：
  - 为了列表和统计方便，从 payload 中挑一部分字段冗余在列里，如：
    - `submitter_name`、`submitter_email`（方便在列表上直接展示 / 排序）。
    - `team_setup` / `university` / `portfolio_url` 等（可选）。
  - 这些字段主要作为索引和快速展示，源数据仍以 `payload` 为准。
- **与资源表的计数同步**：
  - `Case` / `Opportunity` 等类型在类型定义中已经有诸如：
    - `Case.submissions_count`
    - `Opportunity.applicants_count`
  - 在创建新的 submission 时，后端应同步对对应资源记录做原子更新：
    - `case_project`：`cases.submissions_count = submissions_count + 1`
    - `internship_application` / `program_application`：`opportunities.applicants_count = applicants_count + 1`
  - 建议在 `/api/submissions` 的服务端逻辑中完成这一更新（与插入 `submissions` 同一事务），避免前端直接操作这些计数字段。

> 可选扩展：如果后续统计需求更重，可以增加一张 `submission_events` 表，用于记录状态变迁日志（类似审计日志）。

---

## API 设计（概览）

> 本节只给结构，不写具体实现代码。

统一以 REST 风格设计一组 submissions 相关路由，区分：

- **普通用户 API**：`/api/submissions/...`
- **管理者 / 组织端 API**：`/api/admin/submissions/...`

通过目录结构和路由前缀实现权限与用途的隔离。

### 1. 基础路由

- `POST /api/submissions`
  - 用于创建一条 submission（3 个表单都会用这一个）。
  - Request body 示例（case_project）：
    ```json
    {
      "resourceType": "case_project",
      "resourceId": "case-uuid",
      "status": "submitted",
      "submitterName": "Alice",
      "submitterEmail": "alice@example.com",
      "teamSetup": "solo",
      "payload": {
        "teamSetup": "solo",
        "goal": "Learn how to structure an AI project"
      }
    }
    ```
  - Server 端：
    - 从当前 session 识别 **提交用户** `user_id`。
    - 从 `resource_type + resource_id` 对应的资源表中查出 **owner_id**（例如 case/opportunity 的 `user_id`）。
    - 写入 `submissions` 表。

- `GET /api/submissions?scope=my`
  - 返回当前用户的所有 submissions（支持分页、按类型筛选）。

- `GET /api/admin/submissions?resourceType=case_project&resourceId=xxx`
  - 管理 / 组织端使用的接口。
  - 只返回当前登录 owner 能访问到的资源（基于 `owner_id = current_user.id` 过滤）。
  - 若当前用户为 `super_admin` 角色（例如通过 Supabase `user.role` 或 RLS 中的 `is_super_admin()` 判定），则不强制 `owner_id` 过滤，可以查看所有资源的提交。
  - 返回字段中需要包含提交用户的 `submitter_name` 和 `submitter_email`：
    - 优先使用 `submissions.submitter_name / submitter_email` 冗余字段。
    - 若为空，可以 join `auth.users` 表补全（例如通过 `user_id` → `raw_user_meta_data` / `email`）。

- `GET /api/admin/submissions/stats?...`
  - 返回聚合统计数据（例如：按资源、按时间、按状态分布）。
  - 默认以 `owner_id = current_user.id` 为过滤条件，确保组织只能看到自己名下资源的统计。
  - 若当前用户为 `super_admin`，则可以跨 owner 统计（例如平台级总体数据），不加 `owner_id` 限制，或允许通过查询参数指定 owner 过滤范围。
  - 具体 shape 可后续细化；组织 Dashboard 可调用这个接口来渲染统计卡片。

- `PATCH /api/submissions/[id]`
  - 更新 `status` / `meta` / 进度等（主要用于管理端）。

### 2. Hooks 设计

新增 `useSubmissions`（示意）：

```ts
// 只示意接口，不写实现
export type SubmissionResourceType =
  | 'case_project'
  | 'internship_application'
  | 'program_application';

interface Submission {
  id: string;
  user_id: string;
  owner_id: string;
  resource_type: SubmissionResourceType;
  resource_id: string;
  status: string;
  title?: string;
  organization_name?: string;
  submitter_name?: string;
  submitter_email?: string;
  payload: any;
  submitted_at: string;
  completed_at?: string;
}

export function useSubmissions() {
  return {
    // 用户视角
    mySubmissions: Submission[];
    fetchMySubmissions: (filters?: { type?: SubmissionResourceType }) => Promise<void>;

    // 资源视角
    listByResource: (
      resourceType: SubmissionResourceType,
      resourceId: string
    ) => Promise<Submission[]>;

    // 创建
    createSubmission: (input: {
      resourceType: SubmissionResourceType;
      resourceId: string;
      status?: string;
      submitterName?: string;
      submitterEmail?: string;
      payload: any;
    }) => Promise<Submission>;

    // 状态更新 / 管理操作
    updateSubmissionStatus: (id: string, status: string) => Promise<void>;

    // 统计
    fetchStats: (filters?: { organizationId?: string }) => Promise<any>;
  };
}
```

现有的 3 个表单页面提交时，只需要调用 `createSubmission`，并把 payload 放进去即可。

---

## 页面设计

### 一、用户端：`/me/projects`（我的项目 / 我的申请）

**目标**：展示当前登录用户所有 `submissions`。

**数据来源**：

- 调用 `useSubmissions().fetchMySubmissions()`。
- 列表项信息：
  - Submission 类型（带图标）：
    - `case_project` → “📦 Project”
    - `internship_application` → “💼 Internship App”
    - `program_application` → “🎓 Program App”
  - 资源标题：`title` 或从关联资源 fallback。
  - 组织名称：`organization_name`。
  - 状态：`status`（颜色标签）。
  - 提交时间：`submitted_at`。

**交互**：

- 顶部 filter：
  - 按类型筛选（全部 / 项目 / 实习 / 项目）。
  - 按状态筛选（全部 / submitted / accepted / rejected / in_progress / completed）。
- 列表中点击某条：
  - 打开 `SubmissionDetailModal`（可新建通用组件），展示 `payload` 里的详细字段。
  - 或者跳转到 `/me/projects/[submissionId]` 详情页。

### 二、组织端：按资源查看提交

#### 1. Cases 管理页扩展

在 `OrgCasesPage`（`/organization/cases`）：

- 原有 `CaseList` 每条 Case 的 `View` 按钮或新加「Submissions」按钮，点击后：
  - 打开一个新一页 显示该 Case 下的 submissions 列表：
    - 调用 `useSubmissions().listByResource('case_project', case.id)`.
    - 展示：提交者、状态、提交时间、team_setup 等关键字段。
  - 支持点击一条 submission 查看详情（同样用 `SubmissionDetailModal`）。

#### 2. Opportunities 管理页扩展

在 `OrgOpportunitiesPage`（`/organization/opportunities`）：

- 对 `OpportunityList` 中每个机会（internship / program）：
  - 按 `type` 决定 resource_type：
    - `internship` → `internship_application`
    - `program` → `program_application`
  - 点击「Submissions」按钮，拉取相应 submissions。
  - 列表字段：姓名、邮箱、学校、状态、提交时间等，从 `submissions` 冗余列＋payload 中拼出。

### 三、组织 Dashboard：统计卡片扩展

在 `OrgDashboard`（`/organization`）：

- 通过 `GET /api/submissions/stats` + 组织 ID，获取聚合信息：
  - 总项目数（case_project 数）。
  - 总实习申请数 / program 申请数。
  - 最近 7/30 天的提交趋势。
  - 每个 Case/Opportunity 的提交数量 Top N（可用于展示热门项目）。
- 使用当前的统计卡 layout（参考 `organization/page.tsx:23-37`），但从新的统计接口填充数据。

---

## 多阶段状态与后续扩展建议

### 1. 状态约定

统一在 `submissions.status` 中管理状态，建议：

- **项目类（case_project）**：
  - `draft` → `in_progress` → `submitted` → `reviewed` → `completed`。
- **申请类（internship / program）**：
  - `submitted` → `under_review` → `accepted` / `rejected`。

可以在 `payload` 或 `meta` 中加额外的细分进度，例如：

```json
{
  "progress": {
    "currentStep": "mentor_review",
    "steps": ["draft", "submitted", "mentor_review", "completed"]
  }
}
```

### 2. 字段扩展策略

- 新增字段优先加在 `payload` 内，必要时冗余到列：
  - 例如，若未来需要按学校聚合统计申请，可以：
    - 在 JSON 中加 `university`.
    - 同时在表上新增列 `university text` 并在创建/更新时写入，方便加索引。
- 若部分 submission 类型变得非常复杂（例如项目过程管理），可以考虑：
  - 保持 `submissions` 作为“主记录”，另开专表管理「阶段任务」、「里程碑」、「评审记录」，与 submissions 通过 `submission_id` 关联。

---

## 实施步骤建议（按阶段）

### 阶段 1：数据层搭建（必须）

1. 在 Supabase / Postgres 中创建 `submissions` 表及索引。
2. 不修改现有 case / opportunity / program 表，仅新增。

### 阶段 2：API 层（基础）

1. 新建 `/api/submissions` 路由，支持：
   - `POST /api/submissions` 创建提交。
   - `GET /api/submissions?scope=my` 获取当前用户的提交。
   - `GET /api/submissions?resourceType=...&resourceId=...` 按资源获取提交。
2. 简单实现状态更新 `PATCH /api/submissions/[id]`（可暂时不暴露 UI）。

### 阶段 3：前端集成（表单落库）

1. 新建 `useSubmissions` hook，封装调用 `/api/submissions` 的逻辑。
2. 修改以下表单页面的提交逻辑：
   - `/cases/[id]/start`
   - `/internships/[id]/apply`
   - `/programs/[id]/apply`
3. 在 submit handler 中：
   - 构造统一 payload（按 resource_type 分别映射）。
   - 调用 `createSubmission`，成功后仍可保留 “打印到 console” 作为 debug。
   - 由后端在创建 submission 时自动：
     - 写入 `submissions` 表。
     - 更新对应资源的计数：
       - `cases.submissions_count += 1`（case_project）
       - `opportunities.applicants_count += 1`（internship/program application）

### 阶段 4：用户端 “My Projects / Applications”

1. 创建新页面 `/me/projects`。
2. 使用 `useSubmissions().fetchMySubmissions()` 获取数据。
3. 按类型分组显示 + View 详情（可重用一个 `SubmissionDetailModal`）。

### 阶段 5：组织端按资源查看提交

1. 在 `OrgCasesPage` 中，为 `CaseList` 添加「Submissions」入口：
   - 加一个按钮 / 链接，打开 submissions 列表。
2. 在 `OrgOpportunitiesPage` 中，为 `OpportunityList` 添加「Submissions」入口：
   - 根据 type 映射 resource_type。
3. 给 org 端增加 `SubmissionsTable` 或重用现有 table 组件，展示提交人信息和状态。

### 阶段 6：统计卡片 & Dashboard 扩展（可选）

1. 新增 `/api/submissions/stats` 接口，返回组织维度统计数据。
2. 在 `/organization` 页面引入 stats hook，替换 / 扩展现有 4 个卡片的数据来源。
3. 可按需增加图表（按日/周提交趋势）。

---

## 总结

通过引入统一的 `submissions` 表 + 通用 `payload` 字段：

- 用一套模型承载了 Case 项目启动、Internship / Program 申请等多种提交。
- 前端表单可以灵活增减字段，而不必频繁修改数据库结构。
- 组织方和管理员可以通过统一接口查看、筛选和统计所有提交数据。
- 后续如需增加新的表单类型（例如 Mentorship 申请），只需：
  - 定义新的 `resource_type` 值。
  - 在提交时构造对应的 `payload` 和关键冗余字段。
  - 使用同一套 hooks & API & 页面组件进行展示和管理。

