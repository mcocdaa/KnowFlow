import styled, { createGlobalStyle } from 'styled-components';
import { Input, Button } from 'antd';
import { css } from 'styled-components';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  TRANSITIONS,
  FONT_FAMILY,
} from '../../../theme';

const { Search } = Input;

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: ${FONT_FAMILY};
    background-color: ${COLORS.bgPage};
    color: ${COLORS.textPrimary};
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
      background: ${COLORS.textSecondary};
    }
  }

  ::selection {
    background: ${COLORS.primaryLight};
    color: ${COLORS.primary};
  }

  .gradient-decoration,
  .gradient-decoration-bottom,
  .gradient-decoration-center {
    display: none !important;
  }
`;

export const SearchSectionWrapper = styled.div`
  margin-bottom: ${SPACING.lg};
`;

export const StyledSearch = styled(Search)`
  width: 100% !important;

  .ant-input-wrapper {
    display: flex !important;
    border-radius: ${BORDER_RADIUS.sm} !important;
    overflow: hidden !important;
    box-shadow: none !important;
    transition: all ${TRANSITIONS.fast} !important;
  }

  .ant-input-affix-wrapper {
    border-radius: ${BORDER_RADIUS.sm} 0 0 ${BORDER_RADIUS.sm} !important;
    border: 1px solid ${COLORS.border} !important;
    border-right: none !important;
    padding: 0 ${SPACING.sm} !important;
    height: 40px !important;
    background: ${COLORS.white} !important;
    transition: all ${TRANSITIONS.fast} !important;

    &:hover {
      border-color: ${COLORS.primary} !important;
    }

    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${COLORS.primary} !important;
      box-shadow: 0 0 0 2px ${COLORS.primaryLight} !important;
    }

    .ant-input {
      font-size: ${FONT_SIZES.sm} !important;

      &::placeholder {
        color: ${COLORS.textDisabled} !important;
      }
    }

    .ant-input-prefix {
      color: ${COLORS.textSecondary} !important;
      margin-right: ${SPACING.xs} !important;
    }
  }

  .ant-input-search-button {
    border-radius: 0 ${BORDER_RADIUS.sm} ${BORDER_RADIUS.sm} 0 !important;
    background: ${COLORS.knowflowGradient} !important;
    border: none !important;
    height: 40px !important;
    padding: 0 ${SPACING.md} !important;
    font-weight: ${FONT_WEIGHTS.medium} !important;
    transition: all ${TRANSITIONS.fast} !important;

    &:hover {
      background: ${COLORS.knowflowGradientHover} !important;
    }
  }
`;

export const StyledSelect = styled.div`
  .ant-select {
    min-width: 140px !important;

    .ant-select-selector {
      border-radius: ${BORDER_RADIUS.sm} !important;
      border: 1px solid ${COLORS.border} !important;
      height: 40px !important;
      padding: 0 ${SPACING.sm} !important;
      background: ${COLORS.white} !important;
      transition: all ${TRANSITIONS.fast} !important;
      box-shadow: none !important;

      &:hover {
        border-color: ${COLORS.primary} !important;
      }
    }

    &.ant-select-focused .ant-select-selector {
      border-color: ${COLORS.primary} !important;
      box-shadow: 0 0 0 2px ${COLORS.primaryLight} !important;
    }

    .ant-select-selection-item {
      line-height: 38px !important;
      font-weight: ${FONT_WEIGHTS.regular} !important;
    }

    .ant-select-selection-placeholder {
      line-height: 38px !important;
      color: ${COLORS.textDisabled} !important;
    }
  }
`;

export const buttonStyles = css`
  transition: all ${TRANSITIONS.fast};
  border-radius: ${BORDER_RADIUS.sm};
  font-weight: ${FONT_WEIGHTS.medium};
`;

export const StyledButton = styled(Button)`
  ${buttonStyles}
`;

export const PrimaryButton = styled(Button)`
  ${buttonStyles}
  background: ${COLORS.knowflowGradient} !important;
  border: none !important;
  color: ${COLORS.white} !important;
  font-weight: ${FONT_WEIGHTS.medium} !important;

  &:hover {
    background: ${COLORS.knowflowGradientHover} !important;
    color: ${COLORS.white} !important;
  }

  &:active {
    background: ${COLORS.primaryActive} !important;
  }
`;

export const GhostButton = styled(Button)`
  ${buttonStyles}
  background: transparent !important;
  border: 1px solid ${COLORS.primary} !important;
  color: ${COLORS.primary} !important;

  &:hover {
    background: ${COLORS.primaryLight} !important;
    border-color: ${COLORS.primaryHover} !important;
    color: ${COLORS.primaryHover} !important;
  }
`;
