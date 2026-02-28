# Home 页面（AI Workforce Overview）业务逻辑与数据对接规格

> 本文档分析 `src/app/(main)/home/page.tsx` 的业务逻辑与数据结构，结合当前数据库、API 接口，说明页面结构、可对接数据与可省略项，并给出可执行方案。

---

## 一、页面结构概览

Home 页面为 **AI Workforce Overview**（管理员/经理视角的仪表盘），采用 **单页多视图** 的流程式展示，共 4 个视图：

| 视图 | 路由/状态 | 说明 |
|------|-----------|------|
| **Dashboard** | `view === 'dashboard'` | 总览：指标卡片、7 日趋势图、每日通话列表 |
| **Active Call** | `view === 'call'` | 进行中通话的 UI（WhatsApp 风格，含挂断） |
| **Processing** | `view === 'processing'` | 会后处理进度条（模拟步骤） |
| **Review** | `view === 'review'` | 会话回顾：总结、 transcript、Action Items、同步到提醒 |

**状态流**：`dashboard` → 点击「Monitor Call」→ `call` → 点击挂断 → `processing` → 自动完成 → `review` → 点击「Complete Session & Return」→ `dashboard`。

当前所有数据均为 **Mock**，未与后端/数据库对接。

---

## 二、各视图业务与数据拆解

### 2.1 Dashboard 视图

**UI 组成：**

1. **顶部**：标题「AI Workforce Overview」+ 按钮「Schedule New Call」（当前为模拟 Telegram 发送）
2. **指标卡片（3 个）**：
   - 完成会话数（原 Employees Interviewed）：如 142，本月已完成会话数 + 可选同比
   - Action Items Set：如 384（任务数）+ 65% 完成进度条
   - **第三张卡片**：不再使用 Sentiment Score，改用**第四节**替代指标（如平均会话时长、对话轮次、待办数等）
3. **7-Day Activity Trend**：面积图，按天展示 `interviews`、`tasks`（Mock 数组 `MOCK_TREND_DATA`）
4. **Daily Call List**：Tab「To Call」/「Completed」，列表项来自 `INITIAL_SESSIONS`，每项含：
   - `id`, `employee`, `role`, `type`, `time`, `status`（live / upcoming / completed）, `avatar`

**Mock 数据：**

- `MOCK_TREND_DATA`：7 天，每天 `name`, `interviews`, `tasks`
- `INITIAL_SESSIONS`：5 条「session」，含员工名、角色、会议类型、时间、状态

---

### 2.2 Active Call 视图

- 纯 UI：计时器、麦克风/摄像头开关、挂断按钮。
- 无业务数据请求，点击挂断仅触发 `onEnd()` 进入 Processing。

---

### 2.3 Processing 视图

- 固定 5 步文案（上传音频、转写、情感分析、提取行动项、同步 HR 仪表盘），定时器驱动。
- 无真实 API 调用，完成后调用 `onComplete()` 进入 Review。

---

### 2.4 Review 视图

**UI 组成：**

1. 顶部：返回按钮、「Session Review: Alex Johnson」、分享/导出按钮
2. **Coaching Summary**：`MOCK_SUMMARY` 一段文案
3. **Session Transcript**：`MOCK_TRANSCRIPT` 数组，每项 `speaker`, `time`, `text`
4. **Action Plan**：`todos`（来自父组件 state，初始为 `MOCK_GENERATED_TODOS`），每项 `id`, `text`, `owner`, `due`, `status`；可勾选完成；底部「Sync to Employee's Reminders」按钮（当前仅设 `synced=true`）

**Mock 数据：**

- `MOCK_SUMMARY`：字符串
- `MOCK_TRANSCRIPT`：AI Manager / 员工对话轮次
- `MOCK_GENERATED_TODOS`：3 条任务

---

## 三、当前数据库与 API 对应关系

### 3.1 数据库表（与 Home 相关）

