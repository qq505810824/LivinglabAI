/**
 * CaseVault 主题配色配置
 * 与原型 index.html 保持一致的深空蓝紫风格
 */

export const theme = {
  colors: {
    // 背景色
    background: {
      primary: '#0f172a',       // ✅ 修正：主背景 - 深蓝灰
      secondary: '#1e293b',     // 次要背景/卡片
      tertiary: '#334155',      // 第三背景
    },
    // 主色
    primary: {
      DEFAULT: '#818cf8',
      hover: '#6366f1',
      light: 'rgba(129, 140, 248, 0.1)',
    },
    // 功能色
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
    info: {
      DEFAULT: '#60a5fa',
      bg: 'rgba(96, 165, 250, 0.15)',
    },
    // 文字色
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      tertiary: '#64748b',
    },
    // 边框色
    border: {
      DEFAULT: 'rgba(71, 85, 105, 0.3)',
      hover: 'rgba(129, 140, 248, 0.3)',
    },
  },
  // 圆角
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
} as const;

/**
 * 徽章颜色映射表
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

export type Theme = typeof theme;
export type BadgeColor = keyof typeof badgeColors.category | keyof typeof badgeColors.difficulty;
