# AI 会议对话系统 - 多用户会议与个人状态改造方案（v2）

> 本文是在现有 `project-specification.md` 基础上的**增量规格文档**，专门说明「同一会议号可被多用户复用，每个用户有独立状态和数据」的改造方案。  
> 若本文件与原规格不一致，以本文件为准。

---

## 一、背景与当前问题

### 1.1 当前行为（存在的问题）

1. **管理员创建会议号（Meet）**：  
   - 创建一条 `meets` 记录（包含会议号、标题、时间、状态等）。  
   - 用户通过带会议号/链接的 URL 进入会议，并按照既定流程完成 AI 语音对话。  
   - 会议流程结束时，系统会将该 `meet` 的全局 `status` 更新为 `ended`。

2. **问题 1：会议被“单用户结束”后，其他用户无法再用同一会议号**  
   - 当一个用户完成流程后，`meets.status = 'ended'`。  
   - 此时其他用户再通过同一链接/会议号进入时，只能看到“已结束”状态，无法进行对话流程。  
   - 这与业务期望不符：**会议是“模板/场景”，可以给多个用户独立使用**。

3. **问题 2：会议结束生成的数据是“全局的”，不是“按用户”**  
   - 当前对话记录、总结、Todo 等均与 `meet` 直接关联。  
   - 当多个用户使用同一会议号时，很难区分每个用户自己的对话、总结和任务。  
   - 需求是：**同一会议号可以被多个用户复用，但每个用户的对话和生成数据是独立的**。

4. **问题 3：用户缺少自己的会议/任务视图**
   - 用户看不到“自己参加过哪些会议、每个会议现在是什么状态”。  
   - 用户也缺少一个聚合视图查看“自己所有 Todo 列表及状态”。

---

## 二、新需求概述

### 2.1 会议与用户的关系

1. **会议（Meet）是唯一的、共享的模板**  
   - 一个 `meet` 代表一次会议模板或场景（带标题、描述、会议号等）。  
   - 可以被**多个用户**通过同一会议号/链接复用。

2. **每个用户加入会议时，会产生自己的“用户会议实例”**  
   - 每个用户进入同一个 `meet` 时，都有一条**独立的会话状态**，用于记录：  
     - 用户在该会议的状态：`in_progress` / `completed` / `cancelled` 等  
     - 用户自己的对话记录、总结、Todo 任务等  
   - 一个用户可以参加多个不同的会议；同一会议也可以被多个用户使用。

3. **会议结束生成的数据属于用户会议实例**  
   - 总结、Todo、录音等数据从“与 meet 绑定”调整为“与 用户-会议 实例绑定”。  
   - 业务语义：**“用户 A 在会议 X 的结果”，而不是简单的“会议 X 的全局结果”**。

### 2.2 新增用户能力

1. **用户会议列表**  
   - 用户可以查看自己加入过的会议列表（基于“用户会议实例”），包括：  
     - 会议标题、会议号  
     - 本人参与状态（进行中 / 已完成 / 已取消 等）  
     - 加入时间 / 完成时间

2. **查看已完成会议的结果**  
   - 在用户会议列表中，对 `status = completed` 的记录：  
     - 可查看该用户在该会议中的**对话记录**、**会议总结**和 **Todo 列表**等。

3. **查看所有 Todo 列表（按用户）**  
   - 提供“我的任务”视图：汇总当前用户在所有会议中生成的 Todo：  
     - 包含任务内容、所属会议、状态（未开始 / 进行中 / 已完成）、截止时间等。

---

## 三、新流程设计（高层）

### 3.1 管理员创建会议（与原规格基本一致）

管理员创建会议的流程保持不变，仅需更新“会议状态”的含义：

1. 创建 `meet` 记录：  
   - `id`（UUID）  
   - `meeting_code`（9 位数字，如 `100 083 426`）  
   - `title`、`description`、`start_time`、`duration` 等  
   - `status`：`active` / `cancelled` / `archived`（不再使用单一用户操作将其改为 `ended`）  
