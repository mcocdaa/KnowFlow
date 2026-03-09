import styled, { css } from 'styled-components';
import { Layout as AntLayout, Menu, Tabs } from 'antd';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  TRANSITIONS,
} from '../../../theme';

const { Header, Sider, Content } = AntLayout;

export const buttonStyles = css`
  transition: all ${TRANSITIONS.normal};
  border-radius: ${BORDER_RADIUS.md};
  font-weight: ${FONT_WEIGHTS.medium};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${SHADOWS.buttonHover};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${SHADOWS.button};
  }
`;

export const cardHoverStyles = css`
  transition: all ${TRANSITIONS.normal};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${SHADOWS.cardHover};
  }
`;

export const glassEffectStyles = css`
  background: ${COLORS.glassBg};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${COLORS.glassBorder};
`;

export const StyledLayout = styled(AntLayout)`
  height: 100vh;
  background: ${COLORS.background};
`;

export const StyledHeader = styled(Header)`
  background: ${COLORS.white} !important;
  padding: 0 ${SPACING.lg} !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  height: 68px !important;
  box-shadow: ${SHADOWS.sm} !important;
  z-index: 10 !important;
  border-bottom: 1px solid ${COLORS.borderLight} !important;
  position: relative !important;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${COLORS.gradientPrimary};
    opacity: 0.3;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  font-size: ${FONT_SIZES.xl};
  font-weight: ${FONT_WEIGHTS.bold};
  color: ${COLORS.primary};
  cursor: pointer;
  transition: all ${TRANSITIONS.normal};
  
  &:hover {
    transform: scale(1.02);
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
    background: ${COLORS.gradientPrimary};
    border-radius: ${BORDER_RADIUS.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${COLORS.white};
    font-weight: ${FONT_WEIGHTS.bold};
    font-size: ${FONT_SIZES.lg};
    box-shadow: ${SHADOWS.button};
    transition: all ${TRANSITIONS.normal};
  }
  
  &:hover .logo-icon {
    box-shadow: ${SHADOWS.buttonHover};
    transform: scale(1.05);
  }
`;

export const StyledSider = styled(Sider)`
  background: ${COLORS.sidebarBg} !important;
  overflow: auto !important;
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.04) !important;
  border-right: 1px solid ${COLORS.borderLight} !important;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
`;

export const StyledMenu = styled(Menu)`
  background: transparent !important;
  border-right: none !important;
  height: 100% !important;
  padding: ${SPACING.sm} !important;
  
  .ant-menu-item {
    margin: ${SPACING.xs} ${SPACING.sm} !important;
    border-radius: ${BORDER_RADIUS.sm} !important;
    height: 42px !important;
    line-height: 42px !important;
    transition: all ${TRANSITIONS.normal} !important;
    font-weight: ${FONT_WEIGHTS.medium} !important;
    
    &:hover {
      background: ${COLORS.primaryLighter} !important;
      color: ${COLORS.text} !important;
      transform: translateX(4px);
    }
    
    &.ant-menu-item-selected {
      background: ${COLORS.primaryLight} !important;
      color: ${COLORS.primary} !important;
      font-weight: ${FONT_WEIGHTS.semibold} !important;
      border-left: 0 !important;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15) !important;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: ${COLORS.gradientPrimary};
        border-radius: 0 2px 2px 0;
      }
    }
  }
  
  .ant-menu-submenu-title {
    margin: ${SPACING.xs} ${SPACING.sm} !important;
    border-radius: ${BORDER_RADIUS.sm} !important;
    height: 40px !important;
    line-height: 40px !important;
    transition: all ${TRANSITIONS.normal} !important;
    font-weight: ${FONT_WEIGHTS.medium} !important;
    
    &:hover {
      background: ${COLORS.primaryLighter} !important;
      color: ${COLORS.primary} !important;
    }
  }
  
  .ant-menu-submenu {
    .ant-menu {
      background: transparent !important;
      
      .ant-menu-item {
        margin-left: ${SPACING.md} !important;
        padding-left: ${SPACING.lg} !important;
        
        &::before {
          content: '';
          position: absolute;
          left: ${SPACING.sm};
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${COLORS.border};
          transition: all ${TRANSITIONS.fast};
        }
        
        &:hover::before,
        &.ant-menu-item-selected::before {
          background: ${COLORS.primary};
        }
      }
    }
  }
  
  .ant-menu-submenu-open > .ant-menu-submenu-title {
    color: ${COLORS.primary} !important;
  }
`;

export const StyledContent = styled(Content)`
  padding: ${SPACING.lg} !important;
  overflow: auto !important;
  background: ${COLORS.background} !important;
  min-height: calc(100vh - 68px) !important;
`;

export const StyledTabs = styled(Tabs)`
  margin-bottom: ${SPACING.lg} !important;
  
  .ant-tabs-nav {
    margin-bottom: ${SPACING.lg} !important;
    
    &::before {
      border-bottom: 1px solid ${COLORS.borderLight} !important;
    }
  }
  
  .ant-tabs-tab {
    font-size: ${FONT_SIZES.md} !important;
    padding: ${SPACING.sm} ${SPACING.lg} !important;
    margin-right: ${SPACING.sm} !important;
    transition: all ${TRANSITIONS.normal} !important;
    border-radius: ${BORDER_RADIUS.md} ${BORDER_RADIUS.md} 0 0 !important;
    font-weight: ${FONT_WEIGHTS.medium} !important;
    color: ${COLORS.textSecondary} !important;
    
    &:hover {
      color: ${COLORS.primary} !important;
      background: ${COLORS.primaryLighter} !important;
    }
  }
  
  .ant-tabs-tab-active {
    color: ${COLORS.primary} !important;
    font-weight: ${FONT_WEIGHTS.semibold} !important;
    background: ${COLORS.primaryLight} !important;
    
    .ant-tabs-tab-btn {
      color: ${COLORS.primary} !important;
    }
  }
  
  .ant-tabs-ink-bar {
    background: ${COLORS.gradientPrimary} !important;
    height: 3px !important;
    border-radius: 2px !important;
  }
`;

export const ResultsSection = styled.div`
  margin-top: ${SPACING.lg};
  
  h3 {
    color: ${COLORS.text};
    font-weight: ${FONT_WEIGHTS.semibold};
    margin-bottom: ${SPACING.md};
  }
`;

export {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  TRANSITIONS,
};
