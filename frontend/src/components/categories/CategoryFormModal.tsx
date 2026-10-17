import { useMemo } from 'react';
import { Form, Input, Modal, TreeSelect } from 'antd';
import { buildCategoryTree, collectDescendants } from '../../utils/categoryTree';
import { useI18n } from '../../i18n';
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
  const { t, locale } = useI18n();
  const [form] = Form.useForm<CategoryInput>();

  const treeData = useMemo(() => {
    const excluded = mode === 'edit' && initial ? collectDescendants(categories, initial.name) : new Set<string>();
    const localized = categories.map((category) => ({ ...category, title: t(category.title) }));
    return buildCategoryTree(localized, excluded);
  }, [categories, initial, mode, t]);

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
      title={mode === 'create' ? t('新建分类', 'New Category') : t('编辑分类', 'Edit Category')}
      okText={t('保存', 'Save')}
      cancelText={t('取消', 'Cancel')}
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
          title: locale === 'en' && initial?.title ? t(initial.title) : initial?.title,
          parent_name: initial?.parent_name ?? undefined,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label={t('标识', 'Key')}
          rules={[{ required: true, message: t('请输入分类标识', 'Please enter a category key') }]}
          extra={
            mode === 'edit'
              ? t('重命名不会自动更新引用该分类的 Key', 'Renaming does not automatically update keys referencing this category')
              : t('唯一标识，建议使用英文与下划线', 'Unique identifier using lowercase letters and underscores')
          }
        >
          <Input placeholder={t('例如 product_category', 'e.g. product_category')} />
        </Form.Item>
        <Form.Item
          name="title"
          label={t('名称', 'Name')}
          rules={[{ required: true, message: t('请输入分类名称', 'Please enter a category name') }]}
        >
          <Input placeholder={t('用于界面展示，例如 产品分类', 'Display name, e.g. Product Category')} />
        </Form.Item>
        <Form.Item name="parent_name" label={t('父分类', 'Parent Category')}>
          <TreeSelect
            allowClear
            treeDefaultExpandAll
            treeData={treeData}
            placeholder={t('不选择则为顶级分类', 'None (Top-level category)')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
