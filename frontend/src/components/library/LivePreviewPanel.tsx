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
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import FileIcon from '../common/FileIcon';
import type { CategoryDefinition, KeyDefinition, KnowledgeItem } from '../../types';
import { detectPreviewType, getFileExtension, getFileUrl } from '../../utils/fileUrl';
import { formatDateTime } from '../../utils';
import StarRating from '../../plugins/components/StarRating';
import { useI18n } from '../../i18n';

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
  const { t, locale } = useI18n();
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
  const rawFileContent = loadedData?.url === fileUrl ? loadedData.content : '';
  const fileContent = useMemo(() => {
    if (!rawFileContent || locale !== 'en') return rawFileContent;
    if (fileUrl.endsWith('/architecture_design.md')) {
      return [
        '# KnowFlow Architecture Design Specification (v1.1)',
        '',
        '## 1. Core Positioning',
        '**KnowFlow** is a modern, high-performance, lightweight knowledge management system.',
        'Focused on **dynamic attribute search, hierarchical category trees, and instant multi-modal preview**.',
        '',
        '## 2. Key Architecture Features',
        '- **Storage Engine**: Native MongoDB BSON model supporting dynamic KV numeric, boolean, and array attributes.',
        '- **Compound Indexes**: `(category_name, created_at)` compound index and `name` + `content` full-text index.',
        '- **Offline Semantic Search**: Embedded `fastembed` (`BAAI/bge-small-zh-v1.5`) engine for local CPU inference.',
        '- **Three-Column Workspace**:',
        '  1. **Left**: Collapsible category tree with drag-and-drop reorganization and item filing.',
        '  2. **Center**: Table and card grid views with quick facet filter chips.',
        '  3. **Right**: Responsive multi-modal preview panel (PDF.js / marked Markdown / Monaco editor).',
      ].join('\n');
    }
    if (fileUrl.endsWith('/fastembed_service.py')) {
      return rawFileContent.replace(
        '# KnowFlow 离线语义向量推理模块',
        '# KnowFlow Offline Semantic Vector Inference Module',
      );
    }
    if (fileUrl.endsWith('/paged_attention.md')) {
      return [
        '# PagedAttention KV-Cache Architecture',
        '',
        'Virtual memory paging for LLM **KV-Cache** management, eliminating external fragmentation and enabling zero-copy prefix sharing across concurrent sequences.',
        '',
        '## 1. KV-Cache Memory Efficiency',
        '',
        '| Mechanism | KV Waste | Max Batch | Tok/s |',
        '| :--- | :---: | :---: | :---: |',
        '| Contiguous KV | 62.4% | 32 | 1,420 |',
        '| PagedAttention v1 | 3.8% | 128 | 4,890 |',
        '| **Paged + FP8** | **1.9%** | **256** | **8,640** |',
        '| **MLA + Paged KV** | **1.4%** | **320** | **10,120** |',
        '',
        '## 2. Block Table Dispatch',
        '',
        '```python',
        'def allocate_kv_blocks(seq_len: int, block_size: int = 16):',
        '    num_blocks = (seq_len + block_size - 1) // block_size',
        '    return [free_pool.pop() for _ in range(num_blocks)]',
        '```',
      ].join('\n');
    }
    if (fileUrl.endsWith('/deepseek_mla.md')) {
      return [
        '# DeepSeek MLA & GQA Attention',
        '',
        'Low-rank joint compression of Keys and Values (**Multi-Head Latent Attention**) compared against Grouped-Query Attention on 671B MoE inference nodes.',
        '',
        '## 1. Per-Token KV Footprint',
        '',
        '| Architecture | Heads | KV / Tok | Limit | Tok/s |',
        '| :--- | :---: | :---: | :---: | :---: |',
        '| Standard MHA | 128 | 512 KB | 16K | 1,180 |',
        '| GQA-8 (Llama-3) | 8 | 64 KB | 64K | 5,420 |',
        '| **DeepSeek MLA** | **512d** | **14.3 KB** | **128K** | **9,850** |',
        '| **MLA + Absorb** | **512d** | **11.2 KB** | **256K** | **11,940** |',
        '',
        '## 2. Matrix Absorption Projection',
        '',
        '```python',
        'def mla_project(h_t, W_DKV, W_UK, W_UV):',
        '    c_kv = rms_norm(h_t @ W_DKV)  # Compressed 512-d latent vector',
        '    return c_kv @ W_UK, c_kv @ W_UV',
        '```',
      ].join('\n');
    }
    if (fileUrl.endsWith('/flash_attention3.md')) {
      return [
        '# FlashAttention-3 FP8 Kernel Spec',
        '',
        'Hopper H100 asynchronous **WGMMA** and **TMA** circular buffer pipelining, overlapping warp-group GEMM with softmax rescaling.',
        '',
        '## 1. H100 SXM5 Kernel Utilization',
        '',
        '| Seq Length | BF16 FA-2 | BF16 FA-3 | FP8 FA-3 |',
        '| :--- | :---: | :---: | :---: |',
        '| **4,096** | 412 TFLOPS | 645 TFLOPS | **1,120 TFLOPS** |',
        '| **16,384** | 438 TFLOPS | 682 TFLOPS | **1,185 TFLOPS** |',
        '| **65,536** | 445 TFLOPS | 704 TFLOPS | **1,240 TFLOPS** |',
        '',
        '## 2. Producer-Consumer Warp Schedule',
        '',
        '```python',
        'for step in range(num_kv_tiles):',
        '    kv_stage = k_ring.acquire_ready_tile(step)',
        '    scores = wgmma_fp8_gemm(q_tile, kv_stage.k)',
        '    probs = online_softmax_rescale(scores, running_max)',
        '    out = wgmma_fp8_accum(probs, kv_stage.v, out)',
        '```',
      ].join('\n');
    }
    return rawFileContent;
  }, [fileUrl, locale, rawFileContent]);
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
          if (!res.ok) throw new Error(`${t('加载失败', 'Failed to load')}: ${res.statusText}`);
          return res.text();
        })
        .then((text) => {
          if (!cancelled) {
            setLoadedData({ url: fileUrl, content: text });
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setContentError(String(err.message || t('文件内容加载失败', 'Failed to load file content')));
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [item, fileUrl, isTextPreview, loadedData?.url, t]);

  // Render markdown to HTML safely
  const renderedMarkdown = useMemo(() => {
    if (!fileContent) return '';
    try {
      const rawHtml = marked.parse(fileContent) as string;
      return DOMPurify.sanitize(rawHtml);
    } catch {
      return DOMPurify.sanitize(fileContent);
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
          description={t('选择左侧知识项以快速预览与检查属性', 'Select an item to preview content and inspect attributes')}
        />
      </Card>
    );
  }

  const categoryName = (item.keyValues.category_name as string) || '';
  const rawCategoryTitle = categoryMap.get(categoryName) || categoryName;
  const categoryTitle = rawCategoryTitle ? t(rawCategoryTitle) : '';

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
      styles={{ body: { padding: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
    >
      {/* Header */}
      <Flex justify="space-between" align="start" gap={4} style={{ marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Flex align="center" gap={6} style={{ marginBottom: 4 }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <FileIcon fileType={fileType} />
            </span>
            <div
              title={item.name ? t(item.name) : ''}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name ? t(item.name) : t('未命名', 'Untitled')}
            </div>
          </Flex>
          <Space size={6} wrap>
            {categoryTitle && <Tag color="blue" style={{ margin: 0 }}>{categoryTitle}</Tag>}
            {ext && <Tag color="cyan" style={{ margin: 0 }}>.{ext.toUpperCase()}</Tag>}
            {item.keyValues.rating !== undefined && (
              <Rate disabled allowHalf value={Number(item.keyValues.rating)} style={{ fontSize: 12 }} />
            )}
          </Space>
        </div>
        <Space size={2} style={{ flexShrink: 0 }}>
          {onEdit && (
            <Tooltip title={t('编辑知识项', 'Edit Item')}>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(item)} />
            </Tooltip>
          )}
          <Tooltip title={t('关闭预览', 'Close Preview')}>
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
          { label: t('实时极速预览', 'Live Preview'), value: 'preview', icon: <EyeOutlined /> },
          { label: t('属性与插件', 'Attributes'), value: 'meta', icon: <InfoCircleOutlined /> },
        ]}
        style={{ marginBottom: 10 }}
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
                <Empty description={t('该知识记录未挂载文件附件', 'No file attachment linked to this item')} />
              </Flex>
            ) : previewType === 'pdf' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '6px 10px',
                    background: token.colorFillSecondary,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'nowrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                    <FilePdfOutlined style={{ color: '#ff4d4f', flexShrink: 0 }} /> {t('PDF.js 原生极速预览', 'PDF Native Preview')}
                  </span>
                  <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {t('新标签页打开', 'Open in New Tab')}
                  </a>
                </div>
                <iframe
                  src={`${fileUrl}#toolbar=1`}
                  title={item.name ? t(item.name) : ''}
                  style={{ width: '100%', flex: 1, border: 'none' }}
                />
              </div>
            ) : previewType === 'markdown' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '6px 10px',
                    background: token.colorFillSecondary,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'nowrap',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                    {t('Markdown 语法排版渲染', 'Markdown Rendered')}
                  </span>
                  {fileContent && (
                    <Typography.Text
                      copyable={{ text: fileContent }}
                      style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {t('复制 Markdown', 'Copy MD')}
                    </Typography.Text>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: token.colorBgContainer }}>
                  {loadingContent ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}>
                      <Spin tip={t('加载渲染中...', 'Rendering...')} />
                    </Flex>
                  ) : contentError ? (
                    <Empty description={contentError} />
                  ) : (
                    <div
                      className="knowflow-markdown-body"
                      style={{ fontSize: 13, lineHeight: 1.55 }}
                      dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                    />
                  )}
                </div>
              </div>
            ) : previewType === 'code' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '6px 10px',
                    background: token.colorFillSecondary,
                    fontSize: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'nowrap',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                    {t(`Monaco 代码高亮预览 (${codeLanguage})`, `Monaco Code Preview (${codeLanguage})`)}
                  </span>
                  {fileContent && (
                    <Typography.Text
                      copyable={{ text: fileContent }}
                      style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {t('复制代码', 'Copy Code')}
                    </Typography.Text>
                  )}
                </div>
                <div style={{ flex: 1, minHeight: 300 }}>
                  {loadingContent ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}>
                      <Spin tip={t('加载代码中...', 'Loading code...')} />
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
                  alt={item.name ? t(item.name) : ''}
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
                <Empty
                  description={t(
                    `此格式 (${ext || fileType || '未知'}) 暂无内置即时渲染器`,
                    `No built-in previewer for (${ext || fileType || 'unknown'})`,
                  )}
                />
                <Button type="primary" icon={<DownloadOutlined />} href={fileUrl} target="_blank" style={{ marginTop: 12 }}>
                  {t('下载并在本地查看', 'Download & Open Locally')}
                </Button>
              </Flex>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label={t('名称', 'Name')}>{item.name ? t(item.name) : '-'}</Descriptions.Item>
              <Descriptions.Item label={t('分类', 'Category')}>{categoryTitle || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('创建时间', 'Created')}>
                {item.createdAt ? formatDateTime(item.createdAt) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('更新时间', 'Updated')}>
                {item.updatedAt ? formatDateTime(item.updatedAt) : '-'}
              </Descriptions.Item>
              {filePath && (
                <Descriptions.Item label={t('关联附件', 'Attachment')}>
                  <Typography.Text ellipsis copyable={{ text: filePath }} style={{ maxWidth: 160 }}>
                    {filePath.split('/').pop() || filePath}
                  </Typography.Text>
                  {onOpenLocation && (
                    <Button
                      type="link"
                      size="small"
                      icon={<FolderOpenOutlined />}
                      onClick={() => onOpenLocation(filePath)}
                    >
                      {t('定位', 'Locate')}
                    </Button>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Dynamic Attributes & Plugins */}
            <Typography.Title level={5} style={{ marginTop: 16, marginBottom: 8, fontSize: 13 }}>
              {t('动态属性与插件', 'Dynamic Attributes & Plugins')}
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
                  {t('星级评分 (Rating 插件)', 'Star Rating (Rating Plugin)')}
                </div>
                <StarRating
                  itemId={item.id}
                  value={Number(item.keyValues.rating || 0)}
                  onChange={(rating) => onPluginUpdate?.('rating', rating)}
                />
              </div>

              {/* Other Key Values */}
              {Object.entries(item.keyValues)
                .filter(([k]) => !['name', 'category_name', 'rating', 'file_path', 'file_type', 'created_at', 'updated_at'].includes(k))
                .map(([key, val]) => {
                  const keyDef = keyMap.get(key);
                  const displayTitle = keyDef?.title ? t(keyDef.title) : key;
                  const displayVal =
                    Array.isArray(val) ? (
                      <Space size={4} wrap>
                        {val.map((tag, i) => (
                          <Tag key={i} color="blue">{t(String(tag))}</Tag>
                        ))}
                      </Space>
                    ) : typeof val === 'object' && val !== null ? (
                      <pre style={{ margin: 0, fontSize: 11, maxHeight: 100, overflow: 'auto' }}>
                        {JSON.stringify(val, null, 2)}
                      </pre>
                    ) : (
                      typeof val === 'string' && val ? t(val) : String(val ?? '-')
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
