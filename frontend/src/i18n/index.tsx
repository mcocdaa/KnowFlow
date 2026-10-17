/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Locale = 'zh' | 'en';

export const LANG_STORAGE_KEY = 'knowflow_lang';

const DICTIONARY: Record<string, { zh: string; en: string }> = {
  // Navigation
  '知识库': { zh: '知识库', en: 'Library' },
  '分类管理': { zh: '分类管理', en: 'Categories' },
  'Key 管理': { zh: 'Key 管理', en: 'Schema Keys' },
  '插件': { zh: '插件', en: 'Plugins' },
  'AI 助手': { zh: 'AI 助手', en: 'AI Assistant' },

  // Built-in Categories & Keys (DB seed values)
  '内置 Key': { zh: '内置 Key', en: 'Built-in Keys' },
  '基础属性': { zh: '基础属性', en: 'Basic Info' },
  '时间属性': { zh: '时间属性', en: 'Timestamps' },
  '自定义 Key': { zh: '自定义 Key', en: 'Custom Keys' },
  '技术架构': { zh: '技术架构', en: 'Tech Architecture' },
  '后端核心': { zh: '后端核心', en: 'Backend Core' },
  '算法模型': { zh: '算法模型', en: 'Algorithm & Models' },
  '产品规划': { zh: '产品规划', en: 'Product Roadmap' },
  '推理引擎架构': { zh: '推理引擎架构', en: 'Inference Engine' },
  '核心算子与显存': { zh: '核心算子与显存', en: 'Kernels & Memory' },
  '注意力与MoE架构': { zh: '注意力与MoE架构', en: 'Attention & MoE' },
  '分布式向量存储': { zh: '分布式向量存储', en: 'Vector Storage' },
  '大模型训练系统': { zh: '大模型训练系统', en: 'LLM Training' },
  '企业安全与治理': { zh: '企业安全与治理', en: 'Security & Governance' },
  '名称': { zh: '名称', en: 'Name' },
  '文件路径': { zh: '文件路径', en: 'File Path' },
  '文件类型': { zh: '文件类型', en: 'File Type' },
  '文档类型': { zh: '文档类型', en: 'Document Type' },
  '创建时间': { zh: '创建时间', en: 'Created At' },
  '更新时间': { zh: '更新时间', en: 'Updated At' },
  '标签': { zh: '标签', en: 'Tags' },
  '知识标签': { zh: '知识标签', en: 'Knowledge Tags' },
  '星级': { zh: '星级', en: 'Rating' },
  '星级评分': { zh: '星级评分', en: 'Star Rating' },
  '评分': { zh: '评分', en: 'Rating' },
  'P99 延迟指标': { zh: 'P99 延迟指标', en: 'P99 Latency SLA' },
  '项目ID': { zh: '项目ID', en: 'Project ID' },
  '归档类型': { zh: '归档类型', en: 'Archive Type' },
  '折叠层级': { zh: '折叠层级', en: 'Fold Level' },
  '生成者': { zh: '生成者', en: 'Agent Source' },
  '摘要': { zh: '摘要', en: 'Summary' },
  '流程ID': { zh: '流程ID', en: 'Flow ID' },

  // Built-in & plugin Key descriptions
  '项目名称': { zh: '项目名称', en: 'Item name' },
  '文件路径, url 或者 文件系统路径': {
    zh: '文件路径, url 或者 文件系统路径',
    en: 'File path, URL, or filesystem path',
  },
  'AI 自动生成的标签列表': { zh: 'AI 自动生成的标签列表', en: 'AI-generated tag list' },
  '知识项的星级评分(1-5)': { zh: '知识项的星级评分(1-5)', en: '1–5 star rating for knowledge items' },
  '生产级毫秒指标（ms）': { zh: '生产级毫秒指标（ms）', en: 'Production latency SLA in milliseconds (ms)' },
  '项目唯一ID（必填）按项目隔离归档，核心字段': {
    zh: '项目唯一ID（必填）按项目隔离归档，核心字段',
    en: 'Unique project ID for isolated project archiving',
  },
  '归档类型：requirement / code / test / document / flow_record 分类归档，AI快速筛选': {
    zh: '归档类型：requirement / code / test / document / flow_record 分类归档，AI快速筛选',
    en: 'Archive type: requirement / code / test / document / flow_record',
  },
  '折叠层级：1(顶层摘要)/2(中层)/3(完整内容) 实现多层折叠，省Token': {
    zh: '折叠层级：1(顶层摘要)/2(中层)/3(完整内容) 实现多层折叠，省Token',
    en: 'Fold level: 1 (summary) / 2 (mid) / 3 (full content)',
  },
  '生成者：编码Agent / 调试Agent/AutoFlow溯源，不混乱': {
    zh: '生成者：编码Agent / 调试Agent/AutoFlow溯源，不混乱',
    en: 'Source agent: Coding Agent / Debug Agent / AutoFlow provenance',
  },
  '一句话摘要（顶层折叠内容）AI只读摘要，不读全文，极致省Token': {
    zh: '一句话摘要（顶层折叠内容）AI只读摘要，不读全文，极致省Token',
    en: 'One-line summary for top-level folding and token efficiency',
  },
  'AutoFlow流程ID（可选）关联自动化流程': {
    zh: 'AutoFlow流程ID（可选）关联自动化流程',
    en: 'AutoFlow workflow ID (optional)',
  },

  // Plugin descriptions
  'KnowFlow OpenClaw桥接插件，提供与OpenClaw系统的集成能力': {
    zh: 'KnowFlow OpenClaw桥接插件，提供与OpenClaw系统的集成能力',
    en: 'OpenClaw bridge plugin providing integration with the OpenClaw workflow system.',
  },
  '为知识项添加星级评分功能': {
    zh: '为知识项添加星级评分功能',
    en: 'Adds interactive 1–5 star rating to knowledge items.',
  },
  '为知识记录提供五级星标评价与权重排序支持': {
    zh: '为知识记录提供五级星标评价与权重排序支持',
    en: 'Provides 5-star rating and weighted sorting for knowledge items.',
  },
  '多智能体知识库语义检索与上下文同步桥接插件': {
    zh: '多智能体知识库语义检索与上下文同步桥接插件',
    en: 'Multi-agent semantic search and context synchronization bridge plugin.',
  },

  // AI Auto-Tagging tags
  'KV缓存分页': { zh: 'KV缓存分页', en: 'KV-Cache Paging' },
  '显存零碎片': { zh: '显存零碎片', en: 'Zero Fragmentation' },
  'vLLM推理加速': { zh: 'vLLM推理加速', en: 'vLLM Acceleration' },
  '块表映射': { zh: '块表映射', en: 'Block Table Mapping' },
  '多头潜在注意力': { zh: '多头潜在注意力', en: 'Multi-Head Latent Attention' },
  '低秩矩阵吸收': { zh: '低秩矩阵吸收', en: 'Low-Rank Matrix Absorption' },
  'MoE推理优化': { zh: 'MoE推理优化', en: 'MoE Inference Opt' },
  'FP8算子流水线': { zh: 'FP8算子流水线', en: 'FP8 Kernel Pipeline' },
  'Hopper异步TMA': { zh: 'Hopper异步TMA', en: 'Hopper Async TMA' },
  '在线Softmax': { zh: '在线Softmax', en: 'Online Softmax' },
  'BSON向量混合索引': { zh: 'BSON向量混合索引', en: 'Hybrid BSON-Vector Index' },
  'HNSW位图过滤': { zh: 'HNSW位图过滤', en: 'HNSW Bitset Filter' },
  '毫秒级召回': { zh: '毫秒级召回', en: 'Sub-5ms Recall' },
  '分布式BSON分片': { zh: '分布式BSON分片', en: 'Distributed BSON Sharding' },
  '复合倒排索引': { zh: '复合倒排索引', en: 'Compound Inverted Index' },
  '高并发存储': { zh: '高并发存储', en: 'High-Concurrency Storage' },
  '零信任权限治理': { zh: '零信任权限治理', en: 'Zero-Trust Governance' },
  '细粒度访问审计': { zh: '细粒度访问审计', en: 'Fine-Grained Access Audit' },
  '安全合规': { zh: '安全合规', en: 'Security Compliance' },
  '核心架构': { zh: '核心架构', en: 'Core Architecture' },
  'BSON优化': { zh: 'BSON优化', en: 'BSON Optimization' },
  '向量模型': { zh: '向量模型', en: 'Vector Model' },
  'CPU离线': { zh: 'CPU离线', en: 'Offline CPU' },
  '配置管理': { zh: '配置管理', en: 'Config Management' },
  '三栏布局': { zh: '三栏布局', en: '3-Column Layout' },
  '产品白皮书': { zh: '产品白皮书', en: 'Product Whitepaper' },
  '规范指南': { zh: '规范指南', en: 'Spec Guide' },
  'P0特性': { zh: 'P0特性', en: 'P0 Features' },
  'BSON重构': { zh: 'BSON重构', en: 'BSON Refactoring' },
  '范围查询': { zh: '范围查询', en: 'Range Query' },
  '倒排索引': { zh: '倒排索引', en: 'Inverted Index' },
  '架构': { zh: '架构', en: 'Architecture' },
  '架构设计': { zh: '架构设计', en: 'Architecture Design' },
  '设计': { zh: '设计', en: 'Design' },
  '开发': { zh: '开发', en: 'Development' },
  '测试': { zh: '测试', en: 'Testing' },
  '部署': { zh: '部署', en: 'Deployment' },
  '运维': { zh: '运维', en: 'Operations' },
  '前端': { zh: '前端', en: 'Frontend' },
  '后端': { zh: '后端', en: 'Backend' },
  '数据库': { zh: '数据库', en: 'Database' },
  '人工智能': { zh: '人工智能', en: 'AI' },
  '语义检索': { zh: '语义检索', en: 'Semantic Search' },
  '向量检索': { zh: '向量检索', en: 'Vector Search' },
  '性能优化': { zh: '性能优化', en: 'Performance Optimization' },
  '优化': { zh: '优化', en: 'Optimization' },
  '安全': { zh: '安全', en: 'Security' },
  '文档': { zh: '文档', en: 'Documentation' },
  '规范': { zh: '规范', en: 'Specification' },
  '规约': { zh: '规约', en: 'Specification' },
  '指南': { zh: '指南', en: 'Guide' },
  '白皮书': { zh: '白皮书', en: 'Whitepaper' },
  '配置': { zh: '配置', en: 'Configuration' },
  '报告': { zh: '报告', en: 'Report' },
  '桌面端': { zh: '桌面端', en: 'Desktop' },
  '检索': { zh: '检索', en: 'Search' },
  '工程化': { zh: '工程化', en: 'Engineering' },

  // OpenClaw category & plugin UI labels
  'OpenClaw集成': { zh: 'OpenClaw集成', en: 'OpenClaw Integration' },
  'OpenClaw 归档管理': { zh: 'OpenClaw 归档管理', en: 'OpenClaw Archive Management' },
  'OpenClaw 桥接属性': { zh: 'OpenClaw 桥接属性', en: 'OpenClaw Bridge Attributes' },
  '按项目ID筛选': { zh: '按项目ID筛选', en: 'Filter by Project ID' },
  '保存配置': { zh: '保存配置', en: 'Save Configuration' },
  '重置筛选': { zh: '重置筛选', en: 'Reset Filters' },
  '保存OpenClaw属性': { zh: '保存OpenClaw属性', en: 'Save OpenClaw Attributes' },
  '保存中...': { zh: '保存中...', en: 'Saving...' },
  '项目ID不能为空': { zh: '项目ID不能为空', en: 'Project ID is required' },
  'OpenClaw属性保存成功': { zh: 'OpenClaw属性保存成功', en: 'OpenClaw attributes saved successfully' },
  '保存失败，请检查网络连接': { zh: '保存失败，请检查网络连接', en: 'Failed to save, please check network connection' },
  '请输入项目唯一ID（必填）': { zh: '请输入项目唯一ID（必填）', en: 'Enter unique project ID (required)' },
  '需求文档 (requirement)': { zh: '需求文档 (requirement)', en: 'Requirement (requirement)' },
  '代码实现 (code)': { zh: '代码实现 (code)', en: 'Code Implementation (code)' },
  '测试报告 (test)': { zh: '测试报告 (test)', en: 'Test Report (test)' },
  '通用文档 (document)': { zh: '通用文档 (document)', en: 'General Document (document)' },
  '流程记录 (flow_record)': { zh: '流程记录 (flow_record)', en: 'Flow Record (flow_record)' },
  '1 - 顶层摘要（仅AI只读摘要）': { zh: '1 - 顶层摘要（仅AI只读摘要）', en: '1 - Top Summary (AI summary only)' },
  '2 - 中层详情（模块级内容）': { zh: '2 - 中层详情（模块级内容）', en: '2 - Mid-level Details (Module level)' },
  '3 - 完整内容（全文展示）': { zh: '3 - 完整内容（全文展示）', en: '3 - Full Content (Full text)' },
  '例如：编码Agent / 调试Agent / AutoFlow': { zh: '例如：编码Agent / 调试Agent / AutoFlow', en: 'e.g., Coding Agent / Debug Agent / AutoFlow' },
  '流程ID（可选）': { zh: '流程ID（可选）', en: 'Flow ID (Optional)' },
  '关联的AutoFlow流程ID': { zh: '关联的AutoFlow流程ID', en: 'Associated AutoFlow ID' },
  '顶层折叠展示的一句话摘要，省Token核心字段': { zh: '顶层折叠展示的一句话摘要，省Token核心字段', en: 'Top-level summary for token-efficient indexing' },

  // Seeded knowledge item titles (from seed_data.py)
  'KnowFlow 统一架构设计说明书.md': {
    zh: 'KnowFlow 统一架构设计说明书.md',
    en: 'KnowFlow Unified Architecture Design Spec.md',
  },
  'fastembed 离线语义推理实现.py': {
    zh: 'fastembed 离线语义推理实现.py',
    en: 'fastembed Offline Semantic Inference Implementation.py',
  },
  'KnowFlow 生产配置规约.json': {
    zh: 'KnowFlow 生产配置规约.json',
    en: 'KnowFlow Production Configuration Specification.json',
  },
  'KnowFlow 产品使用指南与规划白皮书.pdf': {
    zh: 'KnowFlow 产品使用指南与规划白皮书.pdf',
    en: 'KnowFlow Product Guide & Roadmap Whitepaper.pdf',
  },
  '动态属性 KV 查询优化报告': {
    zh: '动态属性 KV 查询优化报告',
    en: 'Dynamic Attribute KV Query Optimization Report',
  },

  // Backend CRUD & AI / plugin error messages
  'cannot delete category with existing children': {
    zh: '无法删除包含子分类的分类',
    en: 'Cannot delete a category that has subcategories',
  },
  'category cannot be its own parent': {
    zh: '分类不能将自身设为父分类',
    en: 'A category cannot be its own parent',
  },
  'builtin categories cannot be modified': {
    zh: '内置分类不可修改',
    en: 'Built-in categories cannot be modified',
  },
  'builtin categories cannot be deleted': {
    zh: '内置分类不可删除',
    en: 'Built-in categories cannot be deleted',
  },
  'builtin keys cannot be modified': {
    zh: '内置属性 Key 不可修改',
    en: 'Built-in keys cannot be modified',
  },
  'builtin keys cannot be deleted': {
    zh: '内置属性 Key 不可删除',
    en: 'Built-in keys cannot be deleted',
  },
  'no valid fields to update': {
    zh: '没有有效的更新字段',
    en: 'No valid fields to update',
  },
  '没有有效的更新字段': {
    zh: '没有有效的更新字段',
    en: 'No valid fields to update',
  },
  'invalid value_type, must be one of: string, number, boolean, array, object': {
    zh: '无效的值类型，必须为 string、number、boolean、array 或 object',
    en: 'Invalid value_type, must be one of: string, number, boolean, array, object',
  },
  'Invalid JSON in data field': {
    zh: '数据字段 JSON 格式无效',
    en: 'Invalid JSON in data field',
  },
  'AI 功能未启用，请配置 DOUBAO_API_KEY': {
    zh: 'AI 功能未启用，请配置 DOUBAO_API_KEY',
    en: 'AI feature is disabled. Please configure DOUBAO_API_KEY.',
  },
  'AI 服务调用超时': {
    zh: 'AI 服务调用超时',
    en: 'AI service request timed out',
  },
  'AI 服务调用失败': {
    zh: 'AI 服务调用失败',
    en: 'AI service request failed',
  },
  'AI 服务响应格式错误': {
    zh: 'AI 服务响应格式错误',
    en: 'Invalid AI service response format',
  },
  'query 不能为空': {
    zh: '搜索内容不能为空',
    en: 'Query cannot be empty',
  },
  '文件大小超过上限 10MB': {
    zh: '文件大小超过上限 10MB',
    en: 'File size exceeds the 10MB limit',
  },
  '星级必须在1-5之间': {
    zh: '星级必须在1-5之间',
    en: 'Rating must be between 1 and 5',
  },
  'openclaw_project_id不能为空': {
    zh: 'openclaw_project_id不能为空',
    en: 'openclaw_project_id cannot be empty',
  },
  '归档类型必须是requirement / code / test / document / flow_record之一': {
    zh: '归档类型必须是requirement / code / test / document / flow_record之一',
    en: 'Archive type must be one of: requirement / code / test / document / flow_record',
  },
  '折叠层级必须是1-3之间的整数': {
    zh: '折叠层级必须是1-3之间的整数',
    en: 'Fold level must be an integer between 1 and 3',
  },
  'category name must be non-empty string': {
    zh: '分类标识不能为空',
    en: 'Category identifier cannot be empty',
  },
  'key name must be non-empty string': {
    zh: 'Key 标识不能为空',
    en: 'Key identifier cannot be empty',
  },
};