2. 管理员分享会议号或链接给多名用户。  
3. 会议本身作为“模板/配置”，长期存在并可复用。

> 变更点：**不再在“某个用户结束对话”时，把 `meets.status` 改为 `ended`**。  
> 若需要全局关闭会议（禁止后续新用户加入），由管理员手动将会议 `status` 调整为 `archived` 或 `cancelled`。

### 3.2 用户加入会议（新增“用户会议实例”）

当用户通过链接或输入会议号加入会议时，新流程如下：

1. **识别用户**（沿用原规格的用户识别逻辑）：  
   - 从 URL 或登录态中获取用户信息（平台 + 平台 userId / Supabase Auth userId 等）。  
   - 在 `users` 表中查找或创建用户记录。

2. **查找会议模板**  
   - 根据会议号或链接中的 `meeting_code` / `meet.id` 从 `meets` 表中获取会议。  
   - 验证会议是否存在且 `status in ('active', 'ongoing')`，若为 `cancelled` / `archived` 则拒绝加入。

3. **创建 / 获取 用户会议实例（user_meets）**  
   - 在新表 `user_meets` 中按 `(user_id, meet_id)` 查找：  
     - 若不存在，则创建一条新记录：  
       - `user_id` = 当前用户  
       - `meet_id` = 目标会议  
       - `status` = `in_progress`  
       - `joined_at` = 当前时间  
     - 若已存在且 `status = in_progress`：直接进入该实例，对话可继续。  
     - 若已存在且 `status = completed` / `cancelled`：  
       - 可只读查看历史结果，或视需要允许“重新开始一轮”（创建新实例或重置旧实例）。

4. **进入对话页面**  
   - 页面/Hook 需持有 `user_meet_id`（用户会议实例 ID），后续所有对话、总结、Todo 操作都基于此 ID。  
   - UI 显示：会议基础信息（来自 `meets`），用户个人状态（来自 `user_meets`）。

### 3.3 用户完成会议对话流程

1. 用户在对话页面完成与 AI 的一轮会话。  
2. 系统基于该轮对话内容生成：  
   - 会议总结（用户视角）  
   - Todo 列表（用户任务）  
3. 所有生成的数据都写入**与 `user_meet_id` 相关联**的记录中：  
   - `conversations.user_meet_id`  
   - `meet_summaries.user_meet_id`  
   - `todos.user_meet_id`  
4. 更新 `user_meets.status = 'completed'`，并记录 `completed_at` 时间。  
5. **不修改 `meets.status`**，以便其他用户后续继续使用该会议号。

### 3.4 用户查看个人会议列表

1. 用户打开“我的会议”页面 `/my/meets`：  
   - 后端按 `user_id` 从 `user_meets` 查询所有个人会议实例。  
   - 通过 `meet_id` join `meets` 获取标题、会议号等展示信息。  
2. 列表中每一行包含：  
   - 会议标题  
   - 会议号（格式化为 `100 083 426`）  
   - 用户状态：`进行中` / `已完成` / `已取消`  
   - 加入时间、完成时间  
3. 点击某条记录：  
   - 若状态为 `进行中`：跳转到对话页面，继续当前会话（基于该 `user_meet_id`）。  
   - 若状态为 `已完成`：跳转到“结果页面”（展示该用户在该会议下的总结、Todo、对话历史）。

### 3.5 用户查看所有 Todo 列表

1. 用户打开“我的任务”页面 `/my/todos`：  
   - 后端按 `user_id` 从 `todos` 表中查询所有任务（JOIN `user_meets`、`meets`）。  
2. 列表中每一项包含：  
   - 任务内容  
   - 所属会议标题 & 会议号  
   - 任务状态：`pending` / `in_progress` / `completed` 等  
   - 创建时间 / 截止时间  
3. 支持按照会议、状态进行筛选和排序。

---

## 四、数据库结构调整方案

### 4.1 现有核心表（简要回顾）

- `meets`：会议模板表  
  - `id` (PK)、`meeting_code`、`title`、`description`、`status`（目前被用户流程直接设置为 ended）、…  
