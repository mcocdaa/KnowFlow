import React from 'react';
import { Card, Col, Empty, Flex, Pagination, Popconfirm, Rate, Row, Space, Tag, Tooltip, Typography, theme } from 'antd';
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
  const categoryMap = new Map(categories.map((c) => [c.name, c.title]));

  if (!loading && items.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配知识记录" />;
  }

  return (
    <Flex vertical gap={16}>
      <Row gutter={[16, 16]}>
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const fileType = typeof item.keyValues.file_type === 'string' ? item.keyValues.file_type : '';
          const categoryName = (item.keyValues.category_name as string) || '';
          const categoryTitle = categoryMap.get(categoryName) || categoryName;
          const ratingVal = Number(item.keyValues.rating || 0);
          const tags = Array.isArray(item.keyValues.tags)
            ? (item.keyValues.tags as string[])
            : Array.isArray(item.keyValues.tag_list)
              ? (item.keyValues.tag_list as string[])
              : [];

          return (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={item.id}>
              <Card
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
                bodyStyle={{
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Header: Icon + Title + Drag handle */}
                  <Flex justify="space-between" align="start" gap={8} style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>
                      <FileIcon fileType={fileType} />
                    </span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <Tooltip title={item.name}>
                        <Typography.Text
                          strong
                          ellipsis
                          style={{
                            fontSize: 14,
                            display: 'block',
                            color: isSelected ? token.colorPrimary : token.colorTextHeading,
                          }}
                        >
                          {item.name}
                        </Typography.Text>
                      </Tooltip>
                      {categoryTitle && (
                        <Tag color="cyan" style={{ fontSize: 11, padding: '0 6px', marginTop: 4 }}>
                          {categoryTitle}
                        </Tag>
                      )}
                    </div>
                    <Tooltip title="按住拖拽至分类归档">
                      <HolderOutlined style={{ color: token.colorTextQuaternary, cursor: 'grab' }} />
                    </Tooltip>
                  </Flex>

                  {/* Rating */}
                  {ratingVal > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <Rate disabled allowHalf value={ratingVal} style={{ fontSize: 13 }} />
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {tags.slice(0, 3).map((tag, idx) => (
                        <Tag key={idx} bordered={false} style={{ fontSize: 11, margin: 0 }}>
                          <TagOutlined style={{ marginRight: 3 }} />
                          {tag}
                        </Tag>
                      ))}
                      {tags.length > 3 && (
                        <Tag bordered={false} style={{ fontSize: 11, margin: 0 }}>
                          +{tags.length - 3}
                        </Tag>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Date + Actions */}
                <div style={{ borderTop: `1px solid ${token.colorSplit}`, paddingTop: 8, marginTop: 8 }}>
                  <Flex justify="space-between" align="center">
                    <span style={{ fontSize: 12, color: token.colorTextTertiary, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarOutlined />
                      {item.createdAt ? formatDateTime(item.createdAt) : '-'}
                    </span>
                    <Space size={4} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="查看详情与预览">
                        <Typography.Link onClick={() => onOpen(item)} style={{ padding: '2px 4px' }} aria-label="查看">
                          <EyeOutlined />
                        </Typography.Link>
                      </Tooltip>
                      <Tooltip title="编辑">
                        <Typography.Link onClick={() => onEdit(item)} style={{ padding: '2px 4px' }} aria-label="编辑">
                          <EditOutlined />
                        </Typography.Link>
                      </Tooltip>
                      <Popconfirm
                        title="确定删除此记录吗？"
                        description="仅删除记录，不会删除已上传的文件。"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => onDelete(item.id)}
                      >
                        <Typography.Link
                          aria-label="删除"
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
            </Col>
          );
        })}
      </Row>

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
