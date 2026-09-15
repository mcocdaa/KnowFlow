import { Form, Modal } from 'antd';
import DynamicKeyForm from '../common/DynamicKeyForm';
import type { KeyDefinition } from '../../types';

interface ItemFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  definitions: KeyDefinition[];
  initialValues?: Record<string, unknown>;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
}

const ItemFormModal = ({
  open,
  mode,
  definitions,
  initialValues,
  submitting,
  onCancel,
  onSubmit,
}: ItemFormModalProps) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '新建记录' : '编辑记录'}
      okText="保存"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <DynamicKeyForm
        form={form}
        definitions={definitions}
        initialValues={initialValues}
        onFinish={(values) => onSubmit(values)}
      />
    </Modal>
  );
};

export default ItemFormModal;
