import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  registerPluginComponent,
  getPluginComponent,
  hasPluginComponent,
  fetchPluginManifests,
  PluginRenderer,
} from '../../src/plugins/loader';

const TestComponent: React.FC<{ value: unknown }> = ({ value }) => (
  <div data-testid="test-component">Value: {String(value)}</div>
);

describe('Plugin Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerPluginComponent', () => {
    it('should register a plugin component', () => {
      registerPluginComponent('test-plugin', TestComponent);

      expect(hasPluginComponent('test-plugin')).toBe(true);
    });

    it('should overwrite existing component with same name', () => {
      const Component1 = () => <div>Component 1</div>;
      const Component2 = () => <div>Component 2</div>;

      registerPluginComponent('overwrite-test', Component1);
      registerPluginComponent('overwrite-test', Component2);

      const component = getPluginComponent('overwrite-test');
      expect(component).toBe(Component2);
    });
  });

  describe('getPluginComponent', () => {
    it('should return registered component', () => {
      registerPluginComponent('get-test', TestComponent);

      const component = getPluginComponent('get-test');

      expect(component).toBe(TestComponent);
    });

    it('should return null for unregistered plugin', () => {
      const component = getPluginComponent('nonexistent');

      expect(component).toBeNull();
    });
  });

  describe('hasPluginComponent', () => {
    it('should return true for registered plugin', () => {
      registerPluginComponent('has-test', TestComponent);

      expect(hasPluginComponent('has-test')).toBe(true);
    });

    it('should return false for unregistered plugin', () => {
      expect(hasPluginComponent('nonexistent')).toBe(false);
    });
  });

  describe('fetchPluginManifests', () => {
    it('should fetch manifests successfully', async () => {
      const mockManifests = [
        { name: 'rating', version: '1.0.0', description: 'Rating plugin' }
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifests),
      });

      const manifests = await fetchPluginManifests();

      expect(manifests).toEqual(mockManifests);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/plugins/manifests');
    });

    it('should return empty array on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const manifests = await fetchPluginManifests();

      expect(manifests).toEqual([]);
    });

    it('should return empty array on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
      });

      const manifests = await fetchPluginManifests();

      expect(manifests).toEqual([]);
    });
  });

  describe('PluginRenderer', () => {
    it('should render registered plugin component', () => {
      registerPluginComponent('render-test', TestComponent);

      render(
        <PluginRenderer
          pluginName="render-test"
          value={42}
          itemId="test-id"
          keyDefinition={{ name: 'test', title: 'Test', value_type: 'number' }}
          onUpdate={() => {}}
        />
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Value: 42')).toBeInTheDocument();
    });

    it('should render fallback for unregistered plugin', () => {
      render(
        <PluginRenderer
          pluginName="nonexistent"
          value="test-value"
          itemId="test-id"
          keyDefinition={{ name: 'test', title: 'Test', value_type: 'string' }}
          onUpdate={() => {}}
        />
      );

      expect(screen.getByText('test-value')).toBeInTheDocument();
    });

    it('should render dash for empty value', () => {
      render(
        <PluginRenderer
          pluginName="nonexistent"
          value=""
          itemId="test-id"
          keyDefinition={{ name: 'test', title: 'Test', value_type: 'string' }}
          onUpdate={() => {}}
        />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render dash for undefined value', () => {
      render(
        <PluginRenderer
          pluginName="nonexistent"
          value={undefined}
          itemId="test-id"
          keyDefinition={{ name: 'test', title: 'Test', value_type: 'string' }}
          onUpdate={() => {}}
        />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render dash for null value', () => {
      render(
        <PluginRenderer
          pluginName="nonexistent"
          value={null}
          itemId="test-id"
          keyDefinition={{ name: 'test', title: 'Test', value_type: 'string' }}
          onUpdate={() => {}}
        />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should pass props to plugin component', () => {
      const PropsTestComponent: React.FC<any> = ({ value, itemId, readOnly }) => (
        <div data-testid="props-test">
          {String(value)} - {itemId} - {String(readOnly)}
        </div>
      );

      registerPluginComponent('props-test', PropsTestComponent);

      render(
        <PluginRenderer
          pluginName="props-test"
          value={100}
          itemId="item-123"
          keyDefinition={{ name: 'test', title: 'Test', value_type: 'number' }}
          onUpdate={() => {}}
          readOnly={true}
        />
      );

      expect(screen.getByTestId('props-test')).toBeInTheDocument();
      expect(screen.getByText(/100 - item-123 - true/)).toBeInTheDocument();
    });
  });
});
