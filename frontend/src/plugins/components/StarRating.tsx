import React, { useState } from 'react';
import { App } from 'antd';
import api from '../../services/api';

interface StarRatingProps {
  value?: number;
  itemId: string;
  onUpdate?: (value: number) => void;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  itemId,
  onUpdate = () => {},
  onChange,
  readOnly = false,
}) => {
  const { message } = App.useApp();
  const [rating, setRating] = useState<number>(value || 0);
  const [hover, setHover] = useState<number>(0);
  const [prevValue, setPrevValue] = useState<number>(value || 0);

  const normalizedValue = value || 0;
  if (prevValue !== normalizedValue) {
    setPrevValue(normalizedValue);
    setRating(normalizedValue);
  }

  const handleClick = async (star: number) => {
    if (readOnly) return;

    const previous = rating;
    setRating(star);
    onChange?.(star);
    onUpdate(star);

    try {
      await api.updatePluginRating(itemId, star);
    } catch (error) {
      console.error('Error updating rating:', error);
      // 失败回滚到原值，保持 UI/表单与后端一致
      setRating(previous);
      onChange?.(previous);
      message.error('评分更新失败');
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
