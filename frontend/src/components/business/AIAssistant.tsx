import React, { useState } from 'react';
import { Modal, Button, Input, Space, App, Tag, List, Typography } from 'antd';
import { TagOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setSearchResults } from '../../store/knowledgeSlice';
import api from '../../services/api';
import { getErrorMessage } from '../../utils';

const { TextArea } = Input;

interface AIAssistantProps {
  visible: boolean;
  onClose: () => void;
  onSearchResult?: () => void;
}

interface TagResult {
  id: string;
  name: string;
  tags: string[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ visible, onClose, onSearchResult }) => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const { items } = useSelector((state: RootState) => state.knowledge);
  const [activeTab, setActiveTab] = useState<'tag' | 'search'>('tag');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tagResults, setTagResults] = useState<TagResult[]>([]);

  const handleSemanticSearch = async () => {
    if (!query) {
      message.error('请输入查询内容');
      return;
    }

    if (items.length > 50) {
      message.warning(`共 ${items.length} 条，仅检索前 50 条`);
    }

    setLoading(true);
    try {
      const searchResults = await api.aiSearch(query, items);
      dispatch(setSearchResults(searchResults));
      message.success(`语义检索完成，找到 ${searchResults.length} 条结果`);
      onSearchResult?.();
    } catch (error) {
      console.error('Semantic search error:', error);
      message.error(getErrorMessage(error, '语义检索失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTag = async () => {
    if (items.length === 0) {
      message.info('暂无知识项可打标签');
      return;
    }

    if (items.length > 50) {
      message.warning(`共 ${items.length} 条，仅处理前 50 条`);
    }

    setLoading(true);
    try {
      const results = await api.autoTag(items);
      const list: TagResult[] = items
        .filter(item => (results[item.id] || []).length > 0)
        .map(item => ({
          id: item.id,
          name: item.name,
          tags: results[item.id] || [],
        }));
      setTagResults(list);
      message.success(`自动打标签完成，已保存 ${list.length} 个知识项`);
    } catch (error) {
      console.error('Auto tag error:', error);
      message.error(getErrorMessage(error, '自动打标签失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="AI 助手"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={null}
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        <Space>
          <Button
            type={activeTab === 'search' ? 'primary' : 'default'}
            icon={<SearchOutlined />}
            onClick={() => setActiveTab('search')}
          >
            语义检索
          </Button>
          <Button
            type={activeTab === 'tag' ? 'primary' : 'default'}
            icon={<TagOutlined />}
            onClick={() => setActiveTab('tag')}
          >
            自动打标签
          </Button>
        </Space>

        {activeTab === 'search' && (
          <div>
            <TextArea
              placeholder="输入自然语言查询，例如：找关于深度学习的文献"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              style={{ marginBottom: 16 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSemanticSearch}
              loading={loading}
            >
              开始检索
            </Button>
          </div>
        )}

        {activeTab === 'tag' && (
          <div>
            <p>为知识项自动生成 2-5 个中文标签并保存</p>
            <Button
              type="primary"
              icon={<TagOutlined />}
              onClick={handleAutoTag}
              loading={loading}
            >
              开始打标签
            </Button>

            {tagResults.length > 0 && (
              <List
                size="small"
                style={{ marginTop: 16 }}
                dataSource={tagResults}
                renderItem={item => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Typography.Text strong>{item.name}</Typography.Text>
                      <div style={{ marginTop: 4 }}>
                        {item.tags.map(tag => (
                          <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default AIAssistant;
