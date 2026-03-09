import styled, { createGlobalStyle } from 'styled-components';
import { Input, Button } from 'antd';
import { css } from 'styled-components';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  TRANSITIONS,
} from '../../../theme';

const { Search } = Input;

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background-color: ${COLORS.background};
    color: ${COLORS.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  * {
    box-sizing: border-box;
  }
  
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${COLORS.border};
    border-radius: 3px;
    
    &:hover {
      background: ${COLORS.textLight};
    }
  }
  
  ::selection {
    background: ${COLORS.primaryLight};
    color: ${COLORS.primary};
  }
`;

export const SearchSectionWrapper = styled.div`
  margin-bottom: ${SPACING.lg};
`;

export const StyledSearch = styled(Search)`
  width: 100% !important;
  
  .ant-input-wrapper {
    display: flex !important;
    border-radius: ${BORDER_RADIUS.lg} !important;
    overflow: hidden !important;
    box-shadow: ${SHADOWS.md} !important;
    transition: all ${TRANSITIONS.normal} !important;
    
    &:hover {
      box-shadow: ${SHADOWS.lg} !important;
    }
    
    &:focus-within {
      box-shadow: ${SHADOWS.input}, ${SHADOWS.lg} !important;
    }
  }
  
  .ant-input-affix-wrapper {
    border-radius: ${BORDER_RADIUS.lg} 0 0 ${BORDER_RADIUS.lg} !important;
    border: 2px solid ${COLORS.border} !important;
    border-right: none !important;
    padding: 0 ${SPACING.md} !important;
    height: 48px !important;
    background: ${COLORS.white} !important;
    transition: all ${TRANSITIONS.normal} !important;
    
    &:hover {
      border-color: ${COLORS.primaryLight} !important;
    }
    
    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${COLORS.primary} !important;
      box-shadow: none !important;
    }
    
    .ant-input {
      font-size: ${FONT_SIZES.md} !important;
      
      &::placeholder {
        color: ${COLORS.textPlaceholder} !important;
      }
    }
    
    .ant-input-prefix {
      color: ${COLORS.textLight} !important;
      margin-right: ${SPACING.sm} !important;
    }
  }
  
  .ant-input-search-button {
    border-radius: 0 ${BORDER_RADIUS.lg} ${BORDER_RADIUS.lg} 0 !important;
    background: ${COLORS.gradientPrimary} !important;
    border: none !important;
    height: 48px !important;
    padding: 0 ${SPACING.lg} !important;
    font-weight: ${FONT_WEIGHTS.semibold} !important;
    transition: all ${TRANSITIONS.normal} !important;
    
    &:hover {
      background: ${COLORS.gradientPrimaryHover} !important;
      transform: scale(1.02);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
`;

export const StyledSelect = styled.div`
  .ant-select {
    min-width: 140px !important;
    
    .ant-select-selector {
      border-radius: ${BORDER_RADIUS.md} !important;
      border: 2px solid ${COLORS.border} !important;
      height: 44px !important;
      padding: 0 ${SPACING.md} !important;
      background: ${COLORS.white} !important;
      transition: all ${TRANSITIONS.normal} !important;
      box-shadow: none !important;
      
      &:hover {
        border-color: ${COLORS.primaryLight} !important;
      }
    }
    
    &.ant-select-focused .ant-select-selector {
      border-color: ${COLORS.primary} !important;
      box-shadow: ${SHADOWS.input} !important;
    }
    
    .ant-select-selection-item {
      line-height: 40px !important;
      font-weight: ${FONT_WEIGHTS.medium} !important;
    }
    
    .ant-select-selection-placeholder {
      line-height: 40px !important;
      color: ${COLORS.textPlaceholder} !important;
    }
  }
`;

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

export const StyledButton = styled(Button)`
  ${buttonStyles}
`;

export const PrimaryButton = styled(Button)`
  ${buttonStyles}
  background: ${COLORS.gradientPrimary} !important;
  border: none !important;
  color: ${COLORS.white} !important;
  box-shadow: ${SHADOWS.button} !important;
  font-weight: ${FONT_WEIGHTS.semibold} !important;
  
  &:hover {
    background: ${COLORS.gradientPrimaryHover} !important;
    color: ${COLORS.white} !important;
    box-shadow: ${SHADOWS.buttonHover} !important;
  }
  
  &:active {
    background: ${COLORS.primaryActive} !important;
    box-shadow: ${SHADOWS.button} !important;
  }
`;

export const GhostButton = styled(Button)`
  ${buttonStyles}
  background: transparent !important;
  border: 2px solid ${COLORS.primary} !important;
  color: ${COLORS.primary} !important;
  
  &:hover {
    background: ${COLORS.primaryLight} !important;
    border-color: ${COLORS.primaryHover} !important;
    color: ${COLORS.primaryHover} !important;
  }
`;