- `conversations`：对话记录  
  - `id`、`meet_id`、`user_id`、`user_message_text`、`ai_response_text`、时间戳等  
- `todos`：任务表  
  - `id`、`meet_id`、`title`、`status`、`assigned_to_user_id`（如有）、…  
- `meet_summaries`（如已存在）：会议总结  
  - `id`、`meet_id`、`summary_text`、…  
- `users`：用户表  
  - `id`、平台信息、Supabase Auth ID 等。

### 4.2 新增表：`user_meets`（用户会议实例表）

**用途**：将“用户参与会议”的关系与状态显式建模，作为所有用户侧数据的主外键。

建议结构：

- `id` (PK, UUID)  
- `meet_id` (FK → meets.id)  
- `user_id` (FK → users.id)  
- `status` (`in_progress` / `completed` / `cancelled` / `archived`)  
- `joined_at` (timestamp)  
- `completed_at` (timestamp, nullable)  
- `cancelled_at` (timestamp, nullable)  
- `created_at` / `updated_at`

索引 & 约束：
- 唯一约束：`UNIQUE (meet_id, user_id)`（若不允许同一用户对同一会议创建多轮独立会话）  
  - 或允许多轮会话，则增加 `session_no` 或以 `id` 作为唯一实例，不做联合唯一。
- 索引：  
  - `INDEX (user_id)`（查询“我的会议列表”）  
  - `INDEX (meet_id)`（统计会议使用情况）。

### 4.3 修改表：`conversations`

新增字段：

- `user_meet_id` (FK → user_meets.id)  

语义：
- 每条对话记录属于某个“用户会议实例”。  
- 仍可保留 `meet_id`、`user_id` 便于查询与兼容旧数据，但业务上应以 `user_meet_id` 为主键。

迁移策略（示例思路）：
- 对已有历史数据：  
  1. 为每个 `(meet_id, user_id)` 组合创建一条 `user_meets` 记录（状态按历史推断）。  
  2. 将该组合下所有 `conversations` 的 `user_meet_id` 更新为新创建的 id。

### 4.4 修改表：`todos`

新增字段：

- `user_meet_id` (FK → user_meets.id)  
- （可选）`owner_user_id` (FK → users.id，需要时可与 user_meet_id 冗余，但方便直接按用户查询)

语义调整：
- 每条 Todo 属于一个“用户会议实例”。  
- “我的任务列表”即为所有 `owner_user_id = 当前用户` 或 `user_meet_id` 所属的任务合集。

迁移策略：
- 参考 `conversations` 的迁移，将历史任务按 `(meet_id, user_id)` 映射到对应的 `user_meets`。

### 4.5 修改表：会议总结（如 `meet_summaries`）

新增字段：

- `user_meet_id` (FK → user_meets.id)

语义：
- 对于同一 `meet`，不同用户可以有各自的总结，互不影响。

### 4.6 Supabase/Postgres SQL 示例

> 说明：以下 SQL 以 Supabase（Postgres）为基础，假设现有表位于 `public` schema，主键为 `uuid` 且已启用 `gen_random_uuid()`。  
> 请根据你实际的表名/字段名确认后再执行。

#### 4.6.1 新增 `user_meets` 表

```sql
-- 1) 创建用户会议实例表
create table if not exists public.user_meets (
  id uuid primary key default gen_random_uuid(),

  meet_id uuid not null references public.meets(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  status text not null default 'in_progress',  -- in_progress / completed / cancelled / archived
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_meets_meet_user_unique unique (meet_id, user_id)
);

-- 2) 辅助索引：按用户、按会议查询
create index if not exists idx_user_meets_user_id on public.user_meets(user_id);
create index if not exists idx_user_meets_meet_id on public.user_meets(meet_id);
```

#### 4.6.2 修改 `conversations` 表

