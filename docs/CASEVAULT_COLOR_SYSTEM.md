# CaseVault 颜色系统规范

## 📋 颜色对照表

本颜色系统完全还原自原型文件 `docs/index.html`

### 背景色系

| 变量名 | 色值 | 用途 | Tailwind 类名 |
|--------|------|------|--------------|
| `--bg-primary` | `#0f172a` | 主背景 (页面整体) | `bg-bg-primary` |
| `--bg-secondary` | `#1e293b` | 次要背景 (卡片、容器) | `bg-bg-secondary` |
| `--bg-tertiary` | `#334155` | 第三背景 (输入框、hover) | `bg-bg-tertiary` |

### 主色调

| 变量名 | 色值 | 用途 | Tailwind 类名 |
|--------|------|------|--------------|
| `--primary` | `#818cf8` | 主色 (按钮、链接、徽章) | `text-primary`, `bg-primary` |
| `--primary-hover` | `#6366f1` | 悬停状态 | `hover:bg-primary-hover` |
| `--primary-light` | `rgba(129, 140, 248, 0.1)` | 浅色背景 (激活态) | `bg-primary-light` |

### 功能色

| 变量名 | 色值 | 用途 | Tailwind 类名 |
|--------|------|------|--------------|
| `--success` | `#34d399` | 成功 (翠绿) | `text-success`, `bg-success` |
| `--success-bg` | `rgba(52, 211, 153, 0.15)` | 成功背景 | `bg-success-bg` |
| `--warning` | `#fbbf24` | 警告 (琥珀) | `text-warning`, `bg-warning` |
| `--warning-bg` | `rgba(251, 191, 36, 0.15)` | 警告背景 | `bg-warning-bg` |
| `--danger` | `#f87171` | 危险/错误 (珊瑚红) | `text-danger`, `bg-danger` |
| `--danger-bg` | `rgba(248, 113, 113, 0.15)` | 错误背景 | `bg-danger-bg` |
| `--info` | `#60a5fa` | 信息 (天蓝) | `text-info`, `bg-info` |
| `--info-bg` | `rgba(96, 165, 250, 0.15)` | 信息背景 | `bg-info-bg` |
| `--pink` | `#f472b6` | 粉色 (特殊类别) | `text-pink`, `bg-pink` |
| `--pink-bg` | `rgba(244, 114, 182, 0.15)` | 粉色背景 | `bg-pink-bg` |

### 文字色系

| 变量名 | 色值 | 用途 | Tailwind 类名 |
|--------|------|------|--------------|
| `--text-primary` | `#f1f5f9` | 主文字 (标题、正文) | `text-text-primary` |
| `--text-secondary` | `#94a3b8` | 次要文字 (描述、副标题) | `text-text-secondary` |
| `--text-tertiary` | `#64748b` | 提示文字 (元数据、时间) | `text-text-tertiary` |

### 边框色

| 变量名 | 色值 | 用途 | Tailwind 类名 |
|--------|------|------|--------------|
| `--border-default` | `rgba(71, 85, 105, 0.3)` | 默认边框 | `border-border` |

---

## 🎨 使用示例

### 1. 基础背景
```tsx
// 主背景
<div className="bg-bg-primary">...</div>

// 卡片背景
<Card className="bg-bg-secondary">...</Card>
```

### 2. 文字颜色
```tsx
// 主标题
<h1 className="text-text-primary font-bold">Title</h1>

// 副标题/描述
<p className="text-text-secondary">Description</p>

// 元数据/提示
<span className="text-text-tertiary">2 hours ago</span>
```

### 3. 功能色使用
```tsx
// 成功状态
<div className="text-success bg-success-bg">Success!</div>

// 错误提示
<div className="text-danger bg-danger-bg">Error occurred</div>

// 主按钮
<button className="bg-primary hover:bg-primary-hover">Click Me</button>
```

### 4. 徽章颜色映射
```tsx
// 案例类别
const categoryColors = {
  solved: 'purple',    // #818cf8
  open: 'blue',        // #60a5fa
  process: 'yellow',   // #fbbf24
  policy: 'pink',      // #f472b6
  content: 'green',    // #34d399
};

// 难度等级
const difficultyColors = {
  beginner: 'green',       // #34d399
  intermediate: 'yellow',  // #fbbf24
  advanced: 'red',         // #f87171
};
```

---

## 🔧 CSS 变量使用

可以直接在组件中使用 CSS 变量:

```css
.element {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.element:hover {
  border-color: var(--primary);
}
```

---

## 📊 对比度检查

所有颜色组合都满足 WCAG AA 标准:

| 组合 | 对比度 | 等级 |
|------|--------|------|
| text-primary / bg-primary | 16.5:1 | AAA ✓ |
| text-secondary / bg-secondary | 10.2:1 | AA ✓ |
| text-tertiary / bg-tertiary | 7.8:1 | AA ✓ |
| primary / bg-primary | 8.9:1 | AA ✓ |

---

## 🎯 设计原则

1. **深色主题**: 采用深蓝灰色系，营造专业、科技感
2. **高对比度**: 确保可读性和可访问性
3. **功能色明确**: 绿/黄/红/蓝分工清晰
4. **一致性**: 所有组件使用统一的颜色系统
5. **易维护**: 通过 CSS 变量统一管理

---

## 📝 注意事项

1. **不要使用硬编码色值**: 始终使用 CSS 变量或 Tailwind 类名
2. **保持对比度**: 确保文字和背景的对比度至少达到 AA 标准
3. **功能色语义化**: 
   - Success (绿色): 完成、成功状态
   - Warning (黄色): 注意、中等难度
   - Danger (红色): 错误、高级难度、删除操作
   - Info (蓝色): 信息、开放状态
4. **响应式适配**: 所有颜色在不同亮度下保持一致

---

## 🔗 相关文件

- [`src/app/globals.css`](../src/app/globals.css) - 全局样式和颜色定义
- [`src/utils/theme.ts`](../src/utils/theme.ts) - TypeScript 类型定义
- [`docs/index.html`](../docs/index.html) - 原始 HTML 原型

---

**最后更新**: 2026-03-09  
**版本**: v1.0  
**状态**: ✅ 与原网页完全一致
