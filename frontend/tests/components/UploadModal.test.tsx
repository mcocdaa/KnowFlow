import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadModal from '../../src/components/library/UploadModal';
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

const definitions: KeyDefinition[] = [keyDef({ name: 'name', title: '名称', is_required: true })];

describe('UploadModal', () => {
  it('requires a file before uploading', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    renderWithProviders(
      <UploadModal open definitions={definitions} onCancel={vi.fn()} onUpload={onUpload} />,
    );

    const submit = screen.getByRole('button', { name: /开始上传/ });
    expect(submit).toBeDisabled();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(['hello'], 'a.txt', { type: 'text/plain' }));

    expect(await screen.findByText('a.txt')).toBeInTheDocument();
    await user.type(screen.getByLabelText('名称'), '文件记录');
    await user.click(submit);

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    const [file, values] = vi.mocked(onUpload).mock.calls[0];
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('a.txt');
    expect(values).toMatchObject({ name: '文件记录' });
  });

  it('shows upload progress', () => {
    renderWithProviders(
      <UploadModal open definitions={definitions} progress={40} onCancel={vi.fn()} onUpload={vi.fn()} />,
    );

    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});
