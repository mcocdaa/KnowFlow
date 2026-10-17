import React from 'react';
import { Button, Flex, Space, Tag, theme } from 'antd';
import { CloseCircleOutlined, FilterOutlined, StarFilled } from '@ant-design/icons';
import type { CategoryDefinition, KeyDefinition, SearchParams } from '../../types';

interface FacetFilterChipsProps {
  params: SearchParams;
  selectedCategory: string | null;
  categories: CategoryDefinition[];
  keys: KeyDefinition[];
  onSelectCategory: (categoryName: string | null) => void;
  onKeyFilterChange: (key: string, keyValue: string) => void;
  onClearSearch: () => void;
  onResetAll: () => void;
}

export const FacetFilterChips: React.FC<FacetFilterChipsProps> = ({
  params,
  selectedCategory,
  categories,
  keys,
  onSelectCategory,
  onKeyFilterChange,
  onClearSearch,
  onResetAll,
}) => {
  const { token } = theme.useToken();

  const categoryMap = new Map(categories.map((c) => [c.name, c.title]));
  const keyMap = new Map(keys.map((k) => [k.name, k.title]));

  const currentCategoryTitle = selectedCategory ? categoryMap.get(selectedCategory) || selectedCategory : null;
  const currentKeyTitle = params.key ? keyMap.get(params.key) || params.key : null;

  const hasAnyFilter = Boolean(
    selectedCategory ||
      params.q ||
      (params.key && params.keyValue) ||
      params.sort !== 'recent'
  );

  const ratingValue = params.key === 'rating' ? params.keyValue : null;
  const fileTypeValue = params.key === 'file_type' ? params.keyValue : null;

  const hasActiveTags = Boolean(
    currentCategoryTitle ||
      (params.key && params.keyValue && params.key !== 'rating' && params.key !== 'file_type') ||
      params.q
  );

  return (
    <div
      style={{
        background: token.colorFillAlter,
        borderRadius: 8,
        padding: '6px 10px',
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Flex vertical gap={hasActiveTags ? 6 : 0}>
        <Flex wrap="wrap" align="center" gap={3}>
          <span style={{ fontSize: 12, color: token.colorTextSecondary, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <FilterOutlined style={{ fontSize: 11 }} /> 快捷过滤:
          </span>

          {/* Rating Facet Chips */}
          <Space orientation="horizontal" size={2} style={{ flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: token.colorTextTertiary }}>评分:</span>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={ratingValue === null}
              onChange={() => {
                if (params.key === 'rating') {
                  onKeyFilterChange('', '');
                }
              }}
            >
              全部
            </Tag.CheckableTag>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={ratingValue === '>=4' || ratingValue === '4'}
              onChange={(checked) => {
                onKeyFilterChange('rating', checked ? '>=4' : '');
              }}
            >
              <StarFilled style={{ color: '#faad14', marginRight: 2 }} /> 4星及以上
            </Tag.CheckableTag>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={ratingValue === '5'}
              onChange={(checked) => {
                onKeyFilterChange('rating', checked ? '5' : '');
              }}
            >
              <StarFilled style={{ color: '#faad14', marginRight: 2 }} /> 5星
            </Tag.CheckableTag>
          </Space>

          <span style={{ color: token.colorBorder, marginInline: 2 }}>|</span>

          {/* File Type Facet Chips */}
          <Space orientation="horizontal" size={2} style={{ flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: token.colorTextTertiary }}>类型:</span>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={fileTypeValue === null}
              onChange={() => {
                if (params.key === 'file_type') {
                  onKeyFilterChange('', '');
                }
              }}
            >
              全部
            </Tag.CheckableTag>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={fileTypeValue === 'pdf'}
              onChange={(checked) => onKeyFilterChange('file_type', checked ? 'pdf' : '')}
            >
              PDF
            </Tag.CheckableTag>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={fileTypeValue === 'markdown'}
              onChange={(checked) => onKeyFilterChange('file_type', checked ? 'markdown' : '')}
            >
              Markdown
            </Tag.CheckableTag>
            <Tag.CheckableTag
              style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 12 }}
              checked={fileTypeValue === 'image'}
              onChange={(checked) => onKeyFilterChange('file_type', checked ? 'image' : '')}
            >
              图片
            </Tag.CheckableTag>
          </Space>

          {!hasActiveTags && hasAnyFilter && (
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={onResetAll}
              style={{ padding: '0 4px', fontSize: 12, marginLeft: 'auto', flexShrink: 0 }}
            >
              重置全部
            </Button>
          )}
        </Flex>

        {/* Active Filter Chips with Close button */}
        {hasActiveTags && (
          <Flex align="center" justify="space-between" gap={6} wrap="wrap">
            <Space orientation="horizontal" size={4} wrap>
              {currentCategoryTitle && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => onSelectCategory(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', marginInlineEnd: 0, fontSize: 12 }}
                >
                  分类: {currentCategoryTitle}
                </Tag>
              )}
              {params.key && params.keyValue && params.key !== 'rating' && params.key !== 'file_type' && (
                <Tag
                  color="purple"
                  closable
                  onClose={() => onKeyFilterChange('', '')}
                  style={{ display: 'inline-flex', alignItems: 'center', marginInlineEnd: 0, fontSize: 12 }}
                >
                  {currentKeyTitle}: {params.keyValue}
                </Tag>
              )}
              {params.q && (
                <Tag
                  color="orange"
                  closable
                  onClose={onClearSearch}
                  style={{ display: 'inline-flex', alignItems: 'center', marginInlineEnd: 0, fontSize: 12 }}
                >
                  搜索: &ldquo;{params.q}&rdquo;
                </Tag>
              )}
            </Space>

            {hasAnyFilter && (
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={onResetAll}
                style={{ padding: '0 4px', fontSize: 12, marginLeft: 'auto', flexShrink: 0 }}
              >
                重置全部
              </Button>
            )}
          </Flex>
        )}
      </Flex>
    </div>
  );
};

export default FacetFilterChips;
