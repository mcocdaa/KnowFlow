import React, { type ComponentType, Suspense } from 'react';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  frontend_entry: string;
  path: string;
}

export interface PluginComponentProps {
  value: unknown;
  itemId: string;
  keyDefinition: {
    name: string;
    title: string;
    value_type: string;
  };
  onUpdate: (value: unknown) => void;
  readOnly?: boolean;
}

const loadedPlugins: Record<string, ComponentType<PluginComponentProps>> = {};

export function registerPluginComponent(
  pluginName: string, 
  component: ComponentType<PluginComponentProps>
) {
  loadedPlugins[pluginName] = component;
}

export function getPluginComponent(
  pluginName: string
): ComponentType<PluginComponentProps> | null {
  return loadedPlugins[pluginName] || null;
}

export function hasPluginComponent(pluginName: string): boolean {
  return pluginName in loadedPlugins;
}

const PluginLoadingFallback: React.FC = () => (
  <div style={{ padding: '8px', color: '#999' }}>加载插件组件中...</div>
);

export const PluginRenderer: React.FC<{
  pluginName: string;
  value: unknown;
  itemId: string;
  keyDefinition: PluginComponentProps['keyDefinition'];
  onUpdate: (value: unknown) => void;
  readOnly?: boolean;
}> = ({ pluginName, value, itemId, keyDefinition, onUpdate, readOnly }) => {
  const PluginComponent = getPluginComponent(pluginName);
  
  if (!PluginComponent) {
    return (
      <span style={{ color: '#666' }}>
        {value !== undefined && value !== null && value !== '' ? String(value) : '-'}
      </span>
    );
  }
  
  return (
    <Suspense fallback={<PluginLoadingFallback />}>
      <PluginComponent
        value={value}
        itemId={itemId}
        keyDefinition={keyDefinition}
        onUpdate={onUpdate}
        readOnly={readOnly}
      />
    </Suspense>
  );
};

export async function fetchPluginManifests(): Promise<PluginManifest[]> {
  try {
    const response = await fetch('/api/v1/plugins/manifests');
    if (!response.ok) {
      throw new Error('Failed to fetch plugin manifests');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching plugin manifests:', error);
    return [];
  }
}
