import React, { useState } from 'react';
import { Modal, Button, Input, Space, App } from 'antd';
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
}

const AIAssistant: React.FC<AIAssistantProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const { items } = useSelector((state: RootState) => state.knowledge);
  const [activeTab, setActiveTab] = useState<'tag' | 'search'>('tag');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSemanticSearch = async () => {
    if (!query) {
      message.error('请输入查询内容');
      return;
    }

    setLoading(true);
    try {
      const searchResults = await api.aiSearch(query, items);
      dispatch(setSearchResults(searchResults));
      message.success('语义检索完成');
    } catch (error) {
      console.error('Semantic search error:', error);
      message.error(getErrorMessage(error, '语义检索失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTag = async () => {
    setLoading(true);
    try {
      await api.autoTag(items);
      message.success('自动打标签完成');
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
            <p>为选中的文件自动生成标签</p>
            <Button
              type="primary"
              icon={<TagOutlined />}
              onClick={handleAutoTag}
              loading={loading}
            >
              开始打标签
            </Button>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default AIAssistant;
