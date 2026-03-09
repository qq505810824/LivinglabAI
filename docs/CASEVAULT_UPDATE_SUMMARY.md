# CaseVault 技术文档更新说明 (v2.1)

## 📋 更新概述

**更新日期**: 2026-03-09  
**版本**: v2.0 → v2.1  
**主要改进**: 补充页面风格、布局分离、Loading 组件、暑期项目模块

---

## ✅ 新增内容清单

### 1. 页面颜色搭配规范

#### 主题色系统
- **深空蓝紫风格**: 完全保持与原原型 `index.html` 一致
- **颜色变量**: 定义在 CSS :root 中，便于统一管理
- **Tailwind 配置**: 扩展了自定义颜色配置

```css
/* 核心颜色 */
--bg-primary: #0f172a;        /* 深蓝灰背景 */
--primary: #818cf8;           /* 亮靛蓝主色 */
--success: #34d399;           /* 翠绿成功色 */
--warning: #fbbf24;           /* 琥珀警告色 */
--danger: #f87171;            /* 珊瑚红危险色 */
```

#### 徽章颜色映射
```typescript
// utils/theme.ts
export const badgeColors = {
  category: {
    solved: 'purple',    // ✅ 已解决
    open: 'blue',        // 💬 开放中
    process: 'yellow',   // ⚙️ 流程优化
    policy: 'pink',      // 📜 政策制定
    content: 'green',    // 📣 内容创作
  },
  difficulty: {
    beginner: 'green',       // 🟢 入门
    intermediate: 'yellow',  // 🟡 中级
    advanced: 'red',         // 🔴 高级
  },
};
```

---

### 2. 三大独立布局系统

#### (auth) - 认证布局
**位置**: `app/(auth)/layout.tsx`  
**特点**: 
- 居中卡片式布局
- 背景装饰光晕效果
- 无导航栏、无 Footer

**使用场景**:
- `/login` 登录页
- `/register` 注册页

#### (main) - 学生端布局
**位置**: `app/(main)/layout.tsx`  
**特点**: 
- 完整的 Header + Footer
- 导航栏高度：56px
- 深色主题贯穿始终

**使用场景**:
- `/cases` 问题银行
- `/internships` 实习机会
- `/programs` 暑期项目
- `/projects` 我的项目

#### (org) - 机构管理后台 (独立!)
**位置**: `app/(org)/layout.tsx`  
**特点**: 
- 简化的顶部导航 (无 Footer)
- 专注于工作台体验
- **与 (main) 完全独立**

**使用场景**:
- `/dashboard` 企业仪表板
- `/dashboard/cases` 案例管理
- `/dashboard/opportunities` 机会管理
- `/dashboard/submissions` 作品审核

---

### 3. 统一 Loading 加载组件库

#### LoadingButton (加载按钮)
**文件**: `components/ui/LoadingButton.tsx`  
**功能**: 
- 集成 Loader2 图标
- 支持自定义 loading 文字
- 多种 variant (primary/secondary/outline/ghost/danger)

**使用示例**:
```tsx
<LoadingButton
  onClick={handleSubmit}
  isLoading={isSubmitting}
  loadingText="Submitting case..."
>
  Submit Case
</LoadingButton>
```

#### PageLoader (整页加载)
**文件**: `components/common/PageLoader.tsx`  
**功能**: 
- 居中显示加载动画
- 可选的提示文字
- 适用于整页数据加载

**使用示例**:
```tsx
<PageLoader message="Loading program details..." />
```

#### CardLoader (卡片骨架屏)
**文件**: `components/common/CardLoader.tsx`  
**功能**: 
- 模拟真实卡片结构
- 支持自定义数量
- 脉冲动画效果

**使用示例**:
```tsx
<CardLoader count={6} />
```

#### TableLoader (表格骨架屏)
**文件**: `components/common/TableLoader.tsx`  
**功能**: 
- 模拟表格行列结构
- 延迟动画增强视觉效果

**使用示例**:
```tsx
<TableLoader rows={5} columns={4} />
```

---

### 4. Summer Programs 暑期项目模块

#### 数据结构
**文件**: `types/program.ts`

```typescript
interface Program {
  id: string;
  title: string;
  organization: string;
  orgType: 'university' | 'company' | 'institution';
  duration: string;          // e.g., "8 weeks"
  dates: string;             // e.g., "Jul 1 – Aug 25, 2026"
  deadline: Date;
  description: string;
  highlights: string[];      // 项目亮点
  location?: string;
  cost?: string;
  capacity?: number;
  certificate?: boolean;
  status: 'active' | 'closed' | 'upcoming';
  applicantsCount?: number;
}
```

#### API 路由
**文件**: `app/api/v1/programs/route.ts`
- `GET /api/v1/programs` - 获取项目列表
- `POST /api/v1/programs/:id/apply` - 申请项目

#### Hooks
**文件**: `hooks/usePrograms.ts`
```typescript
export function usePrograms(): UseProgramsReturn {
  // 功能:
  // - programs: 项目列表
  // - isLoading: 加载状态
  // - refreshPrograms: 刷新列表
  // - loadMore: 加载更多
  // - applyProgram: 申请项目
}
```