function translateBackendErrorPattern(key: string, locale: Locale): string | null {
  let match = key.match(/^Missing required keys:\s*(.+)$/i);
  if (match) {
    return locale === 'zh' ? `缺少必填字段：${match[1]}` : `Missing required keys: ${match[1]}`;
  }

  match = key.match(/^(category|key|parent category) with name (.+) already exists$/i);
  if (match) {
    const entity = match[1].toLowerCase() === 'key' ? 'Key' : '分类';
    return locale === 'zh' ? `${entity} "${match[2]}" 已存在` : `${match[1]} with name "${match[2]}" already exists`;
  }

  match = key.match(/^(category|key|parent category) with name (.+) does not exist$/i);
  if (match) {
    const kind = match[1].toLowerCase();
    const entity = kind === 'key' ? 'Key' : kind === 'parent category' ? '父分类' : '分类';
    return locale === 'zh' ? `${entity} "${match[2]}" 不存在` : `${match[1]} with name "${match[2]}" does not exist`;
  }

  match = key.match(/^(item|category) with id (.+) does not exist$/i);
  if (match) {
    const entity = match[1].toLowerCase() === 'item' ? '记录' : '分类';
    return locale === 'zh' ? `${entity} (ID: ${match[2]}) 不存在` : `${match[1]} with id "${match[2]}" does not exist`;
  }

  match = key.match(/^would create a cycle:\s*(.+)$/i);
  if (match) {
    return locale === 'zh' ? `会导致循环依赖：${match[1]}` : `Would create a cycle: ${match[1]}`;
  }

  match = key.match(/^unknown key:\s*(.+)$/i);
  if (match) {
    return locale === 'zh' ? `未知的属性 Key：${match[1]}` : `Unknown key: ${match[1]}`;
  }

  match = key.match(/^invalid sort option:\s*(.+)$/i);
  if (match) {
    return locale === 'zh' ? `无效的排序方式：${match[1]}` : `Invalid sort option: ${match[1]}`;
  }

  match = key.match(/^field\(s\) not allowed in update:\s*(.+)$/i);
  if (match) {
    return locale === 'zh' ? `不允许更新的字段：${match[1]}` : `Field(s) not allowed in update: ${match[1]}`;
  }

  match = key.match(/^(category|key definition) must contain (.+)$/i);
  if (match) {
    const entity = match[1].toLowerCase() === 'category' ? '分类' : 'Key 定义';
    return locale === 'zh' ? `${entity}必须包含字段 ${match[2]}` : `${match[1]} must contain ${match[2]}`;
  }

  match = key.match(/^文件大小超过上限\s*(.+)$/);
  if (match) {
    return locale === 'zh' ? key : `File size exceeds the ${match[1]} limit`;
  }

  match = key.match(/^query 长度不能超过 (\d+) 字符$/);
  if (match) {
    return locale === 'zh' ? key : `Query length cannot exceed ${match[1]} characters`;
  }

  return null;
}

