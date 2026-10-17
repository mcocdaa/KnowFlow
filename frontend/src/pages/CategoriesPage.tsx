import { useMemo, useState } from 'react';
import { Button, Flex, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useCategories } from '../hooks/useCategories';
import { useI18n } from '../i18n';
import type { CategoryDefinition, CategoryInput } from '../types';

const CategoriesPage = () => {
  const { categories, loading, error, submitting, reload, createCategory, updateCategory, deleteCategory } =
    useCategories();
  const { t } = useI18n();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<CategoryDefinition | null>(null);

  const parentTitles = useMemo(
    () => new Map(categories.map((category) => [category.name, category.title])),
    [categories],
  );

  const handleSubmit = async (values: CategoryInput) => {
    const succeeded =
      modalMode === 'edit' && editing
        ? await updateCategory(editing.name, values)
        : await createCategory(values);

    if (succeeded) {
      setModalMode(null);
      setEditing(null);
    }
  };

  const columns: TableColumnsType<CategoryDefinition> = [
    {
      title: t('名称', 'Name'),
      dataIndex: 'title',
      render: (value: string) => (
        <Space>
          <FolderOutlined style={{ color: '#2563EB' }} />
          <Typography.Text strong>{t(value)}</Typography.Text>
        </Space>
      ),
    },
    { title: t('标识', 'Identifier'), dataIndex: 'name' },
    {
      title: t('父分类', 'Parent'),
      dataIndex: 'parent_name',
      render: (value?: string | null) => (value ? t(parentTitles.get(value) ?? value) : '—'),
    },
    {
      title: t('类型', 'Type'),
      dataIndex: 'is_builtin',
      width: 110,
      render: (isBuiltin: boolean) =>
        isBuiltin ? <Tag>{t('内置', 'Built-in')}</Tag> : <Tag color="blue">{t('自定义', 'Custom')}</Tag>,
    },
    {
      title: t('操作', 'Actions'),
      width: 140,
      render: (_value, record) => (
        <Space size={0}>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={t('编辑', 'Edit')}
            title={record.is_builtin ? t('内置分类不可修改', 'Built-in categories cannot be modified') : t('编辑', 'Edit')}
            disabled={record.is_builtin}
            onClick={() => {
              setEditing(record);
              setModalMode('edit');
            }}
          />
          <Popconfirm
            title={t('删除这个分类？', 'Delete this category?')}
            description={t('存在子分类或为内置分类时无法删除。', 'Cannot delete if subcategories exist or if built-in.')}
            okText={t('确定', 'OK')}
            cancelText={t('取消', 'Cancel')}
            disabled={record.is_builtin}
            onConfirm={() => deleteCategory(record.name)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={t('删除', 'Delete')}
              title={record.is_builtin ? t('内置分类不可删除', 'Built-in categories cannot be deleted') : t('删除', 'Delete')}
              disabled={record.is_builtin}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('分类管理', 'Categories')}
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalMode('create');
          }}
        >
          {t('新建分类', 'New Category')}
        </Button>
      </Flex>

      {error ? (
        <StatePlaceholder variant="error" description={error} onRetry={reload} />
      ) : loading && categories.length === 0 ? (
        <StatePlaceholder variant="loading" />
      ) : categories.length === 0 ? (
        <StatePlaceholder variant="empty" description={t('暂无分类，点击右上角新建', 'No categories yet. Click New Category to create one.')} />
      ) : (
        <Table<CategoryDefinition>
          rowKey="name"
          size="middle"
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={false}
        />
      )}

      <CategoryFormModal
        open={modalMode !== null}
        mode={modalMode ?? 'create'}
        categories={categories}
        initial={editing}
        submitting={submitting}
        onCancel={() => {
          setModalMode(null);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </Flex>
  );
};

export default CategoriesPage;
