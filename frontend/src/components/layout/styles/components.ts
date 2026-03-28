import styled, { css } from 'styled-components';
import { Card } from 'antd';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  TRANSITIONS,
} from '../../../theme';

export const UploadSectionWrapper = styled.div`
  margin-top: ${SPACING.md};

  .ant-upload-drag {
    border: 2px dashed ${COLORS.border} !important;
    border-radius: ${BORDER_RADIUS.lg} !important;
    padding: ${SPACING.xl} ${SPACING.lg} !important;
    text-align: center !important;
    transition: all ${TRANSITIONS.normal} !important;
    background: ${COLORS.white} !important;
    box-shadow: ${SHADOWS.sm} !important;

    &:hover {
      border-color: ${COLORS.primary} !important;
      background: ${COLORS.primaryLighter} !important;
      box-shadow: ${SHADOWS.md} !important;
      transform: translateY(-2px);

      .ant-upload-drag-icon .anticon {
        transform: scale(1.1);
        color: ${COLORS.primary} !important;
      }
    }

    &.ant-upload-drag-hover {
      border-color: ${COLORS.primary} !important;
      background: ${COLORS.primaryLight} !important;
      border-style: solid !important;
      box-shadow: ${SHADOWS.md} !important;
    }

    .ant-upload-drag-icon {
      margin-bottom: ${SPACING.md} !important;

      .anticon {
        font-size: 52px !important;
        color: ${COLORS.primary} !important;
        transition: all ${TRANSITIONS.normal} !important;
      }
    }

    .ant-upload-text {
      font-size: ${FONT_SIZES.md} !important;
      color: ${COLORS.textPrimary} !important;
      font-weight: ${FONT_WEIGHTS.medium} !important;
      margin-bottom: ${SPACING.xs} !important;
    }

    .ant-upload-hint {
      font-size: ${FONT_SIZES.sm} !important;
      color: ${COLORS.textSecondary} !important;
    }
  }
`;

export const cardStyles = css<{ $isSelected: boolean }>`
  cursor: pointer;
  background: ${props => props.$isSelected
    ? COLORS.primaryLighter
    : COLORS.white} !important;
  border: 2px solid ${props => props.$isSelected ? COLORS.primary : 'transparent'} !important;
  border-radius: ${BORDER_RADIUS.lg} !important;
  padding: ${SPACING.lg} !important;
  margin-bottom: ${SPACING.md} !important;
  transition: all ${TRANSITIONS.normal} !important;
  position: relative !important;
  box-shadow: ${props => props.$isSelected ? SHADOWS.md : SHADOWS.sm} !important;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${COLORS.knowflowGradient};
    opacity: ${props => props.$isSelected ? 1 : 0};
    transition: opacity ${TRANSITIONS.normal};
  }

  &:hover {
    transform: translateY(-4px) translateX(4px) !important;
    box-shadow: ${SHADOWS.lg} !important;
    border-color: ${props => props.$isSelected ? COLORS.primary : COLORS.primaryLight} !important;

    &::before {
      opacity: 1;
    }

    .delete-button {
      opacity: 1 !important;
      visibility: visible !important;
      transform: scale(1) !important;
    }

    .file-icon-wrapper {
      background: ${COLORS.primaryLight} !important;
      transform: scale(1.05);

      .anticon {
        color: ${COLORS.primary} !important;
      }
    }

    .file-path {
      color: ${COLORS.primary} !important;
    }
  }
`;

export const FileCardWrapper = styled.div<{ $isSelected: boolean }>`
  ${cardStyles}
`;

export const KeyValueItem = styled.div`
  margin: ${SPACING.xs} 0 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center;
  padding: ${SPACING.sm} ${SPACING.md} !important;
  border-radius: ${BORDER_RADIUS.md} !important;
  transition: all ${TRANSITIONS.normal} !important;

  &:hover {
    background: ${COLORS.primaryLighter} !important;
    transform: translateX(4px);
  }
`;

export const DetailSection = styled.div`
  margin-top: ${SPACING.lg} !important;
  padding: ${SPACING.lg} !important;
  background: ${COLORS.white} !important;
  border: 1px solid ${COLORS.border} !important;
  border-radius: ${BORDER_RADIUS.lg} !important;
  box-shadow: ${SHADOWS.md} !important;
`;

export const DetailCard = styled(Card)`
  margin-bottom: ${SPACING.md} !important;
  border-radius: ${BORDER_RADIUS.lg} !important;
  border: 1px solid ${COLORS.border} !important;
  box-shadow: ${SHADOWS.md} !important;
  overflow: hidden;

  .ant-card-head {
    border-bottom: 1px solid ${COLORS.borderLight} !important;
    padding: ${SPACING.md} ${SPACING.lg} !important;
    background: ${COLORS.bgLayer} !important;
  }

  .ant-card-head-title {
    font-size: ${FONT_SIZES.md} !important;
    font-weight: ${FONT_WEIGHTS.semibold} !important;
    color: ${COLORS.textPrimary} !important;
  }

  .ant-card-body {
    padding: ${SPACING.lg} !important;
  }
`;

export const InfoGroup = styled.div`
  margin-bottom: ${SPACING.md} !important;
`;

export const InfoRow = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: ${SPACING.sm} ${SPACING.md} !important;
  border-radius: ${BORDER_RADIUS.md} !important;
  transition: all ${TRANSITIONS.normal} !important;

  &:hover {
    background: ${COLORS.primaryLighter} !important;
  }

  .info-label {
    font-weight: ${FONT_WEIGHTS.medium} !important;
    color: ${COLORS.textSecondary} !important;
    font-size: ${FONT_SIZES.sm};
  }

  .info-value {
    font-weight: ${FONT_WEIGHTS.medium} !important;
    color: ${COLORS.textPrimary} !important;
    text-align: right !important;
    word-break: break-all !important;
    font-size: ${FONT_SIZES.sm};
  }
`;

export const ActionButtons = styled.div`
  display: flex !important;
  gap: ${SPACING.sm} !important;
  margin-top: ${SPACING.lg} !important;
  flex-wrap: wrap !important;
`;
