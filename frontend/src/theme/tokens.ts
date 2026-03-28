export const FLOW_COLORS = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryActive: '#1E40AF',
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  primaryLighter: 'rgba(37, 99, 235, 0.05)',
  primaryBg: '#EEF2FF',
  gradientPrimary: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',

  knowflowStart: '#2563EB',
  knowflowEnd: '#7C3AED',
  knowflowGradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
  knowflowGradientHover: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',

  success: '#10B981',
  successHover: '#059669',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningHover: '#D97706',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#EF4444',
  dangerHover: '#DC2626',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.1)',

  bgPage: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgLayer: '#F1F5F9',
  backgroundAlt: '#F1F5F9',

  textTitle: '#0F172A',
  textPrimary: '#334155',
  textSecondary: '#64748B',
  textDisabled: '#94A3B8',
  text: '#334155',
  textLight: '#94A3B8',
  textPlaceholder: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  white: '#FFFFFF',
  sidebarBg: '#1E293B',

  violet: '#7C3AED',

  glassBg: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(99, 102, 241, 0.15)',
};

export const FLOW_SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const FLOW_BORDER_RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const FLOW_FONT_SIZES = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '24px',
};

export const FLOW_FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
};

export const FLOW_SHADOWS = {
  sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  card: '0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  cardHover: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  button: '0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  buttonHover: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  input: '0 0 0 2px rgba(37, 99, 235, 0.2)',
};

export const FLOW_TRANSITIONS = {
  fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.35s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const FLOW_FONT_FAMILY =
  'Inter, PingFang SC, Microsoft YaHei, sans-serif';

export const designTokens = {
  colors: FLOW_COLORS,
  spacing: FLOW_SPACING,
  borderRadius: FLOW_BORDER_RADIUS,
  fontSizes: FLOW_FONT_SIZES,
  fontWeights: FLOW_FONT_WEIGHTS,
  shadows: FLOW_SHADOWS,
  transitions: FLOW_TRANSITIONS,
  fontFamily: FLOW_FONT_FAMILY,
};

export {
  FLOW_COLORS as COLORS,
  FLOW_SPACING as SPACING,
  FLOW_BORDER_RADIUS as BORDER_RADIUS,
  FLOW_FONT_SIZES as FONT_SIZES,
  FLOW_FONT_WEIGHTS as FONT_WEIGHTS,
  FLOW_SHADOWS as SHADOWS,
  FLOW_TRANSITIONS as TRANSITIONS,
  FLOW_FONT_FAMILY as FONT_FAMILY,
};

export default designTokens;
