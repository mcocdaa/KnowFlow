/**
 * KnowFlow 现代化主题配置
 * 
 * 配色方案说明：
 * - 主色调：蓝紫渐变 (Indigo -> Violet)
 * - 背景：优雅柔和的浅灰/米白
 * - 辅助色：成功绿、警告橙、危险红
 * - 强调色：渐变效果用于主要操作按钮
 */

import type { ThemeConfig } from 'antd';

// ============================================
// 设计令牌 (Design Tokens)
// ============================================

export const COLORS = {
  // 主色调 - 蓝紫渐变系
  primary: '#6366F1',           // 靛蓝色 (Indigo 500)
  primaryHover: '#4F46E5',      // 深靛蓝 (Indigo 600)
  primaryActive: '#4338CA',     // 更深靛蓝 (Indigo 700)
  primaryLight: 'rgba(99, 102, 241, 0.1)',
  primaryLighter: 'rgba(99, 102, 241, 0.05)',
  primaryBg: '#EEF2FF',         // 靛蓝背景 (Indigo 50)
  
  // 紫罗兰辅助色
  violet: '#8B5CF6',            // 紫罗兰 (Violet 500)
  violetLight: 'rgba(139, 92, 246, 0.1)',
  
  // 渐变色
  gradientPrimary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  gradientPrimaryHover: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  gradientHeader: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
  
  // 背景色系 - 优雅柔和
  background: '#F8FAFC',        // 主背景 (Slate 50)
  backgroundAlt: '#F1F5F9',     // 备选背景 (Slate 100)
  backgroundWarm: '#FFFBFE',    // 暖白背景
  sidebarBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  
  // 文字色系
  text: '#1E293B',              // 主文字 (Slate 800)
  textSecondary: '#64748B',     // 次要文字 (Slate 500)
  textLight: '#94A3B8',         // 浅色文字 (Slate 400)
  textPlaceholder: '#CBD5E1',   // 占位符文字 (Slate 300)
  
  // 边框色系
  border: '#E2E8F0',            // 主边框 (Slate 200)
  borderLight: '#F1F5F9',       // 浅边框 (Slate 100)
  borderFocus: '#6366F1',       // 聚焦边框
  
  // 状态色
  white: '#FFFFFF',
  danger: '#EF4444',            // 红色 (Red 500)
  dangerHover: '#DC2626',       // 深红 (Red 600)
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  success: '#10B981',           // 绿色 (Emerald 500)
  successHover: '#059669',      // 深绿 (Emerald 600)
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',           // 橙色 (Amber 500)
  warningHover: '#D97706',      // 深橙 (Amber 600)
  warningLight: 'rgba(245, 158, 11, 0.1)',
  info: '#3B82F6',              // 信息蓝 (Blue 500)
  infoLight: 'rgba(59, 130, 246, 0.1)',
  
  // 阴影色
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowHover: 'rgba(0, 0, 0, 0.08)',
  shadowCard: 'rgba(99, 102, 241, 0.08)',
  shadowModal: 'rgba(0, 0, 0, 0.15)',
  
  // 毛玻璃效果
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

export const BORDER_RADIUS = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
};

export const FONT_SIZES = {
  xs: '12px',
  sm: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  xxl: '24px',
  xxxl: '32px',
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  card: '0 4px 20px -2px rgba(99, 102, 241, 0.1)',
  cardHover: '0 12px 28px -8px rgba(99, 102, 241, 0.15)',
  button: '0 2px 8px rgba(99, 102, 241, 0.25)',
  buttonHover: '0 6px 16px rgba(99, 102, 241, 0.35)',
  input: '0 0 0 3px rgba(99, 102, 241, 0.15)',
  drawer: '-8px 0 40px rgba(0, 0, 0, 0.12)',
};

