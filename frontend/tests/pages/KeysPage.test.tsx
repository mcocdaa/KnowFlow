import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KeysPage from '../../src/pages/KeysPage';
import { api } from '../../src/services/api';
import { renderWithProviders } from '../utils/renderWithProviders';
import type { CategoryDefinition, KeyDefinition } from '../../src/types';

vi.mock('../../src/services/api', async () => {
  const { createApiMock } = await import('../utils/mockApi');
  const mockApi = createApiMock();
  return { API_BASE_URL: '/api/v1', api: mockApi, default: mockApi };
});

const keyDef = (overrides: Partial<KeyDefinition>): KeyDefinition => ({
  name: 'k',
  title: 'K',
  value_type: 'string',
  default_value: '',
  description: '',
  category_name: 'basic_category',
  is_required: false,
  is_visible: true,
  plugin_name: '',
  delete_with_plugin: false,
  is_public: true,
  is_private: false,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  ...overrides,
});

const keys: KeyDefinition[] = [
  keyDef({ name: 'name', title: '名称', is_required: true }),
  keyDef({
    name: 'tag_list',
    title: '标签',
    value_type: 'array',
    default_value: [],
    description: '自由标签',
  }),
  keyDef({
    name: 'rating',
    title: '评分',
    value_type: 'number',
    category_name: 'extra_category',
    plugin_name: 'rating',
  }),
];

const categories: CategoryDefinition[] = [
  { name: 'basic_category', title: '基础属性', parent_name: null, is_builtin: true },
  { name: 'extra_category', title: '扩展属性', parent_name: null, is_builtin: false },
];

const renderPage = () => renderWithProviders(<KeysPage />);

describe('KeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchKeys).mockResolvedValue(keys);
    vi.mocked(api.fetchCategories).mockResolvedValue(categories);
  });

  it('renders keys with type, category and plugin columns', async () => {
    renderPage();

    expect((await screen.findAllByText('名称')).length).toBeGreaterThan(0);
    expect(screen.getByText('标签')).toBeInTheDocument();
    expect(screen.getByText('评分')).toBeInTheDocument();
    expect(screen.getByText('array')).toBeInTheDocument();
    expect(screen.getAllByText('基础属性')).toHaveLength(2);
    expect(screen.getAllByText('rating').length).toBeGreaterThan(0);
    expect(screen.getAllByText('是').length).toBeGreaterThan(0);
  });

  it('filters keys by category', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('标签');

    const filterWrapper = screen.getByTestId('key-category-filter');
    await user.click(within(filterWrapper).getByRole('combobox'));
    await user.click(await screen.findByTitle('基础属性'));

    await waitFor(() => expect(screen.queryByText('评分')).not.toBeInTheDocument());
    expect(screen.getAllByText('名称').length).toBeGreaterThan(0);
  });

  it('creates a key', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createKey).mockResolvedValue(keyDef({ name: 'new_key', title: '新 Key' }));

    renderPage();
    await screen.findAllByText('名称');

    await user.click(screen.getByRole('button', { name: /新建 Key/ }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('标识'), 'new_key');
    await user.type(within(dialog).getByLabelText('名称'), '新 Key');
    await user.click(within(dialog).getByLabelText('分类'));
    await user.click(await screen.findByTitle('基础属性'));
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    await waitFor(() =>
      expect(api.createKey).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'new_key', title: '新 Key', value_type: 'string' }),
      ),
    );
    await waitFor(() => expect(api.fetchKeys).toHaveBeenCalledTimes(2));
  });

  it('blocks invalid submissions', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('名称');

    await user.click(screen.getByRole('button', { name: /新建 Key/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    expect(await within(dialog).findByText('请输入标识')).toBeInTheDocument();
    expect(within(dialog).getByText('请输入名称')).toBeInTheDocument();
    expect(api.createKey).not.toHaveBeenCalled();
  });

  it('edits a key with prefilled JSON default and shows plugin info', async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateKey).mockResolvedValue(keyDef({ name: 'tag_list', title: '标签2' }));

    renderPage();
    await screen.findByText('标签');

    await user.click(screen.getAllByRole('button', { name: /编\s*辑/ })[1]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('标识')).toHaveValue('tag_list');
    expect(within(dialog).getByLabelText('默认值')).toHaveValue('[]');

    await user.clear(within(dialog).getByLabelText('名称'));
    await user.type(within(dialog).getByLabelText('名称'), '标签2');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    await waitFor(() =>
      expect(api.updateKey).toHaveBeenCalledWith('tag_list', expect.objectContaining({ title: '标签2' })),
    );
  });

  it('switches the default value control with the value type', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('名称');

    await user.click(screen.getByRole('button', { name: /新建 Key/ }));
    const dialog = await screen.findByRole('dialog');
    const typeWrapper = within(dialog).getByLabelText('类型').closest('.ant-select') as HTMLElement;
    await user.click(within(typeWrapper).getByRole('combobox'));
    await user.click(await screen.findByTitle('number'));

    expect(await within(dialog).findByRole('spinbutton')).toBeInTheDocument();
  });

  it('surfaces delete errors without reloading', async () => {
    vi.mocked(api.deleteKey).mockRejectedValue(new Error('key is in use'));

    renderPage();
    await screen.findByText('标签');

    fireEvent.click(screen.getAllByRole('button', { name: /删\s*除/ })[0]);
    fireEvent.click(await screen.findByRole('button', { name: /确\s*定/ }));

    await waitFor(() => expect(api.deleteKey).toHaveBeenCalledWith('name'));
    expect(api.fetchKeys).toHaveBeenCalledTimes(1);
  });
});