| 表 | 说明 | 与 Home 的关联 |
|----|------|----------------|
| `meets` | 会议模板（会议号、标题、状态等） | 可对应「会议/类型」；管理员可创建会议 |
| `user_meets` | 用户会议实例（user_id, meet_id, status, joined_at, completed_at） | **Daily Call List 可对接**：每条即一次「用户参与某会议」 |
| `users` | 用户（id, name, email, role 等） | 列表中的「员工」可来自 `users`，通过 `user_meets.user_id` 关联 |
| `conversations` | 单轮对话（user_meet_id, user_message_text, ai_response_text 等） | **Review 的 Transcript 可对接** |
| `todos` | 任务（user_meet_id, meet_id, title, status, due_date 等） | **Review 的 Action Items 可对接** |
| `meet_summaries` | 会议总结（user_meet_id, summary, key_points 等） | **Review 的 Coaching Summary 可对接** |

### 3.2 现有 API 接口（与 Home 相关）

| API | 方法 | 说明 | 可用于 Home |
|-----|------|------|-------------|
| `/api/meets` | GET | 会议列表（支持 hostId, status, title, 分页） | 管理员查看/创建会议；可选用于「会议维度」列表 |
| `/api/my/meets` | GET | 当前用户的 user_meets 列表（需 userId） | **Dashboard 列表**：若 Home 为「当前用户」视角，直接对接；若为「管理员看全部」，需新 API |
| `/api/my/meet-summary` | GET | 按 userMeetId 取对话+总结+todos | **Review 视图**：传入选中的 user_meet_id 即可 |
| `/api/my/todos` | GET | 当前用户 todos（支持筛选） | 可作「我的任务」汇总，与 Review 单次会议的 todos 有区别 |
| `/api/todos/[id]` | PATCH | 更新单条 todo（如 status） | Review 中勾选完成时调用 |
| `/api/todos/[id]/confirm` | POST | 确认 todo | 视业务是否需要在 Review 里确认 |
| `/api/user-meets/join` | POST | 加入会议（创建/获取 user_meet） | 用户从 Home 进入某会议时可用 |

当前 **没有**：按时间范围统计的「访谈数/任务数」、按天聚合的「7 日趋势」、全量 user_meets（管理员视角）等接口。

### 3.3 可用于 Overview 的当前用户数据（按表）

| 数据来源 | 字段/含义 | 可产出指标 |
|----------|-----------|------------|
| `user_meets` | `joined_at`, `completed_at`, `status` | 完成会话数、进行中会话数、**平均会话时长**（completed_at − joined_at） |
| `conversations` | `user_meet_id`, `created_at` | **对话轮次**（条数，即用户+AI 往返次数） |
| `todos` | `status`, `due_date`, `priority`, `owner_user_id`/`assignee_id` | 任务总数、已完成数、完成率、**待办数**、**即将到期/已逾期数**、高优先级未完成数 |
| `meet_summaries` | `user_meet_id` | 已生成总结的会话数（可选） |

---

## 四、Sentiment Score 替代指标与 Overview 可扩展数据

> 页面为**当前用户视角**，仅展示当前用户数据；暂不实现 Sentiment Score，改用现有数据替代第三张卡片，并补充适合放在 Overview 的其它指标。

### 4.1 第三张卡片：用现有数据替代 Sentiment Score

库中无「情感/参与度」字段，**建议用以下其一替代原 Sentiment Score 卡片**（均由现有表统计可得）：

| 替代指标 | 说明 | 数据来源与计算 | 推荐度 |
|----------|------|----------------|--------|
| **平均会话时长** | 体现单次会话投入程度，单位分钟 | `user_meets`：对当前用户、`status=completed` 且 `completed_at` 非空，取 `completed_at - joined_at` 的平均值（分钟） | ⭐⭐⭐ 首选 |
| **本月对话轮次** | 与 AI 的对话往返次数，体现互动量 | `conversations` 按 `user_meet_id` 关联当前用户的 `user_meets`，在时间范围内 count | ⭐⭐⭐ |
| **待办 / 即将到期任务数** | 提醒待处理事项，有行动导向 | `todos`：当前用户为 owner 或 assignee，`status` 非 completed，且 `due_date` 为空或 ≤ 未来 N 天（如 7 天）的 count | ⭐⭐ |
| **任务完成率** | 与第二张卡片「65% 完成」一致，可合并展示 | 同第二张卡片，或仅保留一张「任务」卡片 | ⭐ |

