import { Form, Input, InputNumber, Modal, Select, Switch, Descriptions } from 'antd';
import { jsonValidator } from '../../utils/dynamicForm';
import { formatDateTime } from '../../utils/format';
import type { KeyDefinition, ValueType } from '../../types';
import type { KeyPayload } from '../../hooks/useKeys';

interface KeyFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  categories: { name: string; title: string }[];
  initial?: KeyDefinition | null;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: KeyPayload) => void | Promise<void>;
}

const stringifyDefault = (value: unknown, valueType: string): unknown => {
  if ((valueType === 'array' || valueType === 'object') && typeof value !== 'string') {
    return JSON.stringify(value ?? (valueType === 'array' ? [] : {}));
  }
  return value;
};

const parseDefault = (raw: unknown, valueType: string): unknown => {
  if (valueType === 'array' || valueType === 'object') {
    if (typeof raw === 'string' && raw.trim() !== '') return JSON.parse(raw);
    return valueType === 'array' ? [] : {};
  }
  if (valueType === 'number') return raw === undefined || raw === null || raw === '' ? 0 : Number(raw);
  if (valueType === 'boolean') return Boolean(raw);
  return raw ?? '';
};

const KeyFormModal = ({
  open,
  mode,
  categories,
  initial,
  submitting,
  onCancel,
  onSubmit,
}: KeyFormModalProps) => {
  const [form] = Form.useForm();
  const watchedType = (Form.useWatch('value_type', form) as ValueType | undefined) ?? initial?.value_type ?? 'string';
  const isJsonType = watchedType === 'array' || watchedType === 'object';

  const handleFinish = (values: Record<string, unknown>) => {
    const valueType = values.value_type as string;
    const payload: KeyPayload = {
      name: values.name as string,
      title: values.title as string,
      value_type: valueType as ValueType,
      default_value: parseDefault(values.default_value, valueType),
      description: (values.description as string) ?? '',
      category_name: values.category_name as string,
      is_required: Boolean(values.is_required),
      is_visible: Boolean(values.is_visible),
      is_public: Boolean(values.is_public),
      is_private: Boolean(values.is_private),
    };
    void onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '新建 Key' : '编辑 Key'}
      okText="保存"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={620}
    >
      {mode === 'edit' && initial ? (
        <Descriptions
          size="small"
          column={2}
          style={{ marginBottom: 16 }}
          items={[
            { key: 'plugin', label: '来源插件', children: initial.plugin_name || '—' },
            { key: 'delete', label: '随插件删除', children: initial.delete_with_plugin ? '是' : '否' },
            { key: 'created', label: '创建时间', children: formatDateTime(initial.created_at) },
            { key: 'updated', label: '更新时间', children: formatDateTime(initial.updated_at) },
          ]}
        />
      ) : null}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: initial?.name,
          title: initial?.title,
          value_type: initial?.value_type ?? 'string',
          default_value: stringifyDefault(initial?.default_value ?? '', initial?.value_type ?? 'string'),
          description: initial?.description ?? '',
          category_name: initial?.category_name,
          is_required: initial?.is_required ?? false,
          is_visible: initial?.is_visible ?? true,
          is_public: initial?.is_public ?? true,
          is_private: initial?.is_private ?? false,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="标识"
          rules={[{ required: true, message: '请输入标识' }]}
          extra={mode === 'edit' ? '重命名后存量记录仍以旧 Key 存储（后端不迁移数据）' : '唯一标识，使用英文与下划线'}
        >
          <Input placeholder="例如 project_owner" />
        </Form.Item>

        <Form.Item name="title" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="界面展示名称，例如 项目负责人" />
        </Form.Item>

        <Form.Item name="value_type" label="类型" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'string', label: 'string' },
              { value: 'number', label: 'number' },
              { value: 'boolean', label: 'boolean' },
              { value: 'array', label: 'array' },
              { value: 'object', label: 'object' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="default_value"
          label="默认值"
          valuePropName={watchedType === 'boolean' ? 'checked' : 'value'}
          rules={isJsonType ? [{ validator: jsonValidator }] : []}
        >
          {watchedType === 'boolean' ? (
            <Switch />
          ) : watchedType === 'number' ? (
            <InputNumber style={{ width: '100%' }} />
          ) : isJsonType ? (
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder='例如 ["a","b"] 或 {"k":"v"}' />
          ) : (
            <Input />
          )}
        </Form.Item>

        <Form.Item name="description" label="描述">
          <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} />
        </Form.Item>

        <Form.Item name="category_name" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select
            placeholder="选择所属分类"
            options={categories.map((category) => ({ value: category.name, label: category.title }))}
          />
        </Form.Item>

        <Form.Item name="is_required" label="必填" valuePropName="checked" extra="开启后新建记录必须提供该字段">
          <Switch />
        </Form.Item>
        <Form.Item name="is_visible" label="可见" valuePropName="checked" extra="隐藏后不出现在记录详情与表单中">
          <Switch />
        </Form.Item>
        <Form.Item name="is_public" label="公开" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="is_private" label="私有" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default KeyFormModal;
