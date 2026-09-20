import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemFormModal from '../../src/components/library/ItemFormModal';
import { renderWithProviders } from '../utils/renderWithProviders';
import type { KeyDefinition } from '../../src/types';

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

const definitions: KeyDefinition[] = [
  keyDef({ name: 'name', title: '名称', is_required: true }),
  keyDef({ name: 'tag_list', title: '标签', value_type: 'array' }),
];

describe('ItemFormModal', () => {
  it('prefills initial values in edit mode', async () => {
    const { unmount } = renderWithProviders(
      <ItemFormModal
        open
        mode="edit"
        definitions={definitions}
        initialValues={{ name: '旧名称', tag_list: ['x'] }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(await screen.findByText('编辑记录')).toBeInTheDocument();
    expect(screen.getByLabelText('名称')).toHaveValue('旧名称');
    expect(screen.getByLabelText('标签')).toHaveValue('[\n  "x"\n]');
    unmount();
  });

  it('submits parsed values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { unmount } = renderWithProviders(
      <ItemFormModal open mode="create" definitions={definitions} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );

    expect(await screen.findByText('新建记录')).toBeInTheDocument();
    await user.type(screen.getByLabelText('名称'), '新记录');
    await user.click(screen.getByLabelText('标签'));
    await user.paste('["k1"]');
    await user.click(screen.getByRole('button', { name: /保\s*存/ }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: '新记录', tag_list: ['k1'] })),
    );
    unmount();
  });

  it('does not submit invalid JSON', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { unmount } = renderWithProviders(
      <ItemFormModal open mode="create" definitions={definitions} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );

    expect(await screen.findByText('新建记录')).toBeInTheDocument();
    await user.type(screen.getByLabelText('名称'), '新记录');
    await user.click(screen.getByLabelText('标签'));
    await user.paste('{oops');
    await user.click(screen.getByRole('button', { name: /保\s*存/ }));

    expect(await screen.findByText('JSON 格式不正确')).toBeInTheDocument();
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    unmount();
  });
});
