import { Button, Popconfirm, Rate, Space, Table, Tooltip, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import FileIcon from '../common/FileIcon';
import { formatDateTime } from '../../utils/format';
import type { KnowledgeItem } from '../../types';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();

  const columns: TableColumnsType<KnowledgeItem> = [
    {
      title: t('名称', 'Name'),
      dataIndex: 'name',
      render: (_value, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
          <span style={{ flexShrink: 0, display: 'inline-flex' }}>
            <FileIcon fileType={String(item.keyValues.file_type ?? '')} style={{ color: '#2563EB' }} />
          </span>
          {onOpen ? (
            <Button
              type="link"
              style={{
                paddingInline: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                textAlign: 'left',
              }}
              onClick={() => onOpen(item)}
            >
              {item.name ? t(item.name) : t('未命名', 'Untitled')}
            </Button>
          ) : (
            <Typography.Text strong ellipsis style={{ flex: 1, minWidth: 0 }}>
              {item.name ? t(item.name) : t('未命名', 'Untitled')}
            </Typography.Text>
          )}
        </div>
      ),
    },
    {
      title: t('评分', 'Rating'),
      width: 116,
      render: (_value, item) => {
        const rating = Math.min(5, Math.max(0, Number(item.keyValues.rating) || 0));
        return rating > 0 ? (
          <Rate disabled value={rating} style={{ fontSize: 12, whiteSpace: 'nowrap', display: 'inline-flex' }} />
        ) : (
          '—'
        );
      },
    },
    {
      title: t('更新时间', 'Updated'),
      dataIndex: 'updatedAt',
      width: 132,
      render: (value?: string) => <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDateTime(value)}</span>,
    },
    {
      title: t('操作', 'Actions'),
      width: 92,
      align: 'right',
      render: (_value, item) => (
        <Space size={0} style={{ whiteSpace: 'nowrap' }}>
          {onOpen ? (
            <Tooltip title={t('查看', 'View')}>
              <Button type="text" size="small" icon={<EyeOutlined />} aria-label={t('查看', 'View')} onClick={() => onOpen(item)} />
            </Tooltip>
          ) : null}
          {onEdit ? (
            <Tooltip title={t('编辑', 'Edit')}>
              <Button type="text" size="small" icon={<EditOutlined />} aria-label={t('编辑', 'Edit')} onClick={() => onEdit(item)} />
            </Tooltip>
          ) : null}
          <Popconfirm
            title={t('删除这条记录？', 'Delete this item?')}
            description={t('仅删除记录，不会删除已上传的文件。', 'Only deletes the record, not the uploaded file.')}
            okText={t('确定', 'OK')}
            cancelText={t('取消', 'Cancel')}
            onConfirm={() => onDelete(item.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={t('删除', 'Delete')} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<KnowledgeItem>
      rowKey="id"
      size="middle"
      tableLayout="fixed"
      columns={columns}
      dataSource={items}
      loading={loading}
      locale={{ emptyText: t('未找到匹配的知识记录', 'No matching items found') }}
      onRow={(record) => ({
        draggable: true,
        onDragStart: (e) => {
          e.dataTransfer.setData('text/plain', record.id);
          e.dataTransfer.effectAllowed = 'copyMove';
        },
        style: { cursor: 'grab' },
      })}
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
