import styled from 'styled-components';
import { Layout as AntLayout, Menu, Tabs } from 'antd';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  TRANSITIONS,
} from '../../../theme';
import { buttonStyles, cardHoverStyles, glassEffectStyles } from './shared';

const { Header, Sider, Content } = AntLayout;

export { buttonStyles, cardHoverStyles, glassEffectStyles };

export const StyledLayout = styled(AntLayout)`
  height: 100vh;
  background: ${COLORS.bgPage};
`;

export const StyledHeader = styled(Header)`
  background: ${COLORS.white} !important;
  padding: 0 ${SPACING.lg} !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  height: 64px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  z-index: 10 !important;
  border-bottom: 1px solid ${COLORS.border} !important;
  position: relative !important;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  font-size: ${FONT_SIZES.md};
  font-weight: ${FONT_WEIGHTS.semibold};
  color: ${COLORS.textTitle};
  cursor: pointer;
  transition: all ${TRANSITIONS.normal};

  .logo-icon {
    width: 32px;
    height: 32px;
    background: ${COLORS.knowflowGradient};
    border-radius: ${BORDER_RADIUS.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${COLORS.white};
    font-weight: ${FONT_WEIGHTS.semibold};
    font-size: ${FONT_SIZES.sm};
    transition: all ${TRANSITIONS.normal};
  }
`;

export const StyledSider = styled(Sider)`
  background: ${COLORS.sidebarBg} !important;
  overflow: auto !important;
  box-shadow: none !important;
  border-right: none !important;

  &::-webkit-scrollbar {
    width: 6px;
  }
`;

export const StyledMenu = styled(Menu)`
  background: transparent !important;
  border-right: none !important;
  height: 100% !important;
  padding: ${SPACING.sm} !important;

  .ant-menu-item {
    margin: ${SPACING.xs} !important;
    border-radius: ${BORDER_RADIUS.sm} !important;
    height: 40px !important;
    line-height: 40px !important;
    transition: all ${TRANSITIONS.fast} !important;
    font-weight: ${FONT_WEIGHTS.regular} !important;
    color: rgba(255, 255, 255, 0.8) !important;

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: ${COLORS.white} !important;
    }

    &.ant-menu-item-selected {
      background: ${COLORS.primary} !important;
      color: ${COLORS.white} !important;
      font-weight: ${FONT_WEIGHTS.medium} !important;
      border-left: 0 !important;
    }
  }

  .ant-menu-submenu-title {
    margin: ${SPACING.xs} !important;
    border-radius: ${BORDER_RADIUS.sm} !important;
    height: 40px !important;
    line-height: 40px !important;
    transition: all ${TRANSITIONS.fast} !important;
    font-weight: ${FONT_WEIGHTS.regular} !important;
    color: rgba(255, 255, 255, 0.8) !important;

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: ${COLORS.white} !important;
    }
  }

  .ant-menu-submenu {
    .ant-menu {
      background: transparent !important;

      .ant-menu-item {
        margin-left: ${SPACING.xs} !important;
        padding-left: ${SPACING.md} !important;
      }
    }
  }

  .ant-menu-submenu-open > .ant-menu-submenu-title {
    color: ${COLORS.white} !important;
  }
`;

export const StyledContent = styled(Content)`
  padding: ${SPACING.lg} !important;
  overflow: auto !important;
  background: ${COLORS.bgPage} !important;
  min-height: calc(100vh - 64px) !important;
`;

export const StyledTabs = styled(Tabs)`
  margin-bottom: ${SPACING.lg} !important;

  .ant-tabs-nav {
    margin-bottom: ${SPACING.lg} !important;

    &::before {
      border-bottom: 1px solid ${COLORS.border} !important;
    }
  }

  .ant-tabs-tab {
    font-size: ${FONT_SIZES.sm} !important;
    padding: ${SPACING.sm} ${SPACING.md} !important;
    margin-right: ${SPACING.xs} !important;
    transition: all ${TRANSITIONS.fast} !important;
    border-radius: ${BORDER_RADIUS.sm} ${BORDER_RADIUS.sm} 0 0 !important;
    font-weight: ${FONT_WEIGHTS.regular} !important;
    color: ${COLORS.textSecondary} !important;

    &:hover {
      color: ${COLORS.primary} !important;
      background: ${COLORS.primaryLighter} !important;
    }
  }

  .ant-tabs-tab-active {
    color: ${COLORS.primary} !important;
    font-weight: ${FONT_WEIGHTS.medium} !important;

    .ant-tabs-tab-btn {
      color: ${COLORS.primary} !important;
    }
  }

  .ant-tabs-ink-bar {
    background: ${COLORS.primary} !important;
    height: 2px !important;
  }
`;

export const ResultsSection = styled.div`
  margin-top: ${SPACING.lg};

  h3 {
    color: ${COLORS.textTitle};
    font-weight: ${FONT_WEIGHTS.semibold};
    margin-bottom: ${SPACING.md};
  }
`;
