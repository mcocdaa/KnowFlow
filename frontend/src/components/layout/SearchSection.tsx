import React from 'react';
import { Select } from 'antd';
import { SearchOutlined, SortAscendingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SearchSectionWrapper, StyledSearch } from './layout-styles';
import { COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../../theme';

const { Option } = Select;

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

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

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
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  sortBy,
  onSortByChange,
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
              <Option value="recent">最近添加</Option>
              <Option value="rating">评分</Option>
            </Select>
          </SelectWrapper>
        </FilterGroup>
      </SearchContainer>
    </SearchSectionWrapper>
  );
};

export default SearchSection;