export const TRANSITIONS = {
  fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ============================================
// Ant Design 主题配置
// ============================================

export const antdTheme: ThemeConfig = {
  token: {
    // 品牌色
    colorPrimary: COLORS.primary,
    colorPrimaryHover: COLORS.primaryHover,
    colorPrimaryActive: COLORS.primaryActive,
    colorPrimaryBg: COLORS.primaryBg,
    colorPrimaryBgHover: COLORS.primaryLight,
    
    // 背景色
    colorBgContainer: COLORS.cardBg,
    colorBgElevated: COLORS.white,
    colorBgLayout: COLORS.background,
    colorBgSpotlight: COLORS.backgroundAlt,
    
    // 文字色
    colorText: COLORS.text,
    colorTextSecondary: COLORS.textSecondary,
    colorTextTertiary: COLORS.textLight,
    colorTextQuaternary: COLORS.textPlaceholder,
    
    // 边框
    colorBorder: COLORS.border,
    colorBorderSecondary: COLORS.borderLight,
    
    // 状态色
    colorSuccess: COLORS.success,
    colorSuccessHover: COLORS.successHover,
    colorSuccessBg: COLORS.successLight,
    colorWarning: COLORS.warning,
    colorWarningHover: COLORS.warningHover,
    colorWarningBg: COLORS.warningLight,
    colorError: COLORS.danger,
    colorErrorHover: COLORS.dangerHover,
    colorErrorBg: COLORS.dangerLight,
    colorInfo: COLORS.info,
    colorInfoBg: COLORS.infoLight,
    
    // 圆角
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    
    // 阴影
    boxShadow: SHADOWS.md,
    boxShadowSecondary: SHADOWS.lg,
    
    // 字体
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // 行高
    lineHeight: 1.5714285714285714,
    lineHeightLG: 1.5,
    lineHeightSM: 1.6666666666666667,
    
    // 动画
    motionDurationFast: TRANSITIONS.fast,
    motionDurationMid: TRANSITIONS.normal,
    motionDurationSlow: TRANSITIONS.slow,
    
    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
    
    // 控件
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    // 按钮组件
    Button: {
      borderRadius: 10,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      paddingContentHorizontal: 20,
      fontWeight: 500,
      primaryShadow: SHADOWS.button,
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    
    // 输入框组件
    Input: {
      borderRadius: 10,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      paddingInline: 16,
      activeShadow: SHADOWS.input,
      hoverBorderColor: COLORS.primary,
    },
    
    // 搜索框
    InputNumber: {
      borderRadius: 10,
      controlHeight: 44,
    },
    
    // 选择器
    Select: {
      borderRadius: 10,
      controlHeight: 44,
      optionSelectedBg: COLORS.primaryLight,
      optionActiveBg: COLORS.primaryLighter,
    },
    
    // 卡片
    Card: {
      borderRadiusLG: 16,
      borderRadiusSM: 12,
      paddingLG: 24,
      boxShadowTertiary: SHADOWS.card,
    },
    
    // 抽屉
    Drawer: {
      paddingLG: 24,
    },
    
    // 模态框
    Modal: {
      borderRadiusLG: 20,
      paddingContentHorizontalLG: 24,
    },
    
    // 标签页
    Tabs: {
      borderRadiusLG: 10,
      horizontalItemPadding: '12px 20px',
      horizontalItemPaddingLG: '16px 24px',
      inkBarColor: COLORS.primary,
      itemSelectedColor: COLORS.primary,
      itemHoverColor: COLORS.primaryHover,
    },
    
    // 菜单
    Menu: {
      borderRadiusLG: 10,
      itemBorderRadius: 8,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      itemSelectedBg: COLORS.primaryLight,
      itemSelectedColor: COLORS.primary,
      itemHoverBg: COLORS.primaryLighter,
      itemHoverColor: COLORS.text,
      subMenuItemBg: 'transparent',
    },
    
    // 上传
    Upload: {
      borderRadiusLG: 16,
    },
    
    // 消息提示
    Message: {
      borderRadiusLG: 12,
    },
    
    // 标签
    Tag: {
      borderRadiusSM: 6,
    },
    
    // 表格
    Table: {
      borderRadiusLG: 16,
      headerBg: COLORS.backgroundAlt,
      rowHoverBg: COLORS.primaryLighter,
    },
    
    // 下拉菜单
    Dropdown: {
      borderRadiusLG: 12,
      paddingBlock: 8,
    },
    
    // 确认框
    Popconfirm: {
      borderRadiusLG: 12,
    },
    
    // 工具提示
    Tooltip: {
      borderRadiusLG: 8,
    },
    
    // 头部
    Layout: {
      headerBg: COLORS.white,
      headerHeight: 68,
      siderBg: COLORS.sidebarBg,
      bodyBg: COLORS.background,
    },
    
    // 分割线
    Divider: {
      colorSplit: COLORS.border,
    },
    
    // 空状态
    Empty: {
      colorText: COLORS.textLight,
      colorTextDisabled: COLORS.textPlaceholder,
    },
    
    // 表单
    Form: {
      labelColor: COLORS.textSecondary,
      labelFontSize: 14,
      labelHeight: 32,
      verticalLabelPadding: '0 0 8px',
    },
  },
};

// ============================================
// 导出便捷组合
// ============================================

export const theme = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  antd: antdTheme,
};

export default theme;
