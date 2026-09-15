import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDetailDrawer from '../../src/components/library/ItemDetailDrawer';
import { renderWithProviders } from '../utils/renderWithProviders';
import { registerPluginComponent } from '../../src/plugins/loader';
import type { CategoryDefinition, KeyDefinition, KnowledgeItem } from '../../src/types';

registerPluginComponent('demo_plugin', ({ value }) => (
  <span data-testid="plugin-value">PLUGIN:{String(value)}</span>
));

const keyDef = (overrides: Partial<KeyDefinition>): KeyDefinition => ({
  name: 'k',
  title: 'K',
  value_type: 'string',
  default_value: '',
  description: '',
  category_name: 'basic',
  is_required: false,
  is_visible: true,
  plugin_name: '',
  delete_with_plugin: false,
  is_public: true,
  is_private: false,
  created_at: '',
  updated_at: '',
  ...overrides,
});

const categories: CategoryDefinition[] = [
  { name: 'basic', title: '基础属性', parent_name: null, is_builtin: true },
  { name: 'extra', title: '扩展属性', parent_name: null, is_builtin: false },
];

const keyInfo: Record<string, KeyDefinition> = {
  file_path: keyDef({ name: 'file_path', title: '文件路径', category_name: 'basic' }),
  pages: keyDef({ name: 'pages', title: '页数', value_type: 'number', category_name: 'basic' }),
  archived: keyDef({ name: 'archived', title: '已归档', value_type: 'boolean', category_name: 'extra' }),
  tag_list: keyDef({ name: 'tag_list', title: '标签', value_type: 'array', category_name: 'extra' }),
  note: keyDef({ name: 'note', title: '备注', category_name: 'extra' }),
  rating: keyDef({ name: 'rating', title: '评分', plugin_name: 'demo_plugin', category_name: 'extra' }),
};

const item: KnowledgeItem = {
  id: 'i1',
  name: '部署手册',
  keyValues: {
    name: '部署手册',
    file_path: '/app/data/uploads/abc-deploy.md',
    file_type: 'text/markdown',
    pages: 12,
    archived: false,
    tag_list: ['a', 'b'],
    note: '这是一段说明',
    rating: 4,
  },
  keyInfo,
  createdAt: '2026-09-01T08:00:00',
  updatedAt: '2026-09-02T09:30:00',
};

const imageItem: KnowledgeItem = {
  ...item,
  keyValues: { ...item.keyValues, file_path: '/app/data/uploads/abc-pic.png', file_type: 'image/png' },
};

const renderDrawer = (overrides: Partial<React.ComponentProps<typeof ItemDetailDrawer>> = {}) =>
  renderWithProviders(
    <ItemDetailDrawer
      item={item}
      keys={Object.values(keyInfo)}
      categories={categories}
      onClose={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  );

describe('ItemDetailDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('groups attributes by category and uses key_info titles', () => {
    renderDrawer();

    expect(screen.getByText('基础属性')).toBeInTheDocument();
    expect(screen.getByText('扩展属性')).toBeInTheDocument();
    expect(screen.getByText('文件路径')).toBeInTheDocument();
    expect(screen.getByText('页数')).toBeInTheDocument();
    expect(screen.getByText('/app/data/uploads/abc-deploy.md')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders typed values: boolean tag, json block, plugin component', () => {
    renderDrawer();

    expect(screen.getByText('否')).toBeInTheDocument();
    expect(screen.getByText(/"a"/)).toBeInTheDocument();
    expect(screen.getByText('这是一段说明')).toBeInTheDocument();
    expect(screen.getByTestId('plugin-value')).toHaveTextContent('PLUGIN:4');
  });

  it('falls back to key names when key_info is missing', () => {
    const bareItem: KnowledgeItem = { id: 'i2', name: '裸记录', keyValues: { mystery: 'x' } };
    renderDrawer({ item: bareItem, keys: [] });

    expect(screen.getByText('mystery')).toBeInTheDocument();
    expect(screen.getByText('x')).toBeInTheDocument();
    expect(screen.getByText('其他')).toBeInTheDocument();
  });

  it('shows timestamps', () => {
    renderDrawer();

    expect(screen.getByText(/创建于 2026\/09\/01 08:00/)).toBeInTheDocument();
    expect(screen.getByText(/更新于 2026\/09\/02 09:30/)).toBeInTheDocument();
  });

  it('previews images through the media modal', async () => {
    const user = userEvent.setup();
    renderDrawer({ item: imageItem });

    await user.click(screen.getByRole('button', { name: /预\s*览/ }));

    const image = await screen.findByRole('img', { name: '预览' });
    expect(image).toHaveAttribute('src', '/api/v1/uploads/abc-pic.png');
  });

  it('hides preview for non-media items', () => {
    renderDrawer();
    expect(screen.queryByRole('button', { name: /预\s*览/ })).not.toBeInTheDocument();
  });

  it('invokes edit and open-location callbacks', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onOpenLocation = vi.fn();
    renderDrawer({ onEdit, onOpenLocation });

    await user.click(screen.getByRole('button', { name: /编\s*辑/ }));
    expect(onEdit).toHaveBeenCalledWith(item);

    await user.click(screen.getByRole('button', { name: /打开所在文件夹/ }));
    expect(onOpenLocation).toHaveBeenCalledWith('/app/data/uploads/abc-deploy.md');
  });

  it('guards deletion with a confirmation', async () => {
    const onDelete = vi.fn();
    renderDrawer({ onDelete });

    fireEvent.click(screen.getByRole('button', { name: /删\s*除/ }));
    expect(await screen.findByText('删除这条记录？')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('i1'));
  });
});
