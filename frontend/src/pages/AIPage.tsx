import { useState } from 'react';
import { Alert, Button, Flex, Input, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { RobotOutlined, TagsOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useAI, AI_CORPUS_SIZE } from '../hooks/useAI';
import { useI18n } from '../i18n';
import type { KnowledgeItem } from '../types';

interface TagRow {
  id: string;
  name: string;
  tags: string[];
}

const AIPage = () => {
  const { loading, error, corpus, searchResults, tagResults, semanticSearch, autoTag } = useAI();
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const searchColumns: TableColumnsType<KnowledgeItem> = [
    {
      title: t('匹配记录', 'Matched Item'),
      dataIndex: 'name',
      render: (value: string) => (
        <Link to={`/library?q=${encodeURIComponent(value)}`}>{value || t('未命名', 'Untitled')}</Link>
      ),
    },
  ];

  const nameById = new Map((corpus?.items ?? []).map((item) => [item.id, item.name]));

  const tagColumns: TableColumnsType<TagRow> = [
    { title: t('记录', 'Item'), dataIndex: 'name', width: 360 },
    {
      title: t('生成的标签', 'Generated Tags'),
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space wrap size={4}>
          {tags.map((tag) => (
            <Tag key={tag} color="blue">
              {t(tag)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  const tagRows: TagRow[] = tagResults
    ? Object.entries(tagResults).map(([id, tags]) => ({
        id,
        name: nameById.get(id) ?? id,
        tags,
      }))
    : [];

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('AI 助手', 'AI Assistant')}
      </Typography.Title>

      <Alert
        type="info"
        showIcon
        message={t(
          `支持基于自然语言的知识库语义检索与智能标签提取（单次处理范围涵盖最近 ${AI_CORPUS_SIZE} 条记录）。`,
          `Supports natural-language semantic search and automatic tag extraction across the latest ${AI_CORPUS_SIZE} knowledge items.`,
        )}
      />

      {error ? <Alert type="error" showIcon message={error} /> : null}

      <Tabs
        items={[
          {
            key: 'search',
            label: t('语义检索', 'Semantic Search'),
            children: (
              <Flex vertical gap={12}>
                <Space.Compact style={{ width: '100%', maxWidth: 640 }}>
                  <Input
                    value={query}
                    placeholder={t('用自然语言描述你想找的内容，例如：和部署相关的文档', 'Describe what you are looking for in natural language, e.g., deployment docs...')}
                    onChange={(event) => setQuery(event.target.value)}
                    onPressEnter={() => {
                      if (query.trim()) void semanticSearch(query.trim());
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    loading={loading}
                    onClick={() => {
                      if (query.trim()) void semanticSearch(query.trim());
                    }}
                  >
                    {t('检索', 'Search')}
                  </Button>
                </Space.Compact>

                {corpus && corpus.total > AI_CORPUS_SIZE ? (
                  <Typography.Text type="secondary">
                    {t(
                      `仅对最近 ${AI_CORPUS_SIZE} 条生效（共 ${corpus.total} 条）`,
                      `Applies to the latest ${AI_CORPUS_SIZE} items (${corpus.total} total)`,
                    )}
                  </Typography.Text>
                ) : null}

                {searchResults.length > 0 ? (
                  <Table<KnowledgeItem>
                    rowKey="id"
                    size="middle"
                    columns={searchColumns}
                    dataSource={searchResults}
                    pagination={false}
                  />
                ) : (
                  <StatePlaceholder variant="empty" description={t('输入问题开始语义检索', 'Enter a query to start semantic search')} />
                )}
              </Flex>
            ),
          },
          {
            key: 'tag',
            label: t('自动打标签', 'Auto Tagging'),
            children: (
              <Flex vertical gap={12}>
                <Space>
                  <Button
                    type="primary"
                    icon={<TagsOutlined />}
                    loading={loading}
                    onClick={() => void autoTag()}
                  >
                    {t('开始打标签', 'Generate Tags')}
                  </Button>
                  <Typography.Text type="secondary">
                    {t(
                      `为最近 ${AI_CORPUS_SIZE} 条知识记录智能生成中文分类标签并自动保存。`,
                      `Automatically generate and save classification tags for the latest ${AI_CORPUS_SIZE} items.`,
                    )}
                  </Typography.Text>
                </Space>

                {tagRows.length > 0 ? (
                  <Table<TagRow>
                    rowKey="id"
                    size="middle"
                    columns={tagColumns}
                    dataSource={tagRows}
                    pagination={false}
                  />
                ) : (
                  <StatePlaceholder variant="empty" description={t('点击开始打标签', 'Click Generate Tags to start auto-tagging')} />
                )}
              </Flex>
            ),
          },
        ]}
      />
    </Flex>
  );
};

export default AIPage;
