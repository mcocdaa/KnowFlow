import { useState } from 'react';
import { Form, Modal, Progress, Space, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import DynamicKeyForm from '../common/DynamicKeyForm';
import { useI18n } from '../../i18n';
import type { KeyDefinition } from '../../types';

interface UploadModalProps {
  open: boolean;
  definitions: KeyDefinition[];
  uploading?: boolean;
  progress?: number;
  onCancel: () => void;
  onUpload: (file: File, values: Record<string, unknown>) => void | Promise<void>;
}

const UploadModal = ({ open, definitions, uploading, progress, onCancel, onUpload }: UploadModalProps) => {
  const { t } = useI18n();
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);

  const handleFinish = (values: Record<string, unknown>) => {
    if (!file) return;
    void onUpload(file, values);
  };

  return (
    <Modal
      open={open}
      title={t('上传文件', 'Upload File')}
      okText={t('开始上传', 'Start Upload')}
      cancelText={t('取消', 'Cancel')}
      okButtonProps={{ disabled: !file }}
      confirmLoading={uploading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Upload.Dragger
          beforeUpload={(selected) => {
            setFile(selected);
            return false;
          }}
          onRemove={() => {
            setFile(null);
          }}
          fileList={file ? [{ uid: 'upload-file', name: file.name, status: 'done' as const }] : []}
          maxCount={1}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t('点击或拖拽文件到此区域', 'Click or drag a file to this area to upload')}</p>
          <p className="ant-upload-hint">{t('单文件上传，最大 10MB', 'Single file upload, up to 10MB')}</p>
        </Upload.Dragger>

        {typeof progress === 'number' && progress > 0 ? <Progress percent={progress} /> : null}

        <DynamicKeyForm
          form={form}
          definitions={definitions}
          onFinish={(values) => handleFinish(values)}
        />
      </Space>
    </Modal>
  );
};

export default UploadModal;
