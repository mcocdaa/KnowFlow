import type { ThemeConfig } from 'antd';
import { COLORS, SHADOWS, TRANSITIONS, FONT_FAMILY } from './tokens';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: COLORS.primary,
    colorPrimaryHover: COLORS.primaryHover,
    colorPrimaryActive: COLORS.primaryActive,
    colorPrimaryBg: COLORS.primaryBg,
    colorPrimaryBgHover: COLORS.primaryLight,

    colorBgContainer: COLORS.bgCard,
    colorBgElevated: COLORS.white,
    colorBgLayout: COLORS.bgPage,
    colorBgSpotlight: COLORS.bgLayer,

    colorText: COLORS.textPrimary,
    colorTextSecondary: COLORS.textSecondary,
    colorTextTertiary: COLORS.textDisabled,

    colorBorder: COLORS.border,
    colorBorderSecondary: COLORS.borderLight,

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

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    boxShadow: SHADOWS.sm,
    boxShadowSecondary: SHADOWS.md,

    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 18,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    lineHeight: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.5,

    motionDurationFast: TRANSITIONS.fast,
    motionDurationMid: TRANSITIONS.normal,
    motionDurationSlow: TRANSITIONS.slow,

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

    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    fontFamily: FONT_FAMILY,
  },
  components: {
    Button: {
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 6,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      paddingContentHorizontal: 16,
      fontWeight: 500,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },

    Input: {
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 6,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      paddingInline: 12,
    },

    InputNumber: {
      borderRadius: 6,
      controlHeight: 40,
    },

    Select: {
      borderRadius: 6,
      controlHeight: 40,
      optionSelectedBg: COLORS.primaryLight,
      optionActiveBg: COLORS.primaryLighter,
    },

    Card: {
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      paddingLG: 24,
      boxShadowTertiary: SHADOWS.sm,
    },

    Drawer: {
      paddingLG: 24,
    },

    Modal: {
      borderRadiusLG: 12,
      paddingContentHorizontalLG: 24,
    },

    Tabs: {
      borderRadiusLG: 6,
      horizontalItemPadding: '12px 16px',
      horizontalItemPaddingLG: '16px 20px',
      inkBarColor: COLORS.primary,
      itemSelectedColor: COLORS.primary,
      itemHoverColor: COLORS.primaryHover,
    },

    Menu: {
      borderRadiusLG: 8,
      itemBorderRadius: 6,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 12,
      itemSelectedBg: COLORS.primary,
      itemSelectedColor: COLORS.white,
      itemHoverBg: 'rgba(255,255,255,0.1)',
      itemHoverColor: COLORS.white,
      subMenuItemBg: 'transparent',
    },

    Upload: {
      borderRadiusLG: 12,
    },

    Message: {
      borderRadiusLG: 8,
    },

    Tag: {
      borderRadiusSM: 9999,
    },

    Table: {
      borderRadiusLG: 12,
      headerBg: COLORS.bgPage,
      rowHoverBg: COLORS.primaryLighter,
    },

    Dropdown: {
      borderRadiusLG: 8,
      paddingBlock: 8,
    },

    Popconfirm: {
      borderRadiusLG: 8,
    },

    Tooltip: {
      borderRadiusLG: 6,
    },

    Layout: {
      headerBg: COLORS.white,
      headerHeight: 64,
      siderBg: COLORS.sidebarBg,
      bodyBg: COLORS.bgPage,
    },

    Divider: {
      colorSplit: COLORS.border,
    },

    Empty: {
      colorText: COLORS.textDisabled,
      colorTextDisabled: COLORS.textDisabled,
    },

    Form: {
      labelColor: COLORS.textSecondary,
      labelFontSize: 14,
      labelHeight: 32,
      verticalLabelPadding: '0 0 8px',
    },
  },
};
