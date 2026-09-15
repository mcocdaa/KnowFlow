import { useState } from 'react';
import { Form, Modal, Progress, Space, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import DynamicKeyForm from '../common/DynamicKeyForm';
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
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);

  const handleFinish = (values: Record<string, unknown>) => {
    if (!file) return;
    void onUpload(file, values);
  };

  return (
    <Modal
      open={open}
      title="上传文件"
      okText="开始上传"
      cancelText="取消"
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
          <p className="ant-upload-text">点击或拖拽文件到此区域</p>
          <p className="ant-upload-hint">单文件上传，最大 10MB</p>
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