```sql
-- 1) 为对话记录增加 user_meet_id 外键
alter table public.conversations
  add column if not exists user_meet_id uuid references public.user_meets(id);

-- 2) 可选：保留 meet_id / user_id 字段用于兼容与快捷查询
--    若已有则无需改动
-- alter table public.conversations
--   add column if not exists meet_id uuid references public.meets(id),
--   add column if not exists user_id uuid references public.users(id);

-- 3) 索引便于通过 user_meet_id 查询对话记录
create index if not exists idx_conversations_user_meet_id
  on public.conversations(user_meet_id);
```

#### 4.6.3 修改 `todos` 表

```sql
-- 1) 为 Todo 增加 user_meet_id 外键（所属用户会议实例）
alter table public.todos
  add column if not exists user_meet_id uuid references public.user_meets(id);

-- 2) 可选：增加 owner_user_id，便于直接按用户维度查询任务
alter table public.todos
  add column if not exists owner_user_id uuid references public.users(id);

-- 3) 索引：按 user_meet_id / owner_user_id 查询
create index if not exists idx_todos_user_meet_id
  on public.todos(user_meet_id);

create index if not exists idx_todos_owner_user_id
  on public.todos(owner_user_id);
```

#### 4.6.4 修改 `meet_summaries` 表（如存在）

```sql
-- 1) 为会议总结增加 user_meet_id 外键
alter table public.meet_summaries
  add column if not exists user_meet_id uuid references public.user_meets(id);

-- 2) 索引：按 user_meet_id 查询某个用户在某会议下的总结
create index if not exists idx_meet_summaries_user_meet_id
  on public.meet_summaries(user_meet_id);
```

#### 4.6.5 示例迁移 SQL（可选，仅作参考）

> 注意：下面是**示意性迁移**，实际执行前请先在测试库验证，并根据你的真实数据结构/约束进行调整。

```sql
-- 1) 为历史 (meet_id, user_id) 组合创建 user_meets 记录
insert into public.user_meets (meet_id, user_id, status, joined_at)
select
  c.meet_id,
  c.user_id,
  'completed'::text as status,
  min(c.created_at) as joined_at
from public.conversations c
where c.meet_id is not null
  and c.user_id is not null
group by c.meet_id, c.user_id
on conflict (meet_id, user_id) do nothing;

-- 2) 回填 conversations.user_meet_id
update public.conversations c
set user_meet_id = um.id
from public.user_meets um
where um.meet_id = c.meet_id
  and um.user_id = c.user_id
  and c.user_meet_id is null;

-- 3) 回填 todos.user_meet_id / owner_user_id（若 todos 中已有 meet_id / user_id）
update public.todos t
set user_meet_id = um.id,
    owner_user_id = coalesce(t.assigned_to_user_id, um.user_id)
from public.user_meets um
where um.meet_id = t.meet_id
  and (t.assigned_to_user_id is null or t.assigned_to_user_id = um.user_id)
  and t.user_meet_id is null;

-- 4) 回填 meet_summaries.user_meet_id（如存在 meet_id / user_id 字段）
-- 示例：假设 meet_summaries(meet_id, user_id, created_at, ...) 已存在
-- update public.meet_summaries ms
-- set user_meet_id = um.id
-- from public.user_meets um
-- where um.meet_id = ms.meet_id
--   and um.user_id = ms.user_id
--   and ms.user_meet_id is null;
```

---

## 五、API 与后端逻辑调整

### 5.1 不再由单个用户操作修改 `meets.status` 为 ended

现状（需改造）：
- 某个用户完成会议对话后，接口会直接更新 `meets.status = 'ended'`，导致其它用户无法再加入该会议。

改造后：
- 用户完成对话：  
  - 只更新 `user_meets.status = 'completed'` 和 `completed_at`。  
  - 不改变 `meets.status`。  
- `meets.status` 仅由管理员操作或系统任务根据业务规则改变（如全部结束、长期不使用归档）。

### 5.2 新增/调整 API 设计（示意，无需具体代码）

可以在现有 API 基础上增加以下接口（命名仅为示例）：

