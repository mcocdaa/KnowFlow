import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App as AntdApp } from 'antd';
import StarRating from '../../src/plugins/components/StarRating';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', async () => {
  const { createApiMock } = await import('../utils/mockApi');
  const mockApi = createApiMock();
  return { API_BASE_URL: '/api/v1', api: mockApi, default: mockApi };
});

const renderStars = (props: Partial<React.ComponentProps<typeof StarRating>> = {}) =>
  render(
    <AntdApp>
      <StarRating itemId="i1" {...props} />
    </AntdApp>,
  );

const starItem = (index: number): HTMLElement =>
  screen.getAllByRole('radio')[index].closest('li') as HTMLElement;

describe('StarRating plugin component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders five stars with the current value filled', () => {
    renderStars({ value: 3 });

    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(starItem(0)).toHaveClass('ant-rate-star-full');
    expect(starItem(2)).toHaveClass('ant-rate-star-full');
    expect(starItem(3)).not.toHaveClass('ant-rate-star-full');
  });

  it('treats undefined and null values as empty', () => {
    renderStars({ value: undefined });

    expect(starItem(0)).not.toHaveClass('ant-rate-star-full');
    expect(api.updatePluginRating).not.toHaveBeenCalled();
  });

  it('updates optimistically and persists the rating', async () => {
    const user = userEvent.setup();
    vi.mocked(api.updatePluginRating).mockResolvedValue(undefined);
    const onUpdate = vi.fn();

    renderStars({ value: 2, onUpdate });
    await user.click(screen.getAllByRole('radio')[4]);

    expect(onUpdate).toHaveBeenCalledWith(5);
    expect(starItem(4)).toHaveClass('ant-rate-star-full');
    await waitFor(() => expect(api.updatePluginRating).toHaveBeenCalledWith('i1', 5));
  });

  it('rolls back when the backend rejects the update', async () => {
    const user = userEvent.setup();
    vi.mocked(api.updatePluginRating).mockRejectedValue(new Error('boom'));

    renderStars({ value: 2 });
    await user.click(screen.getAllByRole('radio')[3]);

    await waitFor(() => expect(starItem(3)).not.toHaveClass('ant-rate-star-full'));
    expect(starItem(1)).toHaveClass('ant-rate-star-full');
    expect(api.updatePluginRating).toHaveBeenCalledWith('i1', 4);
  });

  it('ignores interaction when readOnly', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    renderStars({ value: 3, readOnly: true, onUpdate });
    await user.click(screen.getAllByRole('radio')[4]);

    expect(onUpdate).not.toHaveBeenCalled();
    expect(api.updatePluginRating).not.toHaveBeenCalled();
  });
});
