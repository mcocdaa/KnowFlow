import { useRef, useState } from 'react';
import { Button, Flex, Input, Popover, Segmented, Select, Space, Typography } from 'antd';
import { AppstoreOutlined, BarsOutlined, FilterOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ItemSort, KeyDefinition } from '../../types';
import type { LibraryQueryParams } from '../../hooks/useLibrary';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
  const [value, setValue] = useState(params.q);
  const [lastQ, setLastQ] = useState(params.q);
  const [filterKey, setFilterKey] = useState(params.key);
  const [filterValue, setFilterValue] = useState(params.keyValue);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [lastFilter, setLastFilter] = useState({ key: params.key, keyValue: params.keyValue });
  const debounceRef = useRef<number | undefined>(undefined);

  const sortOptions = [
    { value: 'recent', label: t('最近添加', 'Newest') },
    { value: 'rating', label: t('评分', 'Rating') },
    { value: 'name', label: t('名称', 'Name') },
  ];

  const pageSizeOptions = [10, 20, 50, 100].map((size) => ({
    value: size,
    label: t(`${size} 条/页`, `${size} / page`),
  }));

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
    <Flex vertical gap={8}>
      <Flex gap={6} align="center" justify="space-between" wrap="wrap">
        <Input.Search
          allowClear
          placeholder={t('搜索名称或任意属性值', 'Search title or attributes...')}
          value={value}
          style={{ flex: 1, minWidth: 105 }}
          onChange={(event) => {
            setValue(event.target.value);
            scheduleSearch(event.target.value);
          }}
          onSearch={commitSearch}
        />

        <Space size={6} style={{ flexShrink: 0 }}>
          {onUpload ? (
            <Button icon={<UploadOutlined />} onClick={onUpload}>
              {t('上传文件', 'Upload')}
            </Button>
          ) : null}
          {onCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              {t('新建记录', 'New Item')}
            </Button>
          ) : null}
        </Space>
      </Flex>

      <Flex gap={6} align="center" justify="space-between" wrap="wrap">
        <Space size={6} wrap>
          <span data-testid="sort-select">
            <Select value={params.sort} options={sortOptions} onChange={onSortChange} style={{ width: 98 }} />
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
                  placeholder={t('选择 Key', 'Select Key')}
                  value={filterKey || undefined}
                  options={keys.map((key) => ({ value: key.name, label: `${t(key.title)} (${key.name})` }))}
                  onChange={(next) => setFilterKey(next ?? '')}
                  style={{ width: '100%' }}
                />
                <Input
                  placeholder={t('属性值包含', 'Attribute value contains...')}
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
                    {t('应用', 'Apply')}
                  </Button>
                  <Button
                    onClick={() => {
                      setFilterKey('');
                      setFilterValue('');
                      onKeyFilterChange('', '');
                      setAdvancedOpen(false);
                    }}
                  >
                    {t('清除', 'Clear')}
                  </Button>
                </Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t('请同时选择属性字段并输入匹配值以应用筛选', 'Select both a key and value to apply the filter')}
                </Typography.Text>
              </Space>
            }
          >
            <Button icon={<FilterOutlined />}>{t('高级筛选', 'Filters')}</Button>
          </Popover>

          <span data-testid="page-size-select">
            <Select value={params.pageSize} options={pageSizeOptions} onChange={onPageSizeChange} style={{ width: 112 }} />
          </span>
        </Space>

        {onViewModeChange && (
          <span data-testid="view-mode-toggle" style={{ flexShrink: 0 }}>
            <Segmented
              value={viewMode}
              onChange={(val) => onViewModeChange(val as 'table' | 'card')}
              options={[
                { value: 'table', icon: <BarsOutlined />, label: t('表格', 'Table') },
                { value: 'card', icon: <AppstoreOutlined />, label: t('卡片', 'Cards') },
              ]}
            />
          </span>
        )}
      </Flex>
    </Flex>
  );
};

export default SearchToolbar;