1. **加入会议 / 创建用户会议实例**
   - `POST /api/meets/{meeting_code}/join`  
   - 输入：当前登录用户（从 Auth / Token 中获取）、会议号。  
   - 行为：  
     - 验证会议存在且可用。  
     - 查找或创建 `user_meets` 记录。  
     - 返回：`user_meet_id`、会议基础信息。

2. **获取当前用户的会议列表**
   - `GET /api/my/meets`  
   - 自动从 Auth 中识别 `user_id`。  
   - 返回：当前用户所有 `user_meets` 记录及关联 `meets` 信息。

3. **获取单个用户会议实例详情**
   - `GET /api/my/meets/{user_meet_id}`  
   - 返回：该实例下的总结、Todo 列表、对话记录等（只返回当前用户有权限的数据）。

4. **获取当前用户所有 Todo**
   - `GET /api/my/todos`  
   - 可支持按状态、会议过滤。

> 注意：以上为设计方向，具体路径与参数可根据现有项目 API 规范做一致化调整。

---

## 六、前端框架与页面结构调整

### 6.1 对话页（`/meet/[code]`）集成 `user_meet_id`

1. 在用户进入 `/meet/[code]` 时：  
   - 通过调用 `POST /api/meets/{code}/join` 或等效逻辑，获取/创建 `user_meet_id`。  
   - 将 `user_meet_id` 存入前端状态（如 `useVoiceConversation` Hook 中），并在后续发起保存对话、生成总结、生成 Todo 时一并传递。

2. `useVoiceConversation` / 保存对话的 API 调整：  
   - 原先按 `meet.id` + `user.id` 保存对话记录；  
   - 未来按 `user_meet_id` 保存，`meet_id` & `user_id` 为附属字段。

3. 结束对话时：  
   - 调用后端接口更新 `user_meets.status`；  
   - 生成总结与 Todo 时附带 `user_meet_id`。

### 6.2 “我的会议”页面

新增页面（例如）：

- 路由：`/my/meets`  
- 功能：  
  - 从 `/api/my/meets` 获取数据；  
  - 列出该用户的所有会议实例；  
  - 状态标签显示 `进行中` / `已完成` / `已取消` 等；  
  - 点击某条记录：  
    - 若进行中：进入 `/meet/{meeting_code}?user_meet_id=...` 继续对话。  
    - 若已完成：进入结果页 `/my/meets/{user_meet_id}`。

### 6.3 “我的任务”页面

新增页面（例如）：

- 路由：`/my/todos`  
- 功能：  
  - 从 `/api/my/todos` 获取当前用户的所有任务；  
  - 支持按会议号/标题、状态、时间过滤和排序；  
  - 点击任务可跳转到对应的用户会议结果页。

---

## 七、迁移与兼容性建议

1. **数据迁移（一次性脚本）**
   - 为每个 `(meet_id, user_id)` 组合创建一条 `user_meets` 记录；  
   - 将该组合下所有历史 `conversations`、`todos`、`meet_summaries` 关联到对应的 `user_meet_id`。

2. **渐进式改造**
   - 后端 API 先支持 `user_meet_id` 但兼容旧字段；  
   - 前端逐步切换到基于 `user_meet_id` 的新流程；  
   - 完成切换后，再按需清理不再需要的旧逻辑（例如：单用户结束会议时直接更新 `meets.status` 的代码）。

3. **权限与安全**
   - 所有以 `user_meet_id` 为参数的接口，均需验证当前用户是否为该记录的 `user_id`；  
   - 避免不同用户通过篡改 `user_meet_id` 访问他人会议数据。

---

## 八、小结

通过引入 **`user_meets` 用户会议实例表**，并将对话、总结、Todo 等数据与该实例绑定，本方案实现了：

- 同一会议号可被多用户复用；  
- 每个用户在会议中的状态与数据彼此独立；  
- 支持“我的会议列表”和“我的任务列表”等个人视图；  
- 避免了单个用户结束会议导致全局 `meets.status` 变为 `ended` 影响其他用户的情况。

后续实现阶段可严格依据本文档，对数据库 Schema、API 设计和前端页面做对应改造。

