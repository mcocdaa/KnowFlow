import React from 'react';
import { Card, Empty, Flex, Pagination, Popconfirm, Rate, Space, Tag, Tooltip, Typography, theme } from 'antd';
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HolderOutlined,
  TagOutlined,
} from '@ant-design/icons';
import FileIcon from '../common/FileIcon';
import type { CategoryDefinition, KnowledgeItem } from '../../types';
import { formatDateTime } from '../../utils';
import { useI18n } from '../../i18n';

interface ItemCardGridProps {
  items: KnowledgeItem[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  selectedId?: string | null;
  categories?: CategoryDefinition[];
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (item: KnowledgeItem) => void;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => Promise<void> | void;
}

export const ItemCardGrid: React.FC<ItemCardGridProps> = ({
  items,
  total,
  page,
  pageSize,
  loading = false,
  selectedId,
  categories = [],
  onPageChange,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const categoryMap = new Map(categories.map((c) => [c.name, c.title]));

  if (!loading && items.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('暂无匹配知识记录', 'No matching knowledge items')} />;
  }

  return (
    <Flex vertical gap={12}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 10,
        }}
      >
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const fileType = typeof item.keyValues.file_type === 'string' ? item.keyValues.file_type : '';
          const categoryName = (item.keyValues.category_name as string) || '';
          const rawCategoryTitle = categoryMap.get(categoryName) || categoryName;
          const categoryTitle = rawCategoryTitle ? t(rawCategoryTitle) : '';
          const ratingVal = Number(item.keyValues.rating || 0);
          const tags = Array.isArray(item.keyValues.tags)
            ? (item.keyValues.tags as string[])
            : Array.isArray(item.keyValues.tag_list)
              ? (item.keyValues.tag_list as string[])
              : [];

          return (
            <Card
              key={item.id}
              hoverable
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'copyMove';
              }}
              onClick={() => onOpen(item)}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 8,
                borderColor: isSelected ? token.colorPrimary : token.colorBorderSecondary,
                boxShadow: isSelected ? `0 0 0 2px ${token.colorPrimaryBorder}` : undefined,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'grab',
              }}
              styles={{
                body: {
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                  gap: 6,
                },
              }}
            >
              <div>
                {/* Header: Icon + Full Title + Drag handle */}
                <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <FileIcon fileType={fileType} />
                  </span>
                  <div
                    title={item.name}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isSelected ? token.colorPrimary : token.colorTextHeading,
                    }}
                  >
                    {item.name}
                  </div>
                  <Tooltip title={t('按住拖拽至分类归档', 'Drag to file into a category')}>
                    <HolderOutlined style={{ color: token.colorTextQuaternary, cursor: 'grab', flexShrink: 0 }} />
                  </Tooltip>
                </Flex>

                {/* Category + Rating + Tags */}
                <Flex align="center" wrap="wrap" gap={4}>
                  {categoryTitle && (
                    <Tag color="cyan" style={{ fontSize: 11, padding: '0 5px', margin: 0 }}>
                      {categoryTitle}
                    </Tag>
                  )}
                  {ratingVal > 0 && (
                    <Rate disabled allowHalf value={ratingVal} style={{ fontSize: 11 }} />
                  )}
                  {tags.slice(0, 3).map((tag, idx) => (
                    <Tag key={idx} bordered={false} style={{ fontSize: 11, margin: 0, padding: '0 5px' }}>
                      <TagOutlined style={{ marginRight: 2 }} />
                      {t(tag)}
                    </Tag>
                  ))}
                  {tags.length > 3 && (
                    <Tag bordered={false} style={{ fontSize: 11, margin: 0, padding: '0 4px' }}>
                      +{tags.length - 3}
                    </Tag>
                  )}
                </Flex>
              </div>

              {/* Footer: Date + Actions */}
              <div style={{ borderTop: `1px solid ${token.colorSplit}`, paddingTop: 6 }}>
                <Flex justify="space-between" align="center">
                  <span style={{ fontSize: 12, color: token.colorTextTertiary, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarOutlined />
                    {item.createdAt ? formatDateTime(item.createdAt) : '-'}
                  </span>
                  <Space size={4} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('查看详情与预览', 'View details & preview')}>
                      <Typography.Link onClick={() => onOpen(item)} style={{ padding: '2px 4px' }} aria-label={t('查看', 'View')}>
                        <EyeOutlined />
                      </Typography.Link>
                    </Tooltip>
                    <Tooltip title={t('编辑', 'Edit')}>
                      <Typography.Link onClick={() => onEdit(item)} style={{ padding: '2px 4px' }} aria-label={t('编辑', 'Edit')}>
                        <EditOutlined />
                      </Typography.Link>
                    </Tooltip>
                    <Popconfirm
                      title={t('确定删除此记录吗？', 'Delete this item?')}
                      description={t('仅删除记录，不会删除已上传的文件。', 'Only deletes the record, not the uploaded file.')}
                      okText={t('删除', 'Delete')}
                      cancelText={t('取消', 'Cancel')}
                      okButtonProps={{ danger: true }}
                      onConfirm={() => onDelete(item.id)}
                    >
                      <Typography.Link
                        aria-label={t('删除', 'Delete')}
                        type="danger"
                        style={{ padding: '2px 4px' }}
                      >
                        <DeleteOutlined />
                      </Typography.Link>
                    </Popconfirm>
                  </Space>
                </Flex>
              </div>
            </Card>
          );
        })}
      </div>

      <Flex justify="end">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger
          pageSizeOptions={['12', '20', '50']}
        />
      </Flex>
    </Flex>
  );
};

export default ItemCardGrid;
