import React, { useState, useEffect } from 'react';

interface StarRatingProps {
  value: number;
  itemId: string;
  onUpdate: (value: number) => void;
  readOnly?: boolean;
  keyDefinition?: {
    name: string;
    title: string;
    value_type: string;
  };
}

const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  itemId,
  onUpdate,
  readOnly = false,
}) => {
  const [rating, setRating] = useState<number>(value || 0);
  const [hover, setHover] = useState<number>(0);

  useEffect(() => {
    setRating(value || 0);
  }, [value]);

  const handleClick = async (star: number) => {
    if (readOnly) return;

    setRating(star);
    onUpdate(star);

    try {
      const response = await fetch(
        `/api/v1/plugins/rating/items/${itemId}/rating`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: star }),
        }
      );

      if (!response.ok) {
        console.error('Failed to update rating');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    cursor: readOnly ? 'default' : 'pointer',
    fontSize: '24px',
    gap: '2px',
  };

  const starStyle = (star: number): React.CSSProperties => ({
    color: star <= (hover || rating) ? '#ffc107' : '#e4e5e9',
    transition: 'color 0.2s',
    userSelect: 'none',
  });

  return (
    <div style={containerStyle}>
      {[5, 4, 3, 2, 1].map((star) => (
        <span
          key={star}
          style={starStyle(star)}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
