import { useMemo, useState } from 'react';
import { Button, Flex, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons';
import KeyFormModal from '../components/keys/KeyFormModal';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useKeys } from '../hooks/useKeys';
import type { KeyPayload } from '../hooks/useKeys';
import type { KeyDefinition } from '../types';

const typeColors: Record<string, string> = {
  string: 'blue',
  number: 'purple',
  boolean: 'green',
  array: 'orange',
  object: 'magenta',
};

const KeysPage = () => {
  const { keys, categories, loading, error, submitting, reload, createKey, updateKey, deleteKey } = useKeys();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<KeyDefinition | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const categoryTitles = useMemo(
    () => new Map(categories.map((category) => [category.name, category.title])),
    [categories],
  );

  const filteredKeys = useMemo(
    () => (categoryFilter ? keys.filter((key) => key.category_name === categoryFilter) : keys),
    [categoryFilter, keys],
  );

  const handleSubmit = async (payload: KeyPayload) => {
    const succeeded =
      modalMode === 'edit' && editing
        ? await updateKey(editing.name, payload)
        : await createKey(payload);

    if (succeeded) {
      setModalMode(null);
      setEditing(null);
    }
  };

  const columns: TableColumnsType<KeyDefinition> = [
    {
      title: '名称',
      dataIndex: 'title',
      render: (value: string) => (
        <Space>
          <KeyOutlined style={{ color: '#2563EB' }} />
          <Typography.Text strong>{value}</Typography.Text>
        </Space>
      ),
    },
    { title: '标识', dataIndex: 'name', render: (value: string) => <Typography.Text code>{value}</Typography.Text> },
    {
      title: '类型',
      dataIndex: 'value_type',
      width: 110,
      render: (value: string) => <Tag color={typeColors[value] ?? 'default'}>{value}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      render: (value: string) => categoryTitles.get(value) ?? value,
    },
    {
      title: '必填',
      dataIndex: 'is_required',
      width: 80,
      render: (value: boolean) => (value ? '是' : '否'),
    },
    {
      title: '可见',
      dataIndex: 'is_visible',
      width: 80,
      render: (value: boolean) => (value ? '是' : '否'),
    },
    {
      title: '来源插件',
      dataIndex: 'plugin_name',
      width: 120,
      render: (value: string) => (value ? <Tag>{value}</Tag> : '—'),
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
            onClick={() => {
              setEditing(record);
              setModalMode('edit');
            }}
          />
          <Popconfirm
            title={`删除 Key "${record.title}"？`}
            description="存量记录中的该字段不会被删除。"
            okText="确定"
            cancelText="取消"
            onConfirm={() => deleteKey(record.name)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Key 管理
        </Typography.Title>
        <Space>
          <span data-testid="key-category-filter">
            <Select
              allowClear
              placeholder="按分类筛选"
              style={{ width: 180 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories.map((category) => ({ value: category.name, label: category.title }))}
            />
          </span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalMode('create');
            }}
          >
            新建 Key
          </Button>
        </Space>
      </Flex>

      {error ? (
        <StatePlaceholder variant="error" description={error} onRetry={reload} />
      ) : loading && keys.length === 0 ? (
        <StatePlaceholder variant="loading" />
      ) : filteredKeys.length === 0 ? (
        <StatePlaceholder variant="empty" description="没有符合条件的 Key" />
      ) : (
        <Table<KeyDefinition>
          rowKey="name"
          size="middle"
          columns={columns}
          dataSource={filteredKeys}
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
        />
      )}

      <KeyFormModal
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

export default KeysPage;
