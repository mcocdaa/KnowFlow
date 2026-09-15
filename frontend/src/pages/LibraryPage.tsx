import { Flex, Typography } from 'antd';
import SearchToolbar from '../components/library/SearchToolbar';
import ItemTable from '../components/library/ItemTable';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useCatalog } from '../hooks/useCatalog';
import { useLibrary } from '../hooks/useLibrary';

const LibraryPage = () => {
  const { items, total, page, pageSize, params, loading, error, updateParams, refresh, removeItem } = useLibrary();
  const { keys } = useCatalog();
  const hasItems = items.length > 0;

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
        />
      )}
    </Flex>
  );
};

export default LibraryPage;
