import { useState } from 'react';
import { Alert, Button, Flex, Input, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { RobotOutlined, TagsOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { useAI, AI_CORPUS_SIZE } from '../hooks/useAI';
import type { KnowledgeItem } from '../types';

interface TagRow {
  id: string;
  name: string;
  tags: string[];
}

const AIPage = () => {
  const { loading, error, corpus, searchResults, tagResults, semanticSearch, autoTag } = useAI();
  const [query, setQuery] = useState('');

  const searchColumns: TableColumnsType<KnowledgeItem> = [
    {
      title: '匹配记录',
      dataIndex: 'name',
      render: (value: string) => (
        <Link to={`/library?q=${encodeURIComponent(value)}`}>{value || '未命名'}</Link>
      ),
    },
  ];

  const nameById = new Map((corpus?.items ?? []).map((item) => [item.id, item.name]));

  const tagColumns: TableColumnsType<TagRow> = [
    { title: '记录', dataIndex: 'name', width: 240 },
    {
      title: '生成的标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space wrap size={4}>
          {tags.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
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
        AI 助手
      </Typography.Title>

      <Alert
        type="info"
        showIcon
        message={`AI 功能需要后端配置 DOUBAO_API_KEY；每次最多处理最近 ${AI_CORPUS_SIZE} 条记录（后端上限）。`}
      />

      {error ? <Alert type="error" showIcon message={error} /> : null}

      <Tabs
        items={[
          {
            key: 'search',
            label: '语义检索',
            children: (
              <Flex vertical gap={12}>
                <Space.Compact style={{ width: '100%', maxWidth: 640 }}>
                  <Input
                    value={query}
                    placeholder="用自然语言描述你想找的内容，例如：和部署相关的文档"
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
                    检索
                  </Button>
                </Space.Compact>

                {corpus && corpus.total > AI_CORPUS_SIZE ? (
                  <Typography.Text type="secondary">
                    仅对最近 {AI_CORPUS_SIZE} 条生效（共 {corpus.total} 条）
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
                  <StatePlaceholder variant="empty" description="输入问题开始语义检索" />
                )}
              </Flex>
            ),
          },
          {
            key: 'tag',
            label: '自动打标签',
            children: (
              <Flex vertical gap={12}>
                <Space>
                  <Button
                    type="primary"
                    icon={<TagsOutlined />}
                    loading={loading}
                    onClick={() => void autoTag()}
                  >
                    开始打标签
                  </Button>
                  <Typography.Text type="secondary">
                    对最近 {AI_CORPUS_SIZE} 条记录生成中文标签，结果由后端持久化保存。
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
                  <StatePlaceholder variant="empty" description="点击开始打标签" />
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
