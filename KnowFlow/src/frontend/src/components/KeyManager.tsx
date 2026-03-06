import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Table, Popconfirm, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addCategory, deleteCategory, addKeyDefinition, updateKeyDefinition, deleteKeyDefinition } from '../store/keySlice';

const { Option } = Select;
const { TextArea } = Input;

interface KeyManagerProps {
  visible: boolean;
  onClose: () => void;
}

const KeyManager: React.FC<KeyManagerProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { categories, definitions } = useSelector((state: RootState) => state.key);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'keys'>('keys');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);

  const handleAddKey = () => {
    form.resetFields();
    setEditingKey(null);
    setActiveTab('keys');
    setShowKeyForm(true);
  };

  const handleEditKey = (key: any) => {
    form.setFieldsValue(key);
    setEditingKey(key.id);
    setActiveTab('keys');
    setShowKeyForm(true);
  };

  const handleDeleteKey = (keyId: string) => {
    const key = definitions.find(k => k.id === keyId);
    if (key && key.isBuiltin) {
      message.error('内置Key不可删除');
      return;
    }
    dispatch(deleteKeyDefinition(keyId));
    message.success('Key删除成功');
  };

  const handleAddCategory = () => {
    categoryForm.resetFields();
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (values: any) => {
    try {
      const response = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          parentId: '8', // 自定义Key分类
          isBuiltin: false
        }),
      });
      if (response.ok) {
        const newCategory = await response.json();
        dispatch(addCategory({
          name: newCategory.name,
          parentId: newCategory.parentId,
          isBuiltin: newCategory.isBuiltin
        }));
        message.success('分类创建成功');
        setShowCategoryModal(false);
      } else {
        message.error('分类创建失败');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('分类创建失败');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.isBuiltin) {
      message.error('内置分类不可删除');
      return;
    }
    dispatch(deleteCategory(categoryId));
    message.success('分类删除成功');
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingKey) {
        // 更新Key
        dispatch(updateKeyDefinition({
          ...values,
          id: editingKey
        }));
        message.success('Key更新成功');
      } else {
        // 创建新Key
        const response = await fetch('http://localhost:3000/api/keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            isBuiltin: false
          }),
        });
        if (response.ok) {
            const newKey = await response.json();
            // 从newKey中提取所需的属性，包括id
            const { id, name, categoryId, script, description, dataType } = newKey;
            dispatch(addKeyDefinition({
              id,
              name,
              categoryId,
              isBuiltin: false,
              script: script || '',
              description: description || '',
              dataType: dataType || 'string'
            }));
            message.success('Key创建成功');
          } else {
            message.error('Key创建失败');
            return;
          }
      }
      form.resetFields();
      setEditingKey(null);
      setShowKeyForm(false);
    } catch (error) {
      console.error('Error handling key:', error);
      message.error('操作失败');
    }
  };

  const keyColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : '';
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => createdAt ? new Date(createdAt).toLocaleString() : '',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => handleEditKey(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此Key吗？"
            onConfirm={() => handleDeleteKey(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              disabled={record.isBuiltin}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const categoryColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <span style={{ fontWeight: record.isBuiltin ? 'bold' : 'normal' }}>
          {name}
          {record.isBuiltin && <span style={{ marginLeft: 8, color: '#1890ff' }}>(内置)</span>}
        </span>
      ),
    },
    {
      title: '父分类',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: string | null) => {
        if (!parentId) return '根分类';
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : '';
      },
    },
    {
      title: '类型',
      dataIndex: 'isBuiltin',
      key: 'isBuiltin',
      render: (isBuiltin: boolean) => isBuiltin ? '内置' : '自定义',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm
          title="确定删除此分类吗？"
          onConfirm={() => handleDeleteCategory(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            disabled={record.isBuiltin}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title="Key管理"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <Space>
          <Button
            type={activeTab === 'keys' ? 'primary' : 'default'}
            onClick={() => setActiveTab('keys')}
          >
            Key列表
            <Button
              type="text"
              icon={<PlusOutlined />}
              style={{ marginLeft: 8 }}
              onClick={handleAddKey}
            />
          </Button>
          <Button
            type={activeTab === 'categories' ? 'primary' : 'default'}
            onClick={() => setActiveTab('categories')}
          >
            分类列表
            <Button
              type="text"
              icon={<PlusOutlined />}
              style={{ marginLeft: 8 }}
              onClick={handleAddCategory}
            />
          </Button>
        </Space>
      </div>

      {activeTab === 'keys' && (
        <div>


          {showKeyForm && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                name="name"
                label="Key名称"
                rules={[{ required: true, message: '请输入Key名称' }]}
              >
                <Input placeholder="请输入Key名称" />
              </Form.Item>
              <Form.Item
                name="categoryId"
                label="所属分类"
                rules={[{ required: true, message: '请选择所属分类' }]}
              >
                <Select placeholder="请选择所属分类">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="script"
                label="小脚本"
              >
                <TextArea
                  placeholder="输入小脚本代码，如：function extractFileName(filePath) { return filePath.split('/').pop(); }"
                  rows={4}
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="描述"
              >
                <Input placeholder="请输入Key描述" />
              </Form.Item>
              <Form.Item
                name="dataType"
                label="数据类型"
                initialValue="string"
              >
                <Select placeholder="请选择数据类型">
                  <Option value="string">字符串</Option>
                  <Option value="number">数字</Option>
                  <Option value="boolean">布尔值</Option>
                  <Option value="date">日期</Option>
                  <Option value="timestamp">时间戳</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {editingKey ? '更新' : '创建'}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => setShowKeyForm(false)}>
                  取消
                </Button>
              </Form.Item>
            </Form>
          )}

          <Table
            columns={keyColumns}
            dataSource={definitions}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {activeTab === 'categories' && (
        <div>


          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {/* 新增分类Modal */}
      <Modal
        title="新增分类"
        open={showCategoryModal}
        onCancel={() => setShowCategoryModal(false)}
        footer={null}
        width={400}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setShowCategoryModal(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default KeyManager;
