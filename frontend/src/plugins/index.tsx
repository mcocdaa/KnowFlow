import React from 'react';
import { registerPluginComponent, fetchPluginManifests, type PluginComponentProps } from './loader';
import StarRating from './components/StarRating';

export { PluginRenderer, hasPluginComponent, getPluginComponent } from './loader';
export type { PluginManifest, PluginComponentProps } from './loader';

const StarRatingWrapper: React.FC<PluginComponentProps> = (props) => {
  return (
    <StarRating
      value={props.value as number}
      itemId={props.itemId}
      onUpdate={props.onUpdate}
      readOnly={props.readOnly}
    />
  );
};

export function initializePlugins(): void {
  registerPluginComponent('rating', StarRatingWrapper);
  console.log('[Plugins] 插件组件已注册: rating');
}

export async function loadPluginManifests() {
  return await fetchPluginManifests();
}
