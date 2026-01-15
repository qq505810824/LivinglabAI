# 茶叶与茶文化知识网站开发文档

**项目名称**：`tea-culture-hub`  
**技术栈**  
- 框架：Next.js 14（App Router）+ React 18  
- 语言：TypeScript  
- 样式：Tailwind CSS  
- 数据库/后端：Supabase（Auth + PostgreSQL + Storage）  
- 主要库：axios、moment、lucide-react、eslint、postcss  
- 状态管理：React Context + 自定义 Hooks  
- 代码规范：ESLint + Prettier  

**项目目标**  
构建一个展示茶叶分类、茶文化历史、冲泡知识、茶具介绍、产地故事等内容的静态+动态网站。内容主要通过 Supabase 管理（管理员后台可编辑），前端提供优雅的阅读体验，目标是传播茶知识、推广茶文化。

## 1. 项目初始化

```bash
# 1. 创建 Next.js 项目（选择 TypeScript、Tailwind CSS、App Router）
npx create-next-app@latest tea-culture-hub \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd tea-culture-hub

# 2. 初始化 git
git init
git add .
git commit -m "Initial commit"
```

## 2. 安装核心依赖

```bash
# Supabase 客户端
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# 图标库
npm install lucide-react

# HTTP 请求（如果需要调用第三方 API 或 Supabase REST）
npm install axios

# 日期处理
npm install moment

# 代码格式化（推荐）
npm install -D prettier prettier-plugin-tailwindcss

# 其他可选（表单、动画等后续可按需添加）
# npm install zod react-hook-form framer-motion
```

## 3. 项目结构（推荐）

```
tea-culture-hub/
├── src/
│   ├── app/                     # Next.js App Router 页面
│   │   ├── (main)/              # 主路由组（带共享 layout）
│   │   │   ├── layout.tsx       # 主布局（Header + Footer）
│   │   │   ├── page.tsx         # 首页
│   │   │   ├── about/page.tsx   # 关于茶文化
│   │   │   ├── teas/            # 茶叶分类
│   │   │   │   ├── page.tsx     # 分类列表
│   │   │   │   └── [slug]/page.tsx # 单篇茶叶详情
│   │   │   ├── culture/         # 茶文化文章
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── brewing/         # 冲泡指南
│   │   ├── globals.css          # Tailwind 全局样式
│   │   └── favicon.ico
│   ├── components/              # 可复用 UI 组件（高度解耦）
│   │   ├── ui/                  # 基础组件（Button、Card、Input 等）
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Carousel.tsx
│   │   │   └── ...
│   │   ├── layout/              # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── tea/                 # 茶叶相关专用组件
│   │   │   ├── TeaCard.tsx
│   │   │   ├── TeaCategoryList.tsx
│   │   │   └── TeaDetail.tsx
│   │   └── common/              # 通用组件（Loading、Error、SEO 等）
│   │   │   ├── PageContainer.tsx
│   │   │   ├── LegalPageLayout.tsx
│   ├── contexts/                # React Context
│   │   ├── AuthContext.tsx      # 用户认证（可选，后续可扩展管理员）
│   │   └── ThemeContext.tsx     # 深色模式等（可选）
│   ├── hooks/                   # 自定义 Hooks（数据获取、状态管理）
│   │   ├── useTeas.ts           # 获取茶叶列表
│   │   ├── useTeaBySlug.ts      # 根据 slug 获取单篇
│   │   ├── useArticles.ts       # 获取文化文章
│   │   └── useSupabase.ts       # 封装 Supabase 客户端
│   ├── lib/                     # 工具函数
│   │   ├── supabaseClient.ts    # Supabase 客户端初始化（browser + server）
│   │   ├── axiosInstance.ts     # axios 实例（可选）
│   │   └── utils.ts             # 通用工具（格式化日期等）
│   ├── types/                   # TypeScript 类型定义
│   │   ├── supabase.ts          # 从 Supabase 生成的类型
│   │   └── index.ts
│   └── public/                  # 静态资源（茶图、茶具图片等）
│       └── images/
├── .env.local                   # Supabase 密钥
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

**结构原则**  
- **解耦**：UI 组件只负责渲染，不包含数据获取逻辑  
- **数据层**：所有 Supabase 查询放在 `hooks/` 中，使用 React Server Components 或 Client Components + SWR-like 模式  
- **Context**：仅用于需要全局共享的状态（如认证、主题）  
- **页面**：尽量使用 Server Components 直接从 Supabase 取数据，减少客户端请求

## 4. 核心配置

### 4.1 Tailwind CSS（已由 create-next-app 初始化）
在 `tailwind.config.ts` 中扩展（如需要自定义主题色“茶绿”）：

```ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tea: {
          50: '#f0f7f0',
          500: '#3d8b5e', // 茶绿色
          700: '#2d6b45',
        },
      },
    },
  },
  plugins: [],
}
```

### 4.2 ESLint + Prettier
创建 `.prettierrc`：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 4.3 Supabase 配置

1. 在 Supabase 控制台创建项目，获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`  
2. 创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. 创建 `src/lib/supabaseClient.ts`：

