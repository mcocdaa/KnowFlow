import { useRef, useState } from 'react';
import { Button, Flex, Input, Popover, Segmented, Select, Space, Typography } from 'antd';
import { AppstoreOutlined, BarsOutlined, FilterOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ItemSort, KeyDefinition } from '../../types';
import type { LibraryQueryParams } from '../../hooks/useLibrary';

interface SearchToolbarProps {
  params: LibraryQueryParams;
  keys: KeyDefinition[];
  onSearch: (q: string) => void;
  onSortChange: (sort: ItemSort) => void;
  onKeyFilterChange: (key: string, keyValue: string) => void;
  onPageSizeChange: (pageSize: number) => void;
  onUpload?: () => void;
  onCreate?: () => void;
  viewMode?: 'table' | 'card';
  onViewModeChange?: (mode: 'table' | 'card') => void;
}

const sortOptions = [
  { value: 'recent', label: '最近添加' },
  { value: 'rating', label: '评分' },
  { value: 'name', label: '名称' },
];

const pageSizeOptions = [10, 20, 50, 100].map((size) => ({ value: size, label: `${size} 条/页` }));

const SearchToolbar = ({
  params,
  keys,
  onSearch,
  onSortChange,
  onKeyFilterChange,
  onPageSizeChange,
  onUpload,
  onCreate,
  viewMode = 'table',
  onViewModeChange,
}: SearchToolbarProps) => {
  const [value, setValue] = useState(params.q);
  const [lastQ, setLastQ] = useState(params.q);
  const [filterKey, setFilterKey] = useState(params.key);
  const [filterValue, setFilterValue] = useState(params.keyValue);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [lastFilter, setLastFilter] = useState({ key: params.key, keyValue: params.keyValue });
  const debounceRef = useRef<number | undefined>(undefined);

  // URL 变化时同步本地输入（React 官方推荐的“渲染期校正”模式，避免 effect 级联渲染）
  if (lastQ !== params.q) {
    setLastQ(params.q);
    setValue(params.q);
  }
  if (lastFilter.key !== params.key || lastFilter.keyValue !== params.keyValue) {
    setLastFilter({ key: params.key, keyValue: params.keyValue });
    setFilterKey(params.key);
    setFilterValue(params.keyValue);
  }

  const scheduleSearch = (next: string) => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => onSearch(next), 400);
  };

  const commitSearch = (next: string) => {
    window.clearTimeout(debounceRef.current);
    onSearch(next);
  };

  const filterIncomplete = Boolean(filterKey) !== Boolean(filterValue);

  return (
    <Flex wrap gap={12} align="center" justify="space-between">
      <Flex wrap gap={12} align="center">
        <Input.Search
          allowClear
          placeholder="搜索名称或任意属性值"
          value={value}
          style={{ width: 280 }}
          onChange={(event) => {
            setValue(event.target.value);
            scheduleSearch(event.target.value);
          }}
          onSearch={commitSearch}
        />

        <span data-testid="sort-select">
          <Select value={params.sort} options={sortOptions} onChange={onSortChange} style={{ width: 110 }} />
        </span>

        <Popover
          trigger="click"
          open={advancedOpen}
          onOpenChange={setAdvancedOpen}
          content={
            <Space direction="vertical" size={12} style={{ width: 280 }}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="选择 Key"
                value={filterKey || undefined}
                options={keys.map((key) => ({ value: key.name, label: `${key.title} (${key.name})` }))}
                onChange={(next) => setFilterKey(next ?? '')}
                style={{ width: '100%' }}
              />
              <Input
                placeholder="属性值包含"
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
              />
              <Space>
                <Button
                  type="primary"
                  disabled={filterIncomplete}
                  onClick={() => {
                    onKeyFilterChange(filterKey, filterValue);
                    setAdvancedOpen(false);
                  }}
                >
                  应用
                </Button>
                <Button
                  onClick={() => {
                    setFilterKey('');
                    setFilterValue('');
                    onKeyFilterChange('', '');
                    setAdvancedOpen(false);
                  }}
                >
                  清除
                </Button>
              </Space>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                后端要求 Key 与值同时提供才会过滤
              </Typography.Text>
            </Space>
          }
        >
          <Button icon={<FilterOutlined />}>高级筛选</Button>
        </Popover>

        <span data-testid="page-size-select">
          <Select value={params.pageSize} options={pageSizeOptions} onChange={onPageSizeChange} style={{ width: 110 }} />
        </span>

        {onViewModeChange && (
          <span data-testid="view-mode-toggle">
            <Segmented
              value={viewMode}
              onChange={(val) => onViewModeChange(val as 'table' | 'card')}
              options={[
                { value: 'table', icon: <BarsOutlined />, label: '表格' },
                { value: 'card', icon: <AppstoreOutlined />, label: '卡片' },
              ]}
            />
          </span>
        )}
      </Flex>

      <Space>
        {onUpload ? (
          <Button icon={<UploadOutlined />} onClick={onUpload}>
            上传文件
          </Button>
        ) : null}
        {onCreate ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            新建记录
          </Button>
        ) : null}
      </Space>
    </Flex>
  );
};

export default SearchToolbar;
