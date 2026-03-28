import React, { useState } from 'react';
import { Modal, Table, Button, Space } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface KeyManagerProps {
  visible: boolean;
  onClose: () => void;
}

const KeyManager: React.FC<KeyManagerProps> = ({ visible, onClose }) => {
  const { categories, definitionList } = useSelector((state: RootState) => state.key);
  const [activeTab, setActiveTab] = useState<'categories' | 'keys'>('keys');

  const keyColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: '类型',
      dataIndex: 'value_type',
      key: 'value_type',
    },
    {
      title: '是否必填',
      dataIndex: 'is_required',
      key: 'is_required',
      render: (val: boolean) => val ? '是' : '否',
    },
    {
      title: '是否可见',
      dataIndex: 'is_visible',
      key: 'is_visible',
      render: (val: boolean) => val ? '是' : '否',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const categoryColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '父分类',
      dataIndex: 'parent_name',
      key: 'parent_name',
      render: (parentName: string | null) => parentName || '根分类',
    },
    {
      title: '类型',
      dataIndex: 'is_builtin',
      key: 'is_builtin',
      render: (isBuiltin: boolean) => isBuiltin ? '内置' : '自定义',
    },
  ];

  return (
    <Modal
      title="Key管理"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <Space>
          <Button
            type={activeTab === 'keys' ? 'primary' : 'default'}
            onClick={() => setActiveTab('keys')}
          >
            Key列表
          </Button>
          <Button
            type={activeTab === 'categories' ? 'primary' : 'default'}
            onClick={() => setActiveTab('categories')}
          >
            分类列表
          </Button>
        </Space>
      </div>

      {activeTab === 'keys' && (
        <div>
          <Table
            columns={keyColumns}
            dataSource={definitionList}
            rowKey="name"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey="name"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}
    </Modal>
  );
};

export default KeyManager;
