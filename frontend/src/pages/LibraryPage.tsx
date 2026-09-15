import { useCallback, useMemo, useState } from 'react';
import { App, Flex, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import SearchToolbar from '../components/library/SearchToolbar';
import ItemTable from '../components/library/ItemTable';
import ItemDetailDrawer from '../components/library/ItemDetailDrawer';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useCatalog } from '../hooks/useCatalog';
import { useLibrary } from '../hooks/useLibrary';
import { upsertItem } from '../store/librarySlice';
import { openFileLocation } from '../utils';
import type { KnowledgeItem } from '../types';

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const { items, total, page, pageSize, params, loading, error, updateParams, refresh, removeItem } = useLibrary();
  const { keys, categories } = useCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      />
    </Flex>
  );
};

export default LibraryPage;
