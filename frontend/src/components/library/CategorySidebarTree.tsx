import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Empty, Flex, Tooltip, Tree, Typography, theme } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import {
  FolderFilled,
  FolderOpenOutlined,
  PlusOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { CategoryDefinition } from '../../types';
import CategoryFormModal from '../categories/CategoryFormModal';
import { collectDescendants } from '../../utils/categoryTree';
import { useI18n } from '../../i18n';

interface CategorySidebarTreeProps {
  categories: CategoryDefinition[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  itemCounts?: Record<string, number>;
  totalCount?: number;
  onArchiveItem?: (itemId: string, categoryName: string) => Promise<void> | void;
  onUpdateCategoryParent?: (name: string, newParentName: string | null) => Promise<void> | void;
  onCreateCategory?: (input: { name: string; title: string; parent_name?: string | null }) => Promise<void> | void;
}

export const CategorySidebarTree: React.FC<CategorySidebarTreeProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  itemCounts = {},
  totalCount = 0,
  onArchiveItem,
  onUpdateCategoryParent,
  onCreateCategory,
}) => {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  // Build tree data for Ant Design Tree
  const treeData = useMemo(() => {
    const childrenOf = (parentName: string | null): TreeDataNode[] => {
      return categories
        .filter((cat) => (cat.parent_name || null) === parentName)
        .map((cat) => {
          const count = itemCounts[cat.name] || 0;
          const isDragTarget = dragOverCategory === cat.name;
          const displayTitle = t(cat.title);

          return {
            key: cat.name,
            title: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 4,
                  width: '100%',
                  minWidth: 0,
                  padding: '2px 2px',
                  borderRadius: 4,
                  background: isDragTarget ? token.colorPrimaryBg : 'transparent',
                  border: isDragTarget ? `1px dashed ${token.colorPrimary}` : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCategory(cat.name);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCategory((curr) => (curr === cat.name ? null : curr));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCategory(null);
                  const itemId = e.dataTransfer.getData('text/plain');
                  if (itemId && onArchiveItem) {
                    void onArchiveItem(itemId, cat.name);
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <FolderFilled style={{ color: token.colorPrimary, fontSize: 13, flexShrink: 0 }} />
                  <span
                    title={displayTitle}
                    style={{
                      fontSize: 12.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayTitle}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    lineHeight: '16px',
                    color: token.colorTextSecondary,
                    background: token.colorFillAlter,
                    padding: '0 5px',
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                >
                  {count}
                </span>
              </div>
            ),
            children: childrenOf(cat.name),
          };
        });
    };

    return childrenOf(null);
  }, [categories, itemCounts, dragOverCategory, token, onArchiveItem, t]);

  const handleTreeDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key as string;
    const dragKey = info.dragNode.key as string;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    let targetParent: string | null = null;

    if (!info.dropToGap) {
      // Dropped directly on node -> becomes child of dropKey
      targetParent = dropKey;
    } else if (dropPosition === -1 || dropPosition === 1) {
      // Dropped before or after -> inherits same parent as dropKey
      const targetCat = categories.find((c) => c.name === dropKey);
      targetParent = targetCat?.parent_name || null;
    }

    // Cycle check
    const descendants = collectDescendants(categories, dragKey);
    if (targetParent && descendants.has(targetParent)) {
      return;
    }

    if (onUpdateCategoryParent) {
      void onUpdateCategoryParent(dragKey, targetParent);
    }
  };

  return (
    <Card
      size="small"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
      styles={{ body: { padding: 10, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>
        <Typography.Text strong style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FolderOpenOutlined style={{ color: token.colorPrimary }} /> {t('分类目录', 'Categories')}
        </Typography.Text>
        <Tooltip title={t('新建分类', 'New Category')}>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            aria-label={t('新建分类', 'New Category')}
          />
        </Tooltip>
      </Flex>

      {/* Root "全部知识" node */}
      <div
        onClick={() => onSelectCategory(null)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverCategory('__root__');
        }}
        onDragLeave={() => setDragOverCategory((curr) => (curr === '__root__' ? null : curr))}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverCategory(null);
          const itemId = e.dataTransfer.getData('text/plain');
          if (itemId && onArchiveItem) {
            void onArchiveItem(itemId, '');
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 8px',
          borderRadius: 6,
          cursor: 'pointer',
          marginBottom: 6,
          background: selectedCategory === null ? token.colorPrimaryBg : 'transparent',
          color: selectedCategory === null ? token.colorPrimaryText : token.colorText,
          border:
            dragOverCategory === '__root__'
              ? `1px dashed ${token.colorPrimary}`
              : selectedCategory === null
                ? `1px solid ${token.colorPrimaryBorder}`
                : '1px solid transparent',
          fontWeight: selectedCategory === null ? 600 : 400,
          transition: 'all 0.2s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AppstoreOutlined />
          <span>{t('全部知识', 'All Items')}</span>
        </span>
        <Badge count={totalCount} overflowCount={999} style={{ backgroundColor: token.colorFillSecondary, color: token.colorTextSecondary }} />
      </div>

      <div className="knowflow-category-tree" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {categories.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('暂无分类', 'No categories')} style={{ marginTop: 24 }} />
        ) : (
          <Tree
            draggable
            blockNode
            defaultExpandAll
            selectedKeys={selectedCategory ? [selectedCategory] : []}
            onSelect={(keys) => {
              const selected = keys[0] as string | undefined;
              onSelectCategory(selected || null);
            }}
            onDrop={handleTreeDrop}
            treeData={treeData}
            style={{ background: 'transparent' }}
          />
        )}
      </div>

      <div
        style={{
          marginTop: 8,
          padding: '5px 6px',
          background: token.colorFillQuaternary,
          borderRadius: 6,
          fontSize: 11,
          color: token.colorTextTertiary,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <InfoCircleOutlined style={{ marginRight: 4 }} /> {t('提示：拖拽文件可直接归档至分类', 'Tip: Drag items here to file')}
      </div>

      <CategoryFormModal
        open={modalOpen}
        mode="create"
        categories={categories}
        submitting={false}
        onCancel={() => setModalOpen(false)}
        onSubmit={async (values) => {
          if (onCreateCategory) {
            await onCreateCategory(values);
            setModalOpen(false);
          }
        }}
      />
    </Card>
  );
};

export default CategorySidebarTree;
