import React, { useState } from 'react';
import { Modal, Table, Button, Space, Form, Input, Select, Switch, Popconfirm, App } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setDefinitions } from '../../store/keySlice';
import api from '../../services/api';
import type { KeyDefinition, ValueType } from '../../types';
import { getErrorMessage } from '../../utils';

interface KeyManagerProps {
  visible: boolean;
  onClose: () => void;
}

const VALUE_TYPES: { label: string; value: ValueType }[] = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '数组', value: 'array' },
  { label: '对象', value: 'object' },
];

const isBuiltinKey = (key: KeyDefinition): boolean => key.plugin_name === 'builtin';

const KeyManager: React.FC<KeyManagerProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const { categories, definitionList } = useSelector((state: RootState) => state.key);
  const [activeTab, setActiveTab] = useState<'categories' | 'keys'>('keys');
  const [formVisible, setFormVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<KeyDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const refreshKeys = async () => {
    try {
      const keys = await api.fetchKeys();
      dispatch(setDefinitions(keys));
    } catch (error) {
      message.error(getErrorMessage(error, '刷新 Key 列表失败'));
    }
  };

  const openCreateForm = () => {
    setEditingKey(null);
    form.resetFields();
    form.setFieldsValue({
      value_type: 'string',
      is_required: false,
      is_visible: true,
      category_name: categories[0]?.name,
    });
    setFormVisible(true);
  };

  const openEditForm = (key: KeyDefinition) => {
    setEditingKey(key);
    form.resetFields();
    form.setFieldsValue(key);
    setFormVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingKey) {
        await api.updateKey(editingKey.name, values);
        message.success('Key 更新成功');
      } else {
        await api.createKey(values);
        message.success('Key 创建成功');
      }
      setFormVisible(false);
      await refreshKeys();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return; // 表单校验失败
      message.error(getErrorMessage(error, '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: KeyDefinition) => {
    try {
      await api.deleteKey(key.name);
      message.success('Key 删除成功');
      await refreshKeys();
    } catch (error) {
      message.error(getErrorMessage(error, '删除失败'));
    }
  };

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
      title: '来源',
      dataIndex: 'plugin_name',
      key: 'plugin_name',
      render: (val: string) => val === 'builtin' ? '内置' : (val || '自定义'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, key: KeyDefinition) => (
        <Space>
          <Button
            size="small"
            disabled={isBuiltinKey(key)}
            onClick={() => openEditForm(key)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定删除 Key "${key.name}" 吗？`}
            description="删除后相关属性将不再展示"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(key)}
          >
            <Button size="small" danger disabled={isBuiltinKey(key)}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
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
      width={1100}
      footer={null}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
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
          {activeTab === 'keys' && (
            <Button type="primary" ghost onClick={openCreateForm}>
              新增 Key
            </Button>
          )}
        </Space>
      </div>

      {activeTab === 'keys' && (
        <Table
          columns={keyColumns}
          dataSource={definitionList}
          rowKey="name"
          pagination={{ pageSize: 10 }}
        />
      )}

      {activeTab === 'categories' && (
        <Table
          columns={categoryColumns}
          dataSource={categories}
          rowKey="name"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editingKey ? `编辑 Key: ${editingKey.name}` : '新增 Key'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input disabled={!!editingKey} placeholder="如: author" />
          </Form.Item>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="如: 作者" />
          </Form.Item>
          <Form.Item
            name="value_type"
            label="值类型"
            rules={[{ required: true }]}
          >
            <Select options={VALUE_TYPES} />
          </Form.Item>
          <Form.Item
            name="category_name"
            label="所属分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              options={categories.map(cat => ({ label: cat.title, value: cat.name }))}
              placeholder="选择分类"
            />
          </Form.Item>
          <Form.Item
            name="default_value"
            label="默认值"
          >
            <Input placeholder="可留空" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} placeholder="该字段的说明" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="is_required" label="必填" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="is_visible" label="可见" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Modal>
  );
};

export default KeyManager;