**建议**：第三张卡片采用 **「平均会话时长」**（如 `12 分钟`）+ 副文案「本月已完成会话的平均时长」，或采用 **「对话轮次」**（如 `48 轮`）+「本月与 AI 的对话轮次」。若希望更强调待办，可改为 **「待办任务数」**（如 `5 项待办`）。

### 4.2 适合放在 Overview 的其他数据（当前用户）

在现有三张卡片 + 7 日趋势 + Daily Call List 基础上，以下数据也适合放在 Overview，且均可由现有表与 stats API 提供：

| 位置/形式 | 指标 | 数据来源 | 说明 |
|-----------|------|----------|------|
| 指标卡片区 | **进行中会话数** | `user_meets` 中 `status=in_progress` 的 count | 可作小徽章或与「完成会话数」并列 |
| 指标卡片区 | **高优先级待办数** | `todos` 中 `priority=high` 且 `status` 非 completed | 提醒优先处理 |
| 趋势图维度 | **每日对话轮次** | 按日聚合 `conversations`（通过 user_meets 过滤当前用户） | 与「每日完成会话数」「每日任务数」并列或切换 |
| 列表/摘要 | **最近完成时间** | 当前用户最近一条 `user_meets.completed_at` | 可展示在 Daily Call List 顶部或副标题 |
| 列表/摘要 | **已生成总结的会话数** | `meet_summaries` 按当前用户 `user_meets` 计数 | 可选，体现「已有总结可回顾」的会话数 |

实施时可在 **GET /api/stats/overview** 中一并返回：`sessionsCompleted`, `sessionsInProgress`, `actionItemsTotal`, `actionItemsCompleted`, `avgSessionDurationMinutes`, `conversationTurnsTotal`, `pendingOrDueSoonCount`, `highPriorityPendingCount` 等，前端按需选用展示。

---

## 五、数据对接结论：可对接 / 可聚合 / 建议省略

### 5.1 可直接对接的数据

| 页面区域 | 当前 Mock | 对接方式 | 说明 |
|----------|-----------|----------|------|
| **Daily Call List** | `INITIAL_SESSIONS` | 调用 **GET /api/my/meets?userId=xxx** | 列表项改为 `user_meets` + 关联 `meet`；展示：用户姓名（来自 users 或 meet 标题）、会议标题（type）、时间（joined_at/completed_at）、状态（status → live/upcoming/completed 需与前端枚举映射）。若要做「管理员看全部」，需新增 **GET /api/admin/user-meets** 或扩展 `meets` 列表带 user_meets 聚合。 |
| **Review - Transcript** | `MOCK_TRANSCRIPT` | 调用 **GET /api/my/meet-summary?userMeetId=xxx**，用返回的 `conversations` | 将 `conversations` 转为 `{ speaker, time, text }`：user 一条、ai 一条，时间用 `user_sent_at` / `ai_responded_at`。 |
| **Review - Coaching Summary** | `MOCK_SUMMARY` | 同上，用返回的 `summary.summary` | 直接渲染 `summary.summary`（或 key_points）。 |
| **Review - Action Plan (todos)** | `MOCK_GENERATED_TODOS` | 同上，用返回的 `todos`；勾选时调用 **PATCH /api/todos/[id]** | 字段映射：`title`→展示文案，`status`→done/pending，`due_date`→Due，owner 可用 `owner_user_id` 查 users 或省略/用「员工」占位。 |

**前提**：进入 Review 时需持有 **user_meet_id**（例如从 Daily Call List 选「查看结果」时传入，或从 Active Call 流程结束时记住当前 user_meet_id）。

### 5.2 需聚合或新增 API 的数据

