import { describe, it, expect, vi } from 'vitest';
import { Button, Form } from 'antd';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicKeyForm from '../../src/components/common/DynamicKeyForm';
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
  keyDef({ name: 'pages', title: '页数', value_type: 'number' }),
  keyDef({ name: 'archived', title: '已归档', value_type: 'boolean' }),
  keyDef({ name: 'tag_list', title: '标签', value_type: 'array' }),
  keyDef({ name: 'meta', title: '元数据', value_type: 'object' }),
  keyDef({ name: 'secret', title: '隐藏字段', is_visible: false }),
];

const Harness = ({ onFinish }: { onFinish: (values: Record<string, unknown>) => void }) => {
  const [form] = Form.useForm();
  return (
    <>
      <DynamicKeyForm form={form} definitions={definitions} onFinish={onFinish} />
      <Button onClick={() => form.submit()}>提交</Button>
    </>
  );
};

describe('DynamicKeyForm', () => {
  it('renders widgets by value_type and hides invisible keys', () => {
    renderWithProviders(<Harness onFinish={vi.fn()} />);

    expect(screen.getByLabelText('名称')).toBeInTheDocument();
    expect(screen.getByLabelText('页数')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByLabelText('标签')).toBeInTheDocument();
    expect(screen.getByLabelText('元数据')).toBeInTheDocument();
    expect(screen.queryByLabelText('隐藏字段')).not.toBeInTheDocument();
  });

  it('blocks submit when a required key is empty', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<Harness onFinish={onFinish} />);

    await user.click(screen.getByRole('button', { name: /提\s*交/ }));

    expect(await screen.findByText('请输入名称')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON before submitting', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<Harness onFinish={onFinish} />);

    await user.type(screen.getByLabelText('名称'), '部署手册');
    await user.click(screen.getByLabelText('标签'));
    await user.paste('[a');
    await user.click(screen.getByRole('button', { name: /提\s*交/ }));

    expect(await screen.findByText('JSON 格式不正确')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('parses JSON fields into arrays and objects on submit', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderWithProviders(<Harness onFinish={onFinish} />);

    await user.type(screen.getByLabelText('名称'), '部署手册');
    await user.type(screen.getByLabelText('页数'), '12');
    await user.click(screen.getByLabelText('标签'));
    await user.paste('["a","b"]');
    await user.click(screen.getByLabelText('元数据'));
    await user.paste('{"owner":"ops"}');
    await user.click(screen.getByRole('button', { name: /提\s*交/ }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ name: '部署手册', pages: 12, tag_list: ['a', 'b'], meta: { owner: 'ops' } }),
    );
  });
});
