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
};

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
