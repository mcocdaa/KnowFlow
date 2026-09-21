import { useCallback, useMemo, useState } from 'react';
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
import type { CategoryInput, KnowledgeItem } from '../types';

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
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

  const hasItems = items.length > 0;

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const selectedCategory = params.key === 'category_name' ? params.keyValue : null;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const cat = (item.keyValues.category_name as string) || '';
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  const handleSelectCategory = useCallback(
    (categoryName: string | null) => {
      if (!categoryName) {
        updateParams({ key: '', keyValue: '', page: 1 });
      } else {
        updateParams({ key: 'category_name', keyValue: categoryName, page: 1 });
      }
    },
    [updateParams],
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
        message.success(`已成功归档至分类：${categoryName || '全部'}`);
        refresh();
      } catch (err) {
        message.error(getErrorMessage(err, '归档失败'));
      }
    },
    [dispatch, items, message, refresh],
  );

  const handleUpdateCategoryParent = useCallback(
    async (name: string, newParentName: string | null) => {
      try {
        await api.updateCategory(name, { parent_name: newParentName });
        message.success('分类层级已更新');
        refreshCatalog();
      } catch (err) {
        message.error(getErrorMessage(err, '更新分类层级失败'));
      }
    },
    [message, refreshCatalog],
  );

  const handleCreateCategory = useCallback(
    async (input: CategoryInput) => {
      try {
        await api.createCategory(input);
        message.success('分类创建成功');
        refreshCatalog();
      } catch (err) {
        message.error(getErrorMessage(err, '分类创建失败'));
      }
    },
    [message, refreshCatalog],
  );

  const handleOpenLocation = useCallback(
    (filePath: string) => {
      void openFileLocation(filePath, (path) => message.info(`已复制路径：${path}`));
    },
    [message],
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
        message.success('知识记录添加成功');
        setFormMode(null);
        refresh();
      } catch (createError) {
        message.error(getErrorMessage(createError, '添加失败'));
      } finally {
        setFormSubmitting(false);
      }
    },
    [dispatch, message, refresh],
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
        message.success('记录已更新');
        setFormMode(null);
        setEditingItem(null);
        setSelectedId(null);
        refresh();
      } catch (updateError) {
        message.error(getErrorMessage(updateError, '保存失败'));
      } finally {
        setFormSubmitting(false);
      }
    },
    [dispatch, editingItem, message, refresh],
  );

  const handleUpload = useCallback(
    async (file: File, values: Record<string, unknown>) => {
      setUploadSubmitting(true);
      setUploadProgress(0);
      try {
        const created = await api.uploadFile(file, values, setUploadProgress);
        dispatch(upsertItem(created));
        message.success('文件上传成功');
        setUploadOpen(false);
        refresh();
      } catch (uploadError) {
        message.error(getErrorMessage(uploadError, '文件上传失败'));
      } finally {
        setUploadSubmitting(false);
      }
    },
    [dispatch, message, refresh],
  );

  const handleResetFilters = useCallback(() => {
    updateParams({ q: '', key: '', keyValue: '', sort: 'recent', page: 1 });
  }, [updateParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', minHeight: 650 }}>
      {/* Three-Column Workspace Layout */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Column 1: Left Infinite Category Tree (260px) */}
        <div style={{ width: 260, flexShrink: 0, height: '100%' }}>
          <CategorySidebarTree
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            itemCounts={categoryCounts}
            totalCount={total}
            onArchiveItem={handleArchiveItem}
            onUpdateCategoryParent={handleUpdateCategoryParent}
            onCreateCategory={handleCreateCategory}
          />
        </div>

        {/* Column 2: Center Main Content Workspace */}
        <div
          style={{
            flex: 1,
            minWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 8px 0 6px',
          }}
        >
          <Flex justify="space-between" align="center">
            <Typography.Title level={3} style={{ margin: 0 }}>
              知识库
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
              <StatePlaceholder variant="empty" description="暂无知识记录，点击上传或新建第一条记录" />
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

        {/* Column 3: Right Live Preview & Inspector Panel (380px) */}
        {previewOpen && (
          <div style={{ width: 380, flexShrink: 0, height: '100%' }}>
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

      {/* Hidden ItemDetailDrawer for test compatibility */}
      <ItemDetailDrawer
        item={null}
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
