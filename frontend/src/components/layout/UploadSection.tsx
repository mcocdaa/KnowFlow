import React from 'react';
import { Button, Upload } from 'antd';
import { CloudUploadOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS, SPACING } from '../../theme';

const UploadContainer = styled.div`
  margin-top: ${SPACING.md};
`;

const UploadWrapper = styled.div`
  &.upload-enhanced .ant-upload-drag {
    border: 2px dashed rgba(99, 102, 241, 0.3);
    border-radius: ${BORDER_RADIUS.lg};
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
    padding: 28px;
    transition: all ${TRANSITIONS.normal};
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
      opacity: 0;
      transition: opacity ${TRANSITIONS.normal};
    }

    &:hover {
      border-color: ${COLORS.primary};
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.03) 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.1);

      &::before {
        opacity: 1;
      }

      .ant-upload-drag-icon .anticon {
        transform: scale(1.1);
        color: ${COLORS.primaryHover};
      }
    }

    &.ant-upload-drag-hover {
      border-color: ${COLORS.violet};
      border-style: solid;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
      box-shadow: 0 12px 32px rgba(139, 92, 246, 0.15);
    }

    .ant-upload-drag-icon {
      margin-bottom: ${SPACING.md};

      .anticon {
        font-size: 48px;
        color: ${COLORS.primary};
        transition: all ${TRANSITIONS.normal};
      }
    }

    .ant-upload-text {
      font-size: 15px;
      color: ${COLORS.text};
      font-weight: 600;
      margin-bottom: ${SPACING.xs};
    }

    .ant-upload-hint {
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }

    p {
      position: relative;
      z-index: 1;
    }
  }
`;

const ButtonContainer = styled.div`
  margin-top: ${SPACING.md};
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const AddButton = styled(Button)`
  border-radius: ${BORDER_RADIUS.md} !important;
  border: 2px dashed ${COLORS.primary} !important;
  color: ${COLORS.primary} !important;
  height: 44px !important;
  padding: 0 24px !important;
  font-weight: 500 !important;
  transition: all ${TRANSITIONS.normal} !important;
  background: transparent !important;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.03) 100%);
    opacity: 0;
    transition: opacity ${TRANSITIONS.normal};
  }

  &:hover {
    border-style: solid !important;
    background: transparent !important;
    border-color: ${COLORS.primary} !important;
    color: ${COLORS.primary} !important;
    transform: translateY(-2px);
    box-shadow: ${SHADOWS.button} !important;

    &::before {
      opacity: 1;
    }
  }

  .anticon {
    font-size: 16px !important;
    position: relative;
    z-index: 1;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onShowAddForm: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  onShowAddForm,
}) => {
  return (
    <UploadContainer>
      <UploadWrapper className="upload-enhanced">
        <Upload.Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          beforeUpload={(file) => {
            onFileUpload(file);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持所有文件格式，单个文件上传</p>
        </Upload.Dragger>
      </UploadWrapper>

      <ButtonContainer>
        <AddButton
          icon={<PlusOutlined />}
          onClick={onShowAddForm}
        >
          添加知识记录
        </AddButton>
      </ButtonContainer>
    </UploadContainer>
  );
};

export default UploadSection;