```ts
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// 浏览器端
export const supabase = createBrowserSupabaseClient<Database>()

// 服务端（Server Components / Route Handlers）
export const createSupabaseServerClient = () =>
  createServerSupabaseClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
```

4. 生成类型（推荐）：
```bash
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

## 5. 数据获取模式（Hooks 管理）

示例：`src/hooks/useTeas.ts`

```ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Tea } from '@/types/supabase'

export function useTeas() {
  const [teas, setTeas] = useState<Tea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeas = async () => {
      const { data, error } = await supabase
        .from('teas')
        .select('*')
        .order('category')
      
      if (error) console.error(error)
      else setTeas(data ?? [])
      setLoading(false)
    }

    fetchTeas()
  }, [])

  return { teas, loading }
}
```

在 Server Component 中可以直接查询（推荐首屏数据）：

```ts
// app/teas/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseClient'

export default async function TeasPage() {
  const supabase = createSupabaseServerClient()
  const { data: teas } = await supabase.from('teas').select('*')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {teas?.map(tea => <TeaCard key={tea.id} tea={tea} />)}
    </div>
  )
}
```

## 6. 关键页面与组件实现指南

1. **首页**：轮播图 + 茶叶分类卡片 + 最新文化文章 + 冲泡小贴士  
2. **茶叶分类页**：按六大茶类（绿茶、红茶、乌龙等）过滤展示  
3. **茶叶/文章详情页**：富文本内容、相关图片、分享按钮  
4. **全局 Header/Footer**：导航、搜索框、深色模式切换（可选）

组件示例：`components/ui/Card.tsx`

```tsx
import { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-sm ${className}`}>
      <h2 className="mb-4 text-2xl font-semibold text-tea-700">{title}</h2>
      {children}
    </div>
  )
}
```

## 7. 项目优化

1. **图片优化**：使用 Next.js Image 组件，所有茶图放在 `/public/images` 或 Supabase Storage  
2. **SEO**：每个页面添加 `metadata` 或 `generateMetadata` 函数  
3. **性能**：  
   - 尽量使用 Server Components  
   - 动态页面使用 `revalidate` 或 `dynamic = 'force-dynamic'`  
   - 启用 Partial Prerendering（Next.js 14 默认）  
4. **代码质量**：运行 `npm run lint` 和 `npm run format`  
5. **Accessibility**：使用 lucide-react 图标时添加 aria-label，使用语义化 HTML

## 8. 部署上线

推荐部署到 **Vercel**（Next.js 官方平台）：

```bash
# 1. 安装 Vercel CLI（可选）
npm i -g vercel

# 2. 登录并部署
vercel login
vercel --prod
```

- 自动识别 Next.js 项目  
- 环境变量在 Vercel 仪表盘中添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- 自定义域名可在 Vercel 中绑定

## 9. 后续扩展建议

- 管理员后台（使用 Supabase Auth + 受保护路由）  
- 评论系统（Supabase Table + 实时订阅）  
- 搜索功能（Supabase full-text search）  
- 多语言（next-intl）  
- 博客 RSS 订阅

按照这份文档结构逐步实现，你的项目将拥有清晰的层次、良好的可维护性和扩展性。开始编码时可以先搭建布局和 Supabase 连接，再逐步填充内容。祝开发顺利，品茗愉快！🍵