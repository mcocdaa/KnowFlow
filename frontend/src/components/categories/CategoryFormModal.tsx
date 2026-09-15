import { useMemo } from 'react';
import { Form, Input, Modal, TreeSelect } from 'antd';
import { buildCategoryTree, collectDescendants } from '../../utils/categoryTree';
import type { CategoryDefinition, CategoryInput } from '../../types';

interface CategoryFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  categories: CategoryDefinition[];
  initial?: CategoryDefinition | null;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: CategoryInput) => void | Promise<void>;
}

const CategoryFormModal = ({
  open,
  mode,
  categories,
  initial,
  submitting,
  onCancel,
  onSubmit,
}: CategoryFormModalProps) => {
  const [form] = Form.useForm<CategoryInput>();

  const treeData = useMemo(() => {
    const excluded = mode === 'edit' && initial ? collectDescendants(categories, initial.name) : new Set<string>();
    return buildCategoryTree(categories, excluded);
  }, [categories, initial, mode]);

  const handleFinish = (values: CategoryInput) => {
    void onSubmit({
      name: values.name,
      title: values.title,
      parent_name: values.parent_name ?? null,
    });
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '新建分类' : '编辑分类'}
      okText="保存"
      cancelText="取消"
      confirmLoading={submitting}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: initial?.name,
          title: initial?.title,
          parent_name: initial?.parent_name ?? undefined,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="标识"
          rules={[{ required: true, message: '请输入分类标识' }]}
          extra={
            mode === 'edit'
              ? '重命名不会自动更新引用该分类的 Key'
              : '唯一标识，建议使用英文与下划线'
          }
        >
          <Input placeholder="例如 product_category" />
        </Form.Item>
        <Form.Item name="title" label="名称" rules={[{ required: true, message: '请输入分类名称' }]}>
          <Input placeholder="用于界面展示，例如 产品分类" />
        </Form.Item>
        <Form.Item name="parent_name" label="父分类">
          <TreeSelect
            allowClear
            treeDefaultExpandAll
            treeData={treeData}
            placeholder="不选择则为顶级分类"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
