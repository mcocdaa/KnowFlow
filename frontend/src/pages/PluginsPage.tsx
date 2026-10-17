import { Flex, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import StatePlaceholder from '../components/common/StatePlaceholder';
import { usePlugins } from '../hooks/usePlugins';
import { useI18n } from '../i18n';
import { hasPluginComponent } from '../plugins';
import type { PluginManifest } from '../types';

const PluginsPage = () => {
  const { manifests, loading, error, reload } = usePlugins();
  const { t } = useI18n();

  const columns: TableColumnsType<PluginManifest> = [
    {
      title: t('插件', 'Plugin'),
      dataIndex: 'name',
      render: (value: string, record) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.description ? t(record.description) : ''}
          </Typography.Text>
        </Flex>
      ),
    },
    { title: t('版本', 'Version'), dataIndex: 'version', width: 100 },
    { title: t('作者', 'Author'), dataIndex: 'author', width: 120 },
    {
      title: t('前端入口', 'Frontend Entry'),
      dataIndex: 'frontend_entry',
      width: 180,
      render: (value: string) => <Typography.Text code style={{ whiteSpace: 'nowrap' }}>{value}</Typography.Text>,
    },
    {
      title: t('UI 组件', 'UI Component'),
      width: 150,
      render: (_value, record) =>
        hasPluginComponent(record.name) ? (
          <Tag color="green">{t('已注册 UI 组件', 'UI Registered')}</Tag>
        ) : (
          <Tag>{t('仅后端', 'Backend Only')}</Tag>
        ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('插件', 'Plugins')}
      </Typography.Title>
      <Typography.Text type="secondary">
        <ApiOutlined /> {t('已加载的扩展插件列表，支持动态扩展知识项属性与交互组件。', 'Loaded extension plugins that dynamically extend item attributes and interactive UI components.')}
      </Typography.Text>

      {error ? (
        <StatePlaceholder variant="error" description={error} onRetry={reload} />
      ) : loading && manifests.length === 0 ? (
        <StatePlaceholder variant="loading" />
      ) : manifests.length === 0 ? (
        <StatePlaceholder variant="empty" description={t('没有已加载的插件', 'No loaded plugins')} />
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
