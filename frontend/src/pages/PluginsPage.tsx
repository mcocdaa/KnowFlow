import { Flex, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { usePlugins } from '../hooks/usePlugins';
import { hasPluginComponent } from '../plugins/loader';
import type { PluginManifest } from '../types';

const PluginsPage = () => {
  const { manifests, loading, error, reload } = usePlugins();

  const columns: TableColumnsType<PluginManifest> = [
    {
      title: '插件',
      dataIndex: 'name',
      render: (value: string, record) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Typography.Text>
        </Flex>
      ),
    },
    { title: '版本', dataIndex: 'version', width: 100 },
    { title: '作者', dataIndex: 'author', width: 120 },
    {
      title: '前端入口',
      dataIndex: 'frontend_entry',
      width: 140,
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: 'UI 组件',
      width: 150,
      render: (_value, record) =>
        hasPluginComponent(record.name) ? (
          <Tag color="green">已注册 UI 组件</Tag>
        ) : (
          <Tag>仅后端</Tag>
        ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        插件
      </Typography.Title>
      <Typography.Text type="secondary">
        <ApiOutlined /> 列表来自后端 <Typography.Text code>/plugins/manifests</Typography.Text>
        ，通过 plugins.yaml 启停插件。
      </Typography.Text>

      {error ? (
        <StatePlaceholder variant="error" description={error} onRetry={reload} />
      ) : loading && manifests.length === 0 ? (
        <StatePlaceholder variant="loading" />
      ) : manifests.length === 0 ? (
        <StatePlaceholder variant="empty" description="没有已加载的插件" />
      ) : (
        <Table<PluginManifest>
          rowKey="name"
          size="middle"
          columns={columns}
          dataSource={manifests}
          loading={loading}
          pagination={false}
        />
      )}
    </Flex>
  );
};

export default PluginsPage;
