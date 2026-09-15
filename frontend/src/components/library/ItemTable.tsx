import { Button, Popconfirm, Rate, Space, Table, Tooltip, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import FileIcon from '../common/FileIcon';
import { formatDateTime } from '../../utils/format';
import type { KnowledgeItem } from '../../types';

interface ItemTableProps {
  items: KnowledgeItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onDelete: (id: string) => void;
  onOpen?: (item: KnowledgeItem) => void;
  onEdit?: (item: KnowledgeItem) => void;
}

const ItemTable = ({
  items,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onDelete,
  onOpen,
  onEdit,
}: ItemTableProps) => {
  const columns: TableColumnsType<KnowledgeItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (_value, item) => (
        <Space>
          <FileIcon fileType={String(item.keyValues.file_type ?? '')} style={{ color: '#2563EB' }} />
          {onOpen ? (
            <Button type="link" style={{ paddingInline: 0 }} onClick={() => onOpen(item)}>
              {item.name || '未命名'}
            </Button>
          ) : (
            <Typography.Text strong>{item.name || '未命名'}</Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: '评分',
      width: 140,
      render: (_value, item) => {
        const rating = Math.min(5, Math.max(0, Number(item.keyValues.rating) || 0));
        return rating > 0 ? <Rate disabled value={rating} style={{ fontSize: 14 }} /> : '—';
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: '操作',
      width: 150,
      render: (_value, item) => (
        <Space size={0}>
          {onOpen ? (
            <Tooltip title="查看">
              <Button type="text" icon={<EyeOutlined />} aria-label="查看" onClick={() => onOpen(item)} />
            </Tooltip>
          ) : null}
          {onEdit ? (
            <Tooltip title="编辑">
              <Button type="text" icon={<EditOutlined />} aria-label="编辑" onClick={() => onEdit(item)} />
            </Tooltip>
          ) : null}
          <Popconfirm
            title="删除这条记录？"
            description="仅删除记录，不会删除已上传的文件。"
            okText="确定"
            cancelText="取消"
            onConfirm={() => onDelete(item.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="删除" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<KnowledgeItem>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
      }}
    />
  );
};

export default ItemTable;
