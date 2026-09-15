import { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Flex, Popconfirm, Space, Tag, theme, Typography } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { PluginRenderer } from '../../plugins/loader';
import MediaPreviewModal from './MediaPreviewModal';
import JsonBlock from '../common/JsonBlock';
import { formatDateTime } from '../../utils/format';
import { API_BASE_URL } from '../../services/api';
import type { CategoryDefinition, KeyDefinition, KnowledgeItem } from '../../types';

interface ItemDetailDrawerProps {
  item: KnowledgeItem | null;
  keys: KeyDefinition[];
  categories: CategoryDefinition[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: (item: KnowledgeItem) => void;
  onOpenLocation?: (filePath: string) => void;
  onPluginUpdate?: (key: string, value: unknown) => void;
}

interface Field {
  key: string;
  definition?: KeyDefinition;
  value: unknown;
}

interface FieldGroup {
  name: string;
  title: string;
  fields: Field[];
}

const ItemDetailDrawer = ({
  item,
  keys,
  categories,
  onClose,
  onDelete,
  onEdit,
  onOpenLocation,
  onPluginUpdate,
}: ItemDetailDrawerProps) => {
  const { token } = theme.useToken();
  const [previewOpen, setPreviewOpen] = useState(false);

  const groups = useMemo<FieldGroup[]>(() => {
    if (!item) return [];

    const definitionsByName = new Map(keys.map((key) => [key.name, key]));
    const categoryOrder = new Map(categories.map((category, index) => [category.name, index]));
    const categoryTitles = new Map(categories.map((category) => [category.name, category.title]));
    const grouped = new Map<string, FieldGroup>();

    Object.entries(item.keyValues).forEach(([key, value]) => {
      if (key === 'name' || key === 'created_at' || value === undefined) return;

      const definition = item.keyInfo?.[key] ?? definitionsByName.get(key);
      const categoryName = definition?.category_name ?? '';

      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, {
          name: categoryName,
          title: categoryTitles.get(categoryName) ?? (categoryName || '其他'),
          fields: [],
        });
      }
      grouped.get(categoryName)?.fields.push({ key, definition, value });
    });

    return [...grouped.values()].sort(
      (a, b) => (categoryOrder.get(a.name) ?? 99) - (categoryOrder.get(b.name) ?? 99),
    );
  }, [item, keys, categories]);

  const fileType = String(item?.keyValues.file_type ?? '');
  const filePath = String(item?.keyValues.file_path ?? '');
  const mediaType = fileType.startsWith('image')
    ? 'image'
    : fileType.startsWith('video')
      ? 'video'
      : null;
  const fileName = filePath.split('/').pop() ?? '';
  const previewSrc = `${API_BASE_URL}/uploads/${encodeURIComponent(fileName)}`;

  const renderValue = (field: Field) => {
    const { key, definition, value } = field;

    if (definition?.plugin_name && item) {
      return (
        <PluginRenderer
          pluginName={definition.plugin_name}
          value={value}
          itemId={item.id}
          keyDefinition={{
            name: definition.name,
            title: definition.title,
            value_type: definition.value_type,
          }}
          onUpdate={(next) => onPluginUpdate?.(key, next)}
        />
      );
    }

    const valueType = definition?.value_type;
    if (valueType === 'boolean' || typeof value === 'boolean') {
      return <Tag color={value ? 'success' : 'default'}>{value ? '是' : '否'}</Tag>;
    }
    if (valueType === 'number' || typeof value === 'number') {
      return <Typography.Text>{String(value)}</Typography.Text>;
    }
    if (valueType === 'array' || valueType === 'object' || typeof value === 'object') {
      return <JsonBlock value={value} />;
    }
    return (
      <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
        {value === '' || value === null ? '—' : String(value)}
      </Typography.Paragraph>
    );
  };

  return (
    <Drawer
      open={Boolean(item)}
      onClose={onClose}
      width={560}
      title={item?.name || '未命名'}
      destroyOnHidden
      footer={
        item ? (
          <Flex justify="flex-end" gap={8}>
            {onEdit ? (
              <Button icon={<EditOutlined />} onClick={() => onEdit(item)}>
                编辑
              </Button>
            ) : null}
            <Popconfirm
              title="删除这条记录？"
              description="仅删除记录，不会删除已上传的文件。"
              okText="确定"
              cancelText="取消"
              onConfirm={() => onDelete(item.id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Flex>
        ) : null
      }
    >
      {item ? (
        <Flex vertical gap={16}>
          <Space wrap>
            {mediaType ? (
              <Button icon={<PlayCircleOutlined />} onClick={() => setPreviewOpen(true)}>
                预览
              </Button>
            ) : null}
            {onOpenLocation && filePath ? (
              <Button icon={<FolderOpenOutlined />} onClick={() => onOpenLocation(filePath)}>
                打开所在文件夹
              </Button>
            ) : null}
          </Space>

          {groups.map((group) => (
            <div key={group.name || 'other'}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                {group.title}
              </Typography.Title>
              <Descriptions
                column={1}
                size="small"
                bordered
                items={group.fields.map((field) => ({
                  key: field.key,
                  label: field.definition?.title ?? field.key,
                  children: renderValue(field),
                }))}
              />
            </div>
          ))}

          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            创建于 {formatDateTime(item.createdAt)} · 更新于 {formatDateTime(item.updatedAt)}
          </Typography.Text>

          <MediaPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            src={previewSrc}
            mediaType={mediaType ?? 'image'}
          />
        </Flex>
      ) : null}
    </Drawer>
  );
};

export default ItemDetailDrawer;
