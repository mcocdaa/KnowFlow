import React from 'react';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styled, { css } from 'styled-components';
import type { KnowledgeItem } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../theme';

interface FileCardProps {
  item: KnowledgeItem;
  isSelected: boolean;
  onSelect: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
  getFileIcon: (fileType?: string) => React.ReactNode;
}

const cardStyles = css<{ $isSelected: boolean }>`
  cursor: pointer;
  background: ${props => props.$isSelected 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)' 
    : COLORS.white} !important;
  border: 2px solid ${props => props.$isSelected ? COLORS.primary : 'transparent'} !important;
  border-radius: ${BORDER_RADIUS.lg} !important;
  padding: ${SPACING.lg} !important;
  margin-bottom: ${SPACING.md} !important;
  transition: all ${TRANSITIONS.normal} !important;
  position: relative !important;
  box-shadow: ${props => props.$isSelected ? SHADOWS.card : SHADOWS.sm} !important;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.violet} 100%);
    opacity: ${props => props.$isSelected ? 1 : 0};
    transition: opacity ${TRANSITIONS.normal};
  }
  
  &:hover {
    transform: translateY(-4px) translateX(4px) !important;
    box-shadow: ${SHADOWS.cardHover} !important;
    border-color: ${props => props.$isSelected ? COLORS.primary : 'rgba(99, 102, 241, 0.2)'} !important;
    
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

const FileCardWrapper = styled.div<{ $isSelected: boolean }>`
  ${cardStyles}
`;

const FileHeader = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
`;

const FileIconWrapper = styled.div<{ $isSelected: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${BORDER_RADIUS.md};
  background: ${props => props.$isSelected ? COLORS.primaryLight : COLORS.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${TRANSITIONS.normal};
  flex-shrink: 0;
  
  .anticon {
    font-size: 20px;
    color: ${props => props.$isSelected ? COLORS.primary : COLORS.textSecondary};
    transition: all ${TRANSITIONS.normal};
  }
`;

const FileInfo = styled.div`
  flex: 1;
  margin-left: ${SPACING.md};
  min-width: 0;
`;

const FilePath = styled.div<{ $isSelected: boolean }>`
  font-weight: ${FONT_WEIGHTS.semibold} !important;
  font-size: ${FONT_SIZES.md} !important;
  color: ${props => props.$isSelected ? COLORS.primary : COLORS.text} !important;
  word-break: break-all !important;
  line-height: 1.4 !important;
  transition: color ${TRANSITIONS.normal};
`;

const DeleteButton = styled(Button)`
  opacity: 0 !important;
  visibility: hidden !important;
  transform: scale(0.8) !important;
  transition: all ${TRANSITIONS.normal} !important;
  border-radius: ${BORDER_RADIUS.sm} !important;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${COLORS.dangerLight} !important;
    color: ${COLORS.danger} !important;
  }
`;

const FileCard: React.FC<FileCardProps> = ({
  item,
  isSelected,
  onSelect,
  onDelete,
  getFileIcon,
}) => {
  const displayPath = item.keyValues?.['file_path'] || item.name || '未命名文件';
  const displayType = item.keyValues?.['file_type'] || '';
  
  return (
    <FileCardWrapper 
      $isSelected={isSelected}
      onClick={() => onSelect(item)}
    >
      <FileHeader key={`file-header-${item.id}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', flex: 1 }}>
          <FileIconWrapper $isSelected={isSelected}>
            {getFileIcon(displayType)}
          </FileIconWrapper>
          <FileInfo>
            <FilePath $isSelected={isSelected}>{displayPath}</FilePath>
          </FileInfo>
        </div>
        <Popconfirm
          title="确定要删除这个文件吗？"
          description="此操作不可恢复"
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(item.id);
          }}
          okText="确定"
          cancelText="取消"
        >
          <DeleteButton 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            className="delete-button"
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </FileHeader>
    </FileCardWrapper>
  );
};

export default FileCard;