export function getInitialLocale(): Locale {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'zh') {
        return saved;
      }
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return 'zh';
}

export function translateText(locale: Locale, keyOrZh: string, enFallback?: string): string {
  if (enFallback !== undefined) {
    return locale === 'zh' ? keyOrZh : enFallback;
  }
  const entry = DICTIONARY[keyOrZh];
  if (entry) {
    return entry[locale];
  }
  const patternTranslated = translateBackendErrorPattern(keyOrZh, locale);
  if (patternTranslated !== null) {
    return patternTranslated;
  }
  return keyOrZh;
}

export function tr(keyOrZh: string, enFallback?: string): string {
  return translateText(getInitialLocale(), keyOrZh, enFallback);
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: (keyOrZh: string, enFallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LANG_STORAGE_KEY, next);
      }
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === 'zh' ? 'en' : 'zh';
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(LANG_STORAGE_KEY, next);
        }
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (keyOrZh: string, enFallback?: string) => translateText(locale, keyOrZh, enFallback),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

const fallbackSetLocale = (next: Locale) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    }
  } catch {
    // Ignore
  }
};

const fallbackToggleLocale = () => {
  const current = getInitialLocale();
  const next: Locale = current === 'zh' ? 'en' : 'zh';
  fallbackSetLocale(next);
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx) {
    return ctx;
  }
  // Fallback for isolated component unit tests rendered outside <LanguageProvider>
  const fallbackLocale = getInitialLocale();
  return {
    locale: fallbackLocale,
    setLocale: fallbackSetLocale,
    toggleLocale: fallbackToggleLocale,
    t: tr,
  };
}
