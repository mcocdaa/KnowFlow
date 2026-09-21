import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  Image,
  Rate,
  Segmented,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  CloseOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';
import FileIcon from '../common/FileIcon';
import type { CategoryDefinition, KeyDefinition, KnowledgeItem } from '../../types';
import { detectPreviewType, getFileExtension, getFileUrl } from '../../utils/fileUrl';
import { formatDateTime } from '../../utils';
import StarRating from '../../plugins/components/StarRating';

interface LivePreviewPanelProps {
  item: KnowledgeItem | null;
  categories: CategoryDefinition[];
  keys: KeyDefinition[];
  onClose: () => void;
  onEdit?: (item: KnowledgeItem) => void;
  onOpenLocation?: (filePath: string) => void;
  onPluginUpdate?: (key: string, value: unknown) => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  item,
  categories,
  keys,
  onClose,
  onEdit,
  onOpenLocation,
  onPluginUpdate,
}) => {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState<'preview' | 'meta'>('preview');
  const [loadedData, setLoadedData] = useState<{ url: string; content: string } | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.name, c.title])), [categories]);
  const keyMap = useMemo(() => new Map(keys.map((k) => [k.name, k])), [keys]);

  const filePath = item?.keyValues.file_path as string | undefined;
  const fileType = item?.keyValues.file_type as string | undefined;
  const fileUrl = useMemo(() => getFileUrl(filePath), [filePath]);
  const previewType = useMemo(() => detectPreviewType(fileType, filePath), [fileType, filePath]);
  const ext = useMemo(() => getFileExtension(filePath), [filePath]);
  const fileContent = loadedData?.url === fileUrl ? loadedData.content : '';
  const isTextPreview = previewType === 'markdown' || previewType === 'code' || previewType === 'text';
  const loadingContent = Boolean(item && fileUrl && isTextPreview && loadedData?.url !== fileUrl && !contentError);

  // Fetch text content for Markdown and Code files
  useEffect(() => {
    let cancelled = false;
    if (!item || !fileUrl) {
      return;
    }

    if (isTextPreview && loadedData?.url !== fileUrl) {
      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`加载失败: ${res.statusText}`);
          return res.text();
        })
        .then((text) => {
          if (!cancelled) {
            setLoadedData({ url: fileUrl, content: text });
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setContentError(String(err.message || '文件内容加载失败'));
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [item, fileUrl, isTextPreview, loadedData?.url]);

  // Render markdown to HTML safely
  const renderedMarkdown = useMemo(() => {
    if (!fileContent) return '';
    try {
      return marked.parse(fileContent) as string;
    } catch {
      return fileContent;
    }
  }, [fileContent]);

  if (!item) {
    return (
      <Card
        size="small"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="选择左侧知识项以快速预览与检查属性"
        />
      </Card>
    );
  }

  const categoryName = (item.keyValues.category_name as string) || '';
  const categoryTitle = categoryMap.get(categoryName) || categoryName;

  // Determine monaco language from extension
  const codeLanguage = (() => {
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'sql':
        return 'sql';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'plaintext';
    }
  })();

  return (
    <Card
      size="small"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
      bodyStyle={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Header */}
      <Flex justify="space-between" align="start" gap={8} style={{ marginBottom: 12 }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
            <FileIcon fileType={fileType} />
            <Typography.Text strong ellipsis style={{ fontSize: 15, maxWidth: 220 }}>
              {item.name}
            </Typography.Text>
          </Flex>
          <Space size={6} wrap>
            {categoryTitle && <Tag color="blue">{categoryTitle}</Tag>}
            {ext && <Tag color="cyan">.{ext.toUpperCase()}</Tag>}
            {item.keyValues.rating !== undefined && (
              <Rate disabled allowHalf value={Number(item.keyValues.rating)} style={{ fontSize: 12 }} />
            )}
          </Space>
        </div>
        <Space size={4}>
          {onEdit && (
            <Tooltip title="编辑知识项">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(item)} />
            </Tooltip>
          )}
          <Tooltip title="关闭预览">
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
          </Tooltip>
        </Space>
      </Flex>

      {/* Tabs */}
      <Segmented
        block
        value={activeTab}
        onChange={(val) => setActiveTab(val as 'preview' | 'meta')}
        options={[
          { label: '实时极速预览', value: 'preview', icon: <EyeOutlined /> },
          { label: '属性与插件', value: 'meta', icon: <InfoCircleOutlined /> },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'preview' ? (
          <div
            style={{
              flex: 1,
              borderRadius: 6,
              background: token.colorFillAlter,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!filePath ? (
              <Flex vertical justify="center" align="center" style={{ flex: 1, padding: 24 }}>
                <Empty description="该知识记录未挂载文件附件" />
              </Flex>
            ) : previewType === 'pdf' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '6px 12px',
                    background: token.colorFillSecondary,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FilePdfOutlined style={{ color: '#ff4d4f' }} /> PDF.js 原生极速预览
                  </span>
                  <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                    新标签页打开
                  </a>
                </div>
                <iframe
                  src={`${fileUrl}#toolbar=1`}
                  title={item.name}
                  style={{ width: '100%', flex: 1, border: 'none' }}
                />
              </div>
            ) : previewType === 'markdown' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '6px 12px',
                    background: token.colorFillSecondary,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Markdown 语法排版渲染</span>
                  {fileContent && (
                    <Typography.Text copyable={{ text: fileContent }}>复制 Markdown</Typography.Text>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: token.colorBgContainer }}>
                  {loadingContent ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}>
                      <Spin tip="加载渲染中..." />
                    </Flex>
                  ) : contentError ? (
                    <Empty description={contentError} />
                  ) : (
                    <div
                      style={{ fontSize: 14, lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                    />
                  )}
                </div>
              </div>
            ) : previewType === 'code' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '6px 12px',
                    background: token.colorFillSecondary,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Monaco 代码高亮预览 ({codeLanguage})</span>
                  {fileContent && (
                    <Typography.Text copyable={{ text: fileContent }}>复制代码</Typography.Text>
                  )}
                </div>
                <div style={{ flex: 1, minHeight: 300 }}>
                  {loadingContent ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}>
                      <Spin tip="加载代码中..." />
                    </Flex>
                  ) : contentError ? (
                    <Empty description={contentError} />
                  ) : (
                    <Editor
                      height="100%"
                      language={codeLanguage}
                      theme="vs-dark"
                      value={fileContent}
                      loading={
                        <pre
                          style={{
                            margin: 0,
                            padding: 16,
                            background: '#1e1e1e',
                            color: '#d4d4d4',
                            height: '100%',
                            overflow: 'auto',
                            fontFamily: 'Consolas, "Fira Code", monospace',
                            fontSize: 13,
                            lineHeight: 1.5,
                            borderRadius: 4,
                          }}
                        >
                          {fileContent}
                        </pre>
                      }
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                      }}
                    />
                  )}
                </div>
              </div>
            ) : previewType === 'image' ? (
              <Flex justify="center" align="center" style={{ flex: 1, padding: 16, overflow: 'hidden' }}>
                <Image
                  src={fileUrl}
                  alt={item.name}
                  style={{ maxHeight: 'calc(100vh - 280px)', maxWidth: '100%', objectFit: 'contain' }}
                />
              </Flex>
            ) : previewType === 'video' ? (
              <Flex justify="center" align="center" style={{ flex: 1, padding: 16 }}>
                <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
                  <source src={fileUrl} />
                </video>
              </Flex>
            ) : previewType === 'audio' ? (
              <Flex justify="center" align="center" style={{ flex: 1, padding: 24 }}>
                <audio controls style={{ width: '100%' }}>
                  <source src={fileUrl} />
                </audio>
              </Flex>
            ) : (
              <Flex vertical justify="center" align="center" style={{ flex: 1, padding: 24 }}>
                <Empty description={`此格式 (${ext || fileType || '未知'}) 暂无内置即时渲染器`} />
                <Button type="primary" icon={<DownloadOutlined />} href={fileUrl} target="_blank" style={{ marginTop: 12 }}>
                  下载并在本地查看
                </Button>
              </Flex>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="名称">{item.name}</Descriptions.Item>
              <Descriptions.Item label="分类">{categoryTitle || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {item.createdAt ? formatDateTime(item.createdAt) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {item.updatedAt ? formatDateTime(item.updatedAt) : '-'}
              </Descriptions.Item>
              {filePath && (
                <Descriptions.Item label="文件路径">
                  <Typography.Text ellipsis copyable style={{ maxWidth: 160 }}>
                    {filePath}
                  </Typography.Text>
                  {onOpenLocation && (
                    <Button
                      type="link"
                      size="small"
                      icon={<FolderOpenOutlined />}
                      onClick={() => onOpenLocation(filePath)}
                    >
                      定位
                    </Button>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Dynamic Attributes & Plugins */}
            <Typography.Title level={5} style={{ marginTop: 16, marginBottom: 8, fontSize: 13 }}>
              动态属性与插件
            </Typography.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Star Rating Plugin */}
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorFillQuaternary,
                }}
              >
                <div style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 4 }}>
                  星级评分 (Rating 插件)
                </div>
                <StarRating
                  itemId={item.id}
                  value={Number(item.keyValues.rating || 0)}
                  onChange={(rating) => onPluginUpdate?.('rating', rating)}
                />
              </div>

              {/* Other Key Values */}
              {Object.entries(item.keyValues)
                .filter(([k]) => !['name', 'category_name', 'rating', 'file_path', 'file_type'].includes(k))
                .map(([key, val]) => {
                  const keyDef = keyMap.get(key);
                  const displayTitle = keyDef?.title || key;
                  const displayVal =
                    Array.isArray(val) ? (
                      <Space size={4} wrap>
                        {val.map((tag, i) => (
                          <Tag key={i} color="blue">{String(tag)}</Tag>
                        ))}
                      </Space>
                    ) : typeof val === 'object' && val !== null ? (
                      <pre style={{ margin: 0, fontSize: 11, maxHeight: 100, overflow: 'auto' }}>
                        {JSON.stringify(val, null, 2)}
                      </pre>
                    ) : (
                      String(val ?? '-')
                    );

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorFillQuaternary,
                      }}
                    >
                      <div style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 2 }}>
                        {displayTitle}
                      </div>
                      <div style={{ fontSize: 13 }}>{displayVal}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LivePreviewPanel;