| 页面区域 | 当前 Mock | 建议 |
|----------|-----------|------|
| **完成会话数 (原 Employees Interviewed)** | 硬编码 | 需 **统计 API**：当前用户视角下为「本月 completed 的 user_meets 数量」。可新增 `GET /api/stats/overview?userId=&from=&to=` 返回 `{ sessionsCompleted, ... }`。 |
| **Action Items Set (384) / 65%** | 硬编码 | 同上，从 `todos` 表按时间范围 count，以及 status=completed 占比。 |
| **7-Day Activity Trend** | `MOCK_TREND_DATA` | 需 **按日聚合**：如 `GET /api/stats/trend?days=7` 返回 `{ date, interviews, tasks }`（interviews=当日 completed 的 user_meets 数，tasks=当日创建或完成的 todos 数）。 |
| **Daily Call List（管理员看全部）** | 当前若只对「我的」 | 需 **GET /api/admin/user-meets** 或 `/api/meets` 扩展：返回所有（或某 host 下）会议的 user_meets，以便管理员看到「所有员工的会话列表」。 |

### 5.3 建议省略或保留 Mock 的数据

| 页面区域 | 说明 |
|----------|------|
| **Sentiment Score (8.4/10)** | 已由**第四节**的替代指标替代（如平均会话时长、对话轮次、待办数等），不再展示 Sentiment Score；无需接入情感数据。 |
| **Schedule New Call（Telegram）** | 当前项目无 Telegram 集成；**建议改为**「创建会议」：调用 **POST /api/meets** 生成会议号/链接，或仅跳转到已有「创建会议」页。 |
| **Active Call 视图** | 真实通话在 **/meet/[code]** 完成；Home 的 Active Call 可改为 **跳转到 /meet/[code]**（带当前选中的 meeting_code），或保留为 Demo 不动。 |
| **Processing 步骤文案** | 真实流程在会议页结束会话时已触发总结/Todo 生成；**建议**：要么跳过 Processing 直接进 Review（带 user_meet_id），要么保留简短动画不请求真实接口。 |
| **Sync to Employee's Reminders** | 无 Apple Reminders/第三方同步实现；**建议**保留按钮，仅做「已同步」状态展示，或改为「复制到剪贴板」等轻量能力。 |

---

## 六、页面与真实流程的衔接方式

两种常见产品形态：

- **A. Home 作为「当前用户」的入口**  
  - Daily Call List = 我的会话列表（**/api/my/meets**）。  
  - 点击「Monitor Call」/「继续」→ 跳转 **/meet/[code]**（该 user_meet 对应的 meeting_code）。  
  - 点击「查看结果」→ 跳转 **/meet/[code]/summary?userMeetId=xxx**。  
  - Review 仅在「从 summary 页返回」或「从某入口带 userMeetId 打开」时展示，数据来自 **/api/my/meet-summary**。

- **B. Home 作为「管理员」总览**  
  - Daily Call List = 全部（或某 host 下）user_meets，需 **GET /api/admin/user-meets**（或等价）并关联 users、meets。  
  - 指标与趋势需 **/api/stats/overview**、**/api/stats/trend**。  
  - 「Monitor Call」可跳转对应会议的对话页（若需监看，需产品定义权限与实现）。

当前项目已有 **/my/meets**、**/my/meet-summary**，更适合先做 **A**；B 需新增统计与管理员列表 API。

---

## 七、可执行方案（分阶段）

### 阶段 1：列表与 Review 对接真实数据（最小可行）

1. **确定身份与入口**  
   - 使用现有 `useAuth()` 获取 `userId`；未登录时 Home 可重定向登录或仅展示 Mock。

2. **Dashboard - Daily Call List 对接 /api/my/meets**  
   - 请求 `GET /api/my/meets?userId=xxx`。  
   - 将返回的 `userMeets` 映射为列表项：  
     - 展示字段：用户姓名（需从 `users` 查或暂用 meet.title）、会议标题（meet.title）、时间（joined_at / completed_at）、状态（user_meets.status → 前端「进行中/已完成」等）。  
   - 「To Call」= status 非 completed 的项；「Completed」= completed 的项。  
   - 点击「查看结果」→ 跳转 `/meet/${meet.meeting_code}/summary?userMeetId=${userMeet.id}`。  
   - 点击「继续」→ 跳转 `/meet/${meet.meeting_code}`（并依赖会议页内已有 join 逻辑带 user_meet_id）。

