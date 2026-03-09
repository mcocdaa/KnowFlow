/**
 * SearchSection 组件
 * 现代化搜索区域设计
 */

import React from 'react';
import { Select } from 'antd';
import { SearchOutlined, SortAscendingOutlined, FilterOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SearchSectionWrapper, StyledSearch } from './layout-styles';
import { COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../../theme';

const { Option } = Select;

// 自定义选择器容器
const SelectWrapper = styled.div`
  .ant-select {
    min-width: 140px !important;
    
    .ant-select-selector {
      border-radius: ${BORDER_RADIUS.md} !important;
      border: 2px solid ${COLORS.border} !important;
      height: 44px !important;
      padding: 0 16px !important;
      background: ${COLORS.white} !important;
      transition: all ${TRANSITIONS.normal} !important;
      box-shadow: none !important;
      
      &:hover {
        border-color: ${COLORS.primaryLight} !important;
        background: ${COLORS.primaryLighter} !important;
      }
    }
    
    &.ant-select-focused .ant-select-selector {
      border-color: ${COLORS.primary} !important;
      box-shadow: ${SHADOWS.input} !important;
    }
    
    .ant-select-selection-item {
      line-height: 40px !important;
      font-weight: 500 !important;
    }
    
    .ant-select-selection-placeholder {
      line-height: 40px !important;
      color: ${COLORS.textPlaceholder} !important;
    }
    
    .ant-select-arrow {
      color: ${COLORS.textLight} !important;
    }
  }
`;

// 搜索容器
const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// 筛选器组
const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// 图标包装器
const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${COLORS.textSecondary};
  font-size: 14px;
  font-weight: 500;
  
  .anticon {
    font-size: 16px;
  }
`;

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  activeTab: string;
  sortBy: string;
  onSortByChange: (value: string) => void;
  searchKey: string;
  onSearchKeyChange: (value: string) => void;
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  definitionList: any[];
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  activeTab,
  sortBy,
  onSortByChange,
  searchKey,
  onSearchKeyChange,
  categories,
  selectedCategory,
  onCategoryChange,
  definitionList,
}) => {
  return (
    <SearchSectionWrapper>
      <SearchContainer>
        <StyledSearch
          placeholder="搜索文件或知识内容..."
          allowClear
          enterButton={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined />
              搜索
            </span>
          }
          size="large"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={onSearch}
        />
        
        <FilterGroup>
          <IconWrapper>
            <SortAscendingOutlined />
            排序
          </IconWrapper>
          <SelectWrapper>
            <Select 
              value={sortBy} 
              onChange={onSortByChange}
              style={{ width: 150 }}
            >
              <Option value="clickCount">点击次数</Option>
              <Option value="recent">最近添加</Option>
              <Option value="rating">评分</Option>
            </Select>
          </SelectWrapper>
          
          {activeTab === 'all' && (
            <>
              <IconWrapper>
                <FilterOutlined />
                分类
              </IconWrapper>
              <SelectWrapper>
                <Select 
                  value={selectedCategory}
                  onChange={onCategoryChange}
                  style={{ width: 150 }}
                  placeholder="选择分类"
                >
                  <Option value="">全部分类</Option>
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                  ))}
                </Select>
              </SelectWrapper>
            </>
          )}
          
          {activeTab === 'advanced' && (
            <>
              <IconWrapper>
                <FilterOutlined />
                字段
              </IconWrapper>
              <SelectWrapper>
                <Select 
                  value={searchKey}
                  onChange={onSearchKeyChange}
                  style={{ width: 200 }}
                  placeholder="选择搜索字段"
                >
                  <Option value="">所有字段</Option>
                  {definitionList.map(def => (
                    <Option key={def.id} value={def.id}>{def.name}</Option>
                  ))}
                </Select>
              </SelectWrapper>
            </>
          )}
        </FilterGroup>
      </SearchContainer>
    </SearchSectionWrapper>
  );
};

export default SearchSection;
