import { useMemo, useState } from 'react';
import { Button, Flex, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useCategories } from '../hooks/useCategories';
import type { CategoryDefinition, CategoryInput } from '../types';

const CategoriesPage = () => {
  const { categories, loading, error, submitting, reload, createCategory, updateCategory, deleteCategory } =
    useCategories();
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
      title: '名称',
      dataIndex: 'title',
      render: (value: string) => (
        <Space>
          <FolderOutlined style={{ color: '#2563EB' }} />
          <Typography.Text strong>{value}</Typography.Text>
        </Space>
      ),
    },
    { title: '标识', dataIndex: 'name' },
    {
      title: '父分类',
      dataIndex: 'parent_name',
      render: (value?: string | null) => (value ? (parentTitles.get(value) ?? value) : '—'),
    },
    {
      title: '类型',
      dataIndex: 'is_builtin',
      width: 110,
      render: (isBuiltin: boolean) =>
        isBuiltin ? <Tag>内置</Tag> : <Tag color="blue">自定义</Tag>,
    },
    {
      title: '操作',
      width: 140,
      render: (_value, record) => (
        <Space size={0}>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label="编辑"
            title={record.is_builtin ? '内置分类不可修改' : '编辑'}
            disabled={record.is_builtin}
            onClick={() => {
              setEditing(record);
              setModalMode('edit');
            }}
          />
          <Popconfirm
            title="删除这个分类？"
            description="存在子分类或为内置分类时无法删除。"
            okText="确定"
            cancelText="取消"
            disabled={record.is_builtin}
            onConfirm={() => deleteCategory(record.name)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label="删除"
              title={record.is_builtin ? '内置分类不可删除' : '删除'}
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
          分类管理
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalMode('create');
          }}
        >
          新建分类
        </Button>
      </Flex>

      {error ? (
        <StatePlaceholder variant="error" description={error} onRetry={reload} />
      ) : loading && categories.length === 0 ? (
        <StatePlaceholder variant="loading" />
      ) : categories.length === 0 ? (
        <StatePlaceholder variant="empty" description="暂无分类，点击右上角新建" />
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