3. **Review 视图对接 /api/my/meet-summary**  
   - 进入 Review 时必须有 `userMeetId`（从列表点击「查看结果」带入，或从 sessionStorage/state 传入）。  
   - 请求 `GET /api/my/meet-summary?userMeetId=xxx`。  
   - **Coaching Summary**：渲染 `data.summary.summary`（无则显示占位）。  
   - **Transcript**：用 `data.conversations` 转成 `{ speaker, time, text }` 列表渲染。  
   - **Action Plan**：用 `data.todos`，勾选时调用 `PATCH /api/todos/[id]` 更新 status（如改为 completed）。  
   - 标题「Session Review: xxx」可改为会议标题或用户+会议组合。

4. **Active Call / Processing 简化**  
   - 「Monitor Call」改为：跳转 `/meet/${meeting_code}`，不再在 Home 内做完整通话 UI。  
   - Processing 可保留简短动画后直接进入 Review（此时需在「结束会议」流程里把当前 `user_meet_id` 带到 Home，例如通过路由 state 或从 `/my/meets` 再进 Review）。

### 阶段 2：指标与趋势（需新 API）

1. **新增统计 API**  
   - `GET /api/stats/overview?userId=&from=&to=`（当前用户必传 `userId`）：  
     - 返回：`sessionsCompleted`、`sessionsInProgress`、`actionItemsTotal`、`actionItemsCompleted`（或完成率）；  
     - **第三张卡片替代指标**（至少其一）：`avgSessionDurationMinutes`（平均会话时长）、`conversationTurnsTotal`（对话轮次）、`pendingOrDueSoonCount`（待办/即将到期数）、`highPriorityPendingCount`（高优先级待办）。  
   - `GET /api/stats/trend?userId=&days=7`：  
     - 返回 `[{ date, interviews, tasks }]`（按日聚合）；可扩展 `conversationTurns` 等。  
   - 若做管理员视角，可增加 `hostId` 或 `role=admin` 查全部。

2. **Dashboard 指标卡片与图表**  
   - 用 overview 接口填「完成会话数」「Action Items Set」及进度；第三张卡片用**第四节**替代指标（平均会话时长 / 对话轮次 / 待办数 等）。  
   - 用 trend 接口渲染 7 日趋势图（Recharts 已存在，仅换数据源）。  
   - 不再展示 Sentiment Score。

### 阶段 3：管理员视角与 Schedule

1. **管理员列表**（可选）  
   - 新增 `GET /api/admin/user-meets`（或扩展 meets 接口）：按 host_id 或全局查 user_meets，关联 users、meets。  
   - 权限：仅 `role=admin` 或指定 host 可调。

2. **Schedule New Call**  
   - 改为调用 **POST /api/meets** 创建会议，成功后展示会议号/链接或跳转会议详情/分享页；或跳转到现有「创建会议」页面。

3. **Sync to Reminders**  
   - 保持 Mock 或改为「复制任务列表文本」等，真实同步留到后续迭代。

---

## 八、数据流小结

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Home Dashboard                                                          │
│  - 指标卡片 (阶段2: /api/stats/overview)                                 │
│  - 7日趋势 (阶段2: /api/stats/trend)                                     │
│  - Daily Call List (阶段1: /api/my/meets) → 项: user_meet + meet         │
│      [查看结果] → /meet/[code]/summary?userMeetId=xxx                    │
│      [继续]     → /meet/[code]                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Review (阶段1: /api/my/meet-summary?userMeetId=xxx)                      │
│  - summary.summary → Coaching Summary                                    │
│  - conversations   → Session Transcript                                   │
│  - todos           → Action Plan; 勾选 → PATCH /api/todos/[id]           │
└─────────────────────────────────────────────────────────────────────────┘
```

- **可对接**：Daily Call List（my/meets）、Review 全文（my/meet-summary）、Todo 勾选（todos PATCH）。  
- **可聚合**：指标与 7 日趋势（需新 stats API）。  
- **可省略/延后**：Sentiment 已由替代指标取代；Telegram 预约、真实 Processing 步骤、Apple Reminders 同步；Active Call 改为跳转会议页即可。

按上述阶段实施，即可在保留现有 Home UI 结构的前提下，逐步将数据替换为真实接口与数据库。
