import { useCallback, useMemo, useState } from 'react';
import { App, Flex, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import SearchToolbar from '../components/library/SearchToolbar';
import ItemTable from '../components/library/ItemTable';
import ItemDetailDrawer from '../components/library/ItemDetailDrawer';
import ItemFormModal from '../components/library/ItemFormModal';
import UploadModal from '../components/library/UploadModal';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useCatalog } from '../hooks/useCatalog';
import { useLibrary } from '../hooks/useLibrary';
import { upsertItem } from '../store/librarySlice';
import api from '../services/api';
import { getErrorMessage, openFileLocation } from '../utils';
import type { KnowledgeItem } from '../types';

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const { items, total, page, pageSize, params, loading, error, updateParams, refresh, removeItem } = useLibrary();
  const { keys, categories } = useCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        知识库
      </Typography.Title>

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
      />

      {error ? (
        <StatePlaceholder variant="error" description={error} onRetry={refresh} />
      ) : loading && !hasItems ? (
        <StatePlaceholder variant="loading" />
      ) : !hasItems ? (
        <StatePlaceholder variant="empty" description="暂无知识记录，点击上传或新建第一条记录" />
      ) : (
        <ItemTable
          items={items}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          onPageChange={(nextPage) => updateParams({ page: nextPage })}
          onDelete={removeItem}
          onOpen={(item: KnowledgeItem) => setSelectedId(item.id)}
          onEdit={(item: KnowledgeItem) => {
            setEditingItem(item);
            setFormMode('edit');
          }}
        />
      )}

      <ItemDetailDrawer
        item={selectedItem}
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
    </Flex>
  );
};

export default LibraryPage;
