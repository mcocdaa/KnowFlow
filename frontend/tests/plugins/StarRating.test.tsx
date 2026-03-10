import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import StarRating from '../../src/plugins/components/StarRating';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('StarRating Component', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render 5 stars', () => {
      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    it('should display 0 filled stars when value is 0', () => {
      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      const filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );

      expect(filledStars).toHaveLength(0);
    });

    it('should display all 5 filled stars when value is 5', () => {
      render(
        <StarRating
          value={5}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      const filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );

      expect(filledStars).toHaveLength(5);
    });

    it('should handle undefined value as 0', () => {
      render(
        <StarRating
          value={undefined as unknown as number}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      const filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );

      expect(filledStars).toHaveLength(0);
    });

    it('should handle null value as 0', () => {
      render(
        <StarRating
          value={null as unknown as number}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      const filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );

      expect(filledStars).toHaveLength(0);
    });
  });

  describe('Interaction', () => {
    it('should call onUpdate when star is clicked', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[0]);

      expect(mockOnUpdate).toHaveBeenCalledWith(5);
    });

    it('should update rating to 1 when last star is clicked', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[4]);

      expect(mockOnUpdate).toHaveBeenCalledWith(1);
    });

    it('should update rating to 3 when third star is clicked', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[2]);

      expect(mockOnUpdate).toHaveBeenCalledWith(3);
    });

    it('should make API call when star is clicked', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-item-123"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[0]);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/plugins/rating/items/test-item-123/rating',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: 5 }),
        })
      );
    });

    it('should not make API call in readOnly mode', async () => {
      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
          readOnly={true}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[0]);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Hover Effects', () => {
    it('should show hover effect on mouse enter', async () => {
      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      const thirdStar = stars[2];

      await user.hover(thirdStar);

      const filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );

      expect(filledStars.length).toBeGreaterThanOrEqual(3);
    });

    it('should not show hover effect in readOnly mode', async () => {
      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
          readOnly={true}
        />
      );

      const stars = screen.getAllByText('★');
      const thirdStar = stars[2];

      await user.hover(thirdStar);

      const filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );

      expect(filledStars).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[0]);

      expect(mockOnUpdate).toHaveBeenCalledWith(5);

      consoleSpy.mockRestore();
    });

    it('should handle non-ok API response', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({ ok: false });

      const user = userEvent.setup();

      render(
        <StarRating
          value={0}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      const stars = screen.getAllByText('★');
      await user.click(stars[0]);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Value Updates', () => {
    it('should update displayed rating when value prop changes', () => {
      const { rerender } = render(
        <StarRating
          value={2}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      let stars = screen.getAllByText('★');
      let filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );
      expect(filledStars).toHaveLength(2);

      rerender(
        <StarRating
          value={4}
          itemId="test-id"
          onUpdate={mockOnUpdate}
        />
      );

      stars = screen.getAllByText('★');
      filledStars = stars.filter(star =>
        (star as HTMLElement).style.color === 'rgb(255, 193, 7)'
      );
      expect(filledStars).toHaveLength(4);
    });
  });
});
