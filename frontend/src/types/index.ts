export type ValueType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type ItemSort = 'recent' | 'rating' | 'name';

export interface KeyDefinition {
  id?: string;
  name: string;
  title: string;
  value_type: ValueType;
  default_value: unknown;
  description: string;
  category_name: string;
  is_required: boolean;
  is_visible: boolean;
  plugin_name: string;
  delete_with_plugin: boolean;
  is_public: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryDefinition {
  id?: string;
  name: string;
  title: string;
  parent_name: string | null;
  is_builtin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryInput {
  name: string;
  title: string;
  parent_name?: string | null;
}

export interface KnowledgeItem {
  id: string;
  name: string;
  keyValues: Record<string, unknown>;
  keyInfo?: Record<string, KeyDefinition>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchParams {
  q?: string;
  key?: string;
  keyValue?: string;
  sort?: ItemSort;
  page?: number;
  pageSize?: number;
}

export interface PagedItems {
  items: KnowledgeItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  frontend_entry: string;
}
