export type ValueType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface KeyDefinition {
  name: string;
  title: string;
  value_type: ValueType;
  default_value: any;
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
  name: string;
  title: string;
  parent_name: string | null;
  is_builtin: boolean;
}

export interface KnowledgeItem {
  id: string;
  name: string;
  keyValues: Record<string, unknown>;
  createdAt?: string;
}
