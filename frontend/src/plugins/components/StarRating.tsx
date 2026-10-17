import React, { useState } from 'react';
import { App, Rate } from 'antd';
import api from '../../services/api';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
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
      message.error(t('评分更新失败', 'Failed to update rating'));
    }
  };

  return (
    <Rate
      value={rating}
      disabled={readOnly}
      onChange={handleChange}
      aria-label={t('评分', 'Rating')}
      style={{ whiteSpace: 'nowrap', display: 'inline-flex', fontSize: 14 }}
    />
  );
};

export default StarRating;
