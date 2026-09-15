import React, { useState } from 'react';
import { App, Rate } from 'antd';
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
  const [prevValue, setPrevValue] = useState<number>(value || 0);

  const normalizedValue = value || 0;
  if (prevValue !== normalizedValue) {
    setPrevValue(normalizedValue);
    setRating(normalizedValue);
  }

  const handleChange = async (next: number) => {
    if (readOnly) return;

    const previous = rating;
    setRating(next);
    onChange?.(next);
    onUpdate(next);

    try {
      await api.updatePluginRating(itemId, next);
    } catch (error) {
      console.error('Error updating rating:', error);
      // 失败回滚到原值，保持 UI/表单与后端一致
      setRating(previous);
      onChange?.(previous);
      message.error('评分更新失败');
    }
  };

  return <Rate value={rating} disabled={readOnly} onChange={handleChange} aria-label="评分" />;
};

export default StarRating;
