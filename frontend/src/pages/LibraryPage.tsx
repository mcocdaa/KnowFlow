import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Flex, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import SearchToolbar from '../components/library/SearchToolbar';
import ItemTable from '../components/library/ItemTable';
import ItemCardGrid from '../components/library/ItemCardGrid';
import ItemDetailDrawer from '../components/library/ItemDetailDrawer';
import ItemFormModal from '../components/library/ItemFormModal';
import UploadModal from '../components/library/UploadModal';
import CategorySidebarTree from '../components/library/CategorySidebarTree';
import FacetFilterChips from '../components/library/FacetFilterChips';
import LivePreviewPanel from '../components/library/LivePreviewPanel';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useCatalog } from '../hooks/useCatalog';
import { useLibrary } from '../hooks/useLibrary';
import { upsertItem } from '../store/librarySlice';
import api from '../services/api';
import { getErrorMessage, openFileLocation } from '../utils';
import { useI18n } from '../i18n';
import type { CategoryInput, KnowledgeItem } from '../types';

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const { t } = useI18n();
  const { items, total, page, pageSize, params, loading, error, updateParams, refresh, removeItem } = useLibrary();
  const { keys, categories, refreshCatalog } = useCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [allItems, setAllItems] = useState<KnowledgeItem[]>([]);
  const [cachedUnfilteredItems, setCachedUnfilteredItems] = useState<KnowledgeItem[]>([]);

  const hasItems = items.length > 0;

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const selectedCategory = params.categoryName || (params.key === 'category_name' ? params.keyValue : null) || null;

  useEffect(() => {
    let cancelled = false;
    api
      .fetchItems()
      .then((list) => {
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          setAllItems(list);
        }
      })
      .catch(() => {
        // Ignore background catalog count errors
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const parentMap = new Map(categories.map((c) => [c.name, c.parent_name || null]));
    const sourceItems =
      allItems.length > 0
        ? allItems
        : !selectedCategory
          ? items
          : cachedUnfilteredItems.length > 0
            ? cachedUnfilteredItems
            : items;
    sourceItems.forEach((item) => {
      let cat: string | null = ((item.keyValues.category_name as string) || '').trim() || null;
      const visited = new Set<string>();
      while (cat && !visited.has(cat)) {
        visited.add(cat);
        counts[cat] = (counts[cat] || 0) + 1;
        cat = parentMap.get(cat) ?? null;
      }
    });
    if (selectedCategory && allItems.length === 0) {
      counts[selectedCategory] = items.length;
    }
    return counts;
  }, [allItems, cachedUnfilteredItems, categories, items, selectedCategory]);

  const sidebarTotalCount =
    allItems.length > 0 ? allItems.length : !selectedCategory ? total : Math.max(total, cachedUnfilteredItems.length);

  const handleSelectCategory = useCallback(
    (categoryName: string | null) => {
      if (!selectedCategory && items.length > 0) {
        setCachedUnfilteredItems(items);
      }
      updateParams({
        categoryName: categoryName || '',
        ...(params.key === 'category_name' ? { key: '', keyValue: '' } : {}),
        page: 1,
      });
    },
    [items, params.key, selectedCategory, updateParams],
  );

  const handleArchiveItem = useCallback(
    async (itemId: string, categoryName: string) => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return;
      try {
        const updated = await api.updateItem({
          ...target,
          keyValues: {
            ...target.keyValues,
            category_name: categoryName,
          },
        });
        dispatch(upsertItem(updated));
        message.success(
          t(
            `已成功归档至分类：${categoryName || '全部'}`,
            `Moved to category: ${categoryName ? t(categoryName) : t('全部', 'All')}`,
          ),
        );
        refresh();
      } catch (err) {
        message.error(getErrorMessage(err, t('归档失败', 'Failed to move item')));
      }
    },
    [dispatch, items, message, refresh, t],
  );

  const handleUpdateCategoryParent = useCallback(
    async (name: string, newParentName: string | null) => {
      try {
        await api.updateCategory(name, { parent_name: newParentName });
        message.success(t('分类层级已更新', 'Category hierarchy updated'));
        refreshCatalog();
      } catch (err) {
        message.error(getErrorMessage(err, t('更新分类层级失败', 'Failed to update category hierarchy')));
      }
    },
    [message, refreshCatalog, t],
  );

  const handleCreateCategory = useCallback(
    async (input: CategoryInput) => {
      try {
        await api.createCategory(input);
        message.success(t('分类创建成功', 'Category created'));
        refreshCatalog();
      } catch (err) {
        message.error(getErrorMessage(err, t('分类创建失败', 'Failed to create category')));
      }
    },
    [message, refreshCatalog, t],
  );

  const handleOpenLocation = useCallback(
    (filePath: string) => {
      void openFileLocation(filePath, (path) => message.info(t(`已复制路径：${path}`, `Copied path: ${path}`)));
    },
    [message, t],
  );

  const handlePluginUpdate = useCallback(
    (key: string, value: unknown) => {
      if (!selectedItem) return;
      dispatch(upsertItem({ ...selectedItem, keyValues: { ...selectedItem.keyValues, [key]: value } }));
    },
    [dispatch, selectedItem],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await removeItem(id);
      setSelectedId(null);
    },
    [removeItem],
  );

  const handleCreate = useCallback(
    async (values: Record<string, unknown>) => {
      setFormSubmitting(true);
      try {
        const created = await api.createItem(String(values.name ?? ''), values);
        dispatch(upsertItem(created));
        message.success(t('知识记录添加成功', 'Item created'));
        setFormMode(null);
        refresh();
      } catch (createError) {
        message.error(getErrorMessage(createError, t('添加失败', 'Failed to create item')));
      } finally {
        setFormSubmitting(false);
      }
    },
    [dispatch, message, refresh, t],
  );

  const handleEditSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!editingItem) return;
      setFormSubmitting(true);
      try {
        const updated = await api.updateItem({
          ...editingItem,
          name: String(values.name ?? editingItem.name),
          keyValues: values,
        });
        dispatch(upsertItem(updated));
        message.success(t('记录已更新', 'Item updated'));
        setFormMode(null);
        setEditingItem(null);
        setSelectedId(null);
        refresh();
      } catch (updateError) {
        message.error(getErrorMessage(updateError, t('保存失败', 'Failed to save item')));
      } finally {
        setFormSubmitting(false);
      }
    },
    [dispatch, editingItem, message, refresh, t],
  );

  const handleUpload = useCallback(
    async (file: File, values: Record<string, unknown>) => {
      setUploadSubmitting(true);
      setUploadProgress(0);
      try {
        const created = await api.uploadFile(file, values, setUploadProgress);
        dispatch(upsertItem(created));
        message.success(t('文件上传成功', 'File uploaded'));
        setUploadOpen(false);
        refresh();
      } catch (uploadError) {
        message.error(getErrorMessage(uploadError, t('文件上传失败', 'Failed to upload file')));
      } finally {
        setUploadSubmitting(false);
      }
    },
    [dispatch, message, refresh, t],
  );

  const handleResetFilters = useCallback(() => {
    updateParams({ q: '', key: '', keyValue: '', categoryName: '', sort: 'recent', page: 1 });
  }, [updateParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 78px)', minHeight: 600 }}>
      {/* Three-Column Workspace Layout */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
        {/* Column 1: Left Infinite Category Tree (224px at 1280px, 168px at 960px) */}
        <div style={{ width: 'clamp(160px, 17.5vw, 224px)', flexShrink: 0, height: '100%' }}>
          <CategorySidebarTree
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            itemCounts={categoryCounts}
            totalCount={sidebarTotalCount}
            onArchiveItem={handleArchiveItem}
            onUpdateCategoryParent={handleUpdateCategoryParent}
            onCreateCategory={handleCreateCategory}
          />
        </div>

        {/* Column 2: Center Main Content Workspace */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 4px',
          }}
        >
          <Flex justify="space-between" align="center">
            <Typography.Title level={4} style={{ margin: 0, fontSize: 18, lineHeight: '26px' }}>
              {t('知识库', 'Library')}
            </Typography.Title>
          </Flex>

          <SearchToolbar
            params={params}
            keys={keys}
            onSearch={(q) => updateParams({ q, page: 1 })}
            onSortChange={(sort) => updateParams({ sort, page: 1 })}
            onKeyFilterChange={(key, keyValue) => updateParams({ key, keyValue, page: 1 })}
            onPageSizeChange={(pageSize) => updateParams({ pageSize, page: 1 })}
            onUpload={() => setUploadOpen(true)}
            onCreate={() => {
              setEditingItem(null);
              setFormMode('create');
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <FacetFilterChips
            params={params}
            selectedCategory={selectedCategory}
            categories={categories}
            keys={keys}
            onSelectCategory={handleSelectCategory}
            onKeyFilterChange={(key, keyValue) => updateParams({ key, keyValue, page: 1 })}
            onClearSearch={() => updateParams({ q: '', page: 1 })}
            onResetAll={handleResetFilters}
          />

          <div style={{ flex: 1 }}>
            {error ? (
              <StatePlaceholder variant="error" description={error} onRetry={refresh} />
            ) : loading && !hasItems ? (
              <StatePlaceholder variant="loading" />
            ) : !hasItems ? (
              <StatePlaceholder
                variant="empty"
                description={t('暂无知识记录，点击上传或新建第一条记录', 'No items yet. Click Upload or New Item to add your first record.')}
              />
            ) : viewMode === 'table' ? (
              <ItemTable
                items={items}
                total={total}
                page={page}
                pageSize={pageSize}
                loading={loading}
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
                onDelete={removeItem}
                onOpen={(item: KnowledgeItem) => {
                  setSelectedId(item.id);
                  setPreviewOpen(true);
                }}
                onEdit={(item: KnowledgeItem) => {
                  setEditingItem(item);
                  setFormMode('edit');
                }}
              />
            ) : (
              <ItemCardGrid
                items={items}
                total={total}
                page={page}
                pageSize={pageSize}
                loading={loading}
                selectedId={selectedId}
                categories={categories}
                onPageChange={(nextPage, nextSize) => updateParams({ page: nextPage, pageSize: nextSize })}
                onOpen={(item: KnowledgeItem) => {
                  setSelectedId(item.id);
                  setPreviewOpen(true);
                }}
                onEdit={(item: KnowledgeItem) => {
                  setEditingItem(item);
                  setFormMode('edit');
                }}
                onDelete={removeItem}
              />
            )}
          </div>
        </div>

        {/* Column 3: Right Live Preview & Inspector Panel (356px at 1280px, 264px at 960px) */}
        {previewOpen && (
          <div style={{ width: 'clamp(256px, 27.5vw, 356px)', flexShrink: 0, height: '100%' }}>
            <LivePreviewPanel
              item={selectedItem}
              categories={categories}
              keys={keys}
              onClose={() => setPreviewOpen(false)}
              onEdit={(item: KnowledgeItem) => {
                setEditingItem(item);
                setFormMode('edit');
              }}
              onOpenLocation={handleOpenLocation}
              onPluginUpdate={handlePluginUpdate}
            />
          </div>
        )}
      </div>

      {/* ItemDetailDrawer (opens when ?drawer=1 is set) */}
      <ItemDetailDrawer
        item={typeof window !== 'undefined' && window.location.search.includes('drawer=1') ? selectedItem : null}
        keys={keys}
        categories={categories}
        onClose={() => setSelectedId(null)}
        onDelete={handleDelete}
        onOpenLocation={handleOpenLocation}
        onPluginUpdate={handlePluginUpdate}
        onEdit={(item: KnowledgeItem) => {
          setEditingItem(item);
          setFormMode('edit');
        }}
      />

      <ItemFormModal
        open={formMode !== null}
        mode={formMode ?? 'create'}
        definitions={keys}
        initialValues={formMode === 'edit' ? editingItem?.keyValues : undefined}
        submitting={formSubmitting}
        onCancel={() => {
          setFormMode(null);
          setEditingItem(null);
        }}
        onSubmit={formMode === 'edit' ? handleEditSubmit : handleCreate}
      />

      <UploadModal
        open={uploadOpen}
        definitions={keys}
        uploading={uploadSubmitting}
        progress={uploadProgress}
        onCancel={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default LibraryPage;
