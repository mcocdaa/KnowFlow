import { Form, Modal } from 'antd';
import DynamicKeyForm from '../common/DynamicKeyForm';
import { useI18n } from '../../i18n';
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
  const { t } = useI18n();
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title={mode === 'create' ? t('新建记录', 'New Item') : t('编辑记录', 'Edit Item')}
      okText={t('保存', 'Save')}
      cancelText={t('取消', 'Cancel')}
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