#### 页面组件
1. **列表页**: `app/(main)/programs/page.tsx`
   - 网格布局展示
   - 筛选和搜索
   - 加载更多

2. **详情页**: `app/(main)/programs/[id]/page.tsx`
   - 完整项目信息
   - 申请按钮
   - 截止日期提示

3. **卡片组件**: `components/programs/ProgramCard.tsx`
   - 悬停效果
   - 元数据标签
   - 申请状态显示

#### 数据库表
```sql
-- programs 表
CREATE TABLE programs (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  dates VARCHAR(255) NOT NULL,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[],
  -- ... 更多字段
);

-- program_applications 申请表
CREATE TABLE program_applications (
  id UUID PRIMARY KEY,
  program_id UUID REFERENCES programs(id),
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(255),
  statement TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  -- ... 更多字段
);
```

---

## 📁 新增文件清单

### 类型定义
- `types/program.ts` - 暑期项目类型定义

### 组件
- `components/ui/LoadingButton.tsx`
- `components/common/PageLoader.tsx`
- `components/common/CardLoader.tsx`
- `components/common/TableLoader.tsx`
- `components/programs/ProgramCard.tsx`

### Hooks
- `hooks/usePrograms.ts`

### 工具函数
- `utils/theme.ts` - 主题配色配置

### Provider
- `components/providers/AuthProvider.tsx`
- `components/providers/QueryProvider.tsx`

---

## 🎨 设计风格对照表

| 元素 | 原原型 (index.html) | 新实现 | 状态 |
|------|-------------------|--------|------|
| 主背景 | `#0f172a` | `--bg-primary: #0f172a` | ✅ 一致 |
| 卡片背景 | `#1e293b` | `--bg-secondary: #1e293b` | ✅ 一致 |
| 主色 | `#818cf8` | `--primary: #818cf8` | ✅ 一致 |
| 成功色 | `#34d399` | `--success: #34d399` | ✅ 一致 |
| 徽章 -purple | `rgba(129,140,248,0.15)` | `bg-purple-500/15` | ✅ 一致 |
| 徽章 -green | `rgba(52,211,153,0.15)` | `bg-green-500/15` | ✅ 一致 |
| 圆角 | `12px` | `--radius-lg: 12px` | ✅ 一致 |
| 导航高度 | `56px` | `pt-[56px]` | ✅ 一致 |

---

## 🔄 重要变更说明

### 1. 布局分离
**变更前**: 所有页面共用一个 layout  
**变更后**: 
- `(auth)` - 独立认证布局
- `(main)` - 学生端布局 (含 Footer)
- `(org)` - 机构端布局 (无 Footer, 与 main 完全独立)

**影响**: 
- 需要创建 `app/(org)/layout.tsx`
- 机构端路由全部移至 `(org)` 下

### 2. Loading 状态统一管理
**变更前**: 各组件自行处理 loading  
**变更后**: 
- 统一使用 `LoadingButton` 组件
- 列表加载使用骨架屏 (CardLoader/TableLoader)
- 整页加载使用 `PageLoader`

### 3. 暑期项目独立模块
**变更前**: 未包含在初版文档中  
**变更后**: 
- 完整的数据结构
- API 接口
- Hooks 封装
- 页面组件
- 数据库表设计

---

## 📝 开发注意事项

### 1. 颜色使用规范
```tsx
// ✅ 推荐：使用语义化类名
<div className="bg-background-primary text-text-primary">

// ✅ 推荐：使用 theme 工具
import { badgeColors } from '@/utils/theme';
<Badge variant={badgeColors.category.solved}>

// ❌ 避免：硬编码颜色值
<div className="bg-[#0f172a]">  // 不要这样做
```

### 2. 布局选择指南
- 登录/注册页 → 放在 `(auth)` 下
- 学生相关页面 → 放在 `(main)` 下
- 机构管理页面 → 放在 `(org)` 下

### 3. Loading 使用场景
- 表单提交 → `LoadingButton`
- 页面切换 → `PageLoader`
- 列表加载 → `CardLoader` 或 `TableLoader`

### 4. 暑期项目集成
- 添加到学生端导航
- 与实习机会并列
- 申请流程独立于实习申请

---

## 🚀 下一步行动

### Phase 1 优先任务
1. [ ] 配置 Tailwind 主题色
2. [ ] 创建三大布局文件
3. [ ] 实现 LoadingButton 组件
4. [ ] 实现骨架屏组件
5. [ ] 创建暑期项目基础页面

### Phase 2 完善
1. [ ] 暑期项目 API 实现
2. [ ] 暑期项目 Hook 封装
3. [ ] 申请表单模态框
4. [ ] 详情页完整信息

---

## 📊 文档版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v2.0 | 2026-03-09 | 初始版本 |
| v2.1 | 2026-03-09 | 补充颜色规范、布局分离、Loading 组件、暑期项目模块 |

---

**文档维护**: Development Team  
**最后更新**: 2026-03-09
