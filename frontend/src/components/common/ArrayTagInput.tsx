import React, { useState, useMemo } from 'react';
import { Tag, Input, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useI18n } from '../../i18n';

interface ArrayTagInputProps {
  id?: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  placeholder?: string;
}

export const ArrayTagInput: React.FC<ArrayTagInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
}) => {
  const { t } = useI18n();
  const resolvedPlaceholder =
    placeholder ?? t('例如 ["标签1", "标签2"]，或使用上方可视化标签', 'e.g. ["tag1", "tag2"], or use the visual tag toolbar above');

  const formatInitial = (val: unknown): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const textValue = formatInitial(value);
  const [newTagInput, setNewTagInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Derive parsed tags from textValue
  const parsedTags = useMemo<string[]>(() => {
    const trimmed = textValue.trim();
    if (!trimmed.startsWith('[')) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // invalid JSON
    }
    return [];
  }, [textValue]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = parsedTags.filter((tag) => tag !== tagToRemove);
    const nextJson = JSON.stringify(nextTags, null, 2);
    onChange?.(nextJson);
  };

  const handleAddTagConfirm = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !parsedTags.includes(trimmed)) {
      const nextTags = [...parsedTags, trimmed];
      const nextJson = JSON.stringify(nextTags, null, 2);
      onChange?.(nextJson);
    }
    setNewTagInput('');
    setShowInput(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Visual AntD Tags toolbar */}
      <Space wrap size={[6, 6]} style={{ minHeight: 28, alignItems: 'center' }}>
        {parsedTags.map((tag) => (
          <Tag
            key={tag}
            color="blue"
            closable
            onClose={(e) => {
              e.preventDefault();
              handleRemoveTag(tag);
            }}
            style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4 }}
          >
            {t(tag)}
          </Tag>
        ))}

        {showInput ? (
          <Input
            size="small"
            style={{ width: 100 }}
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onBlur={handleAddTagConfirm}
            onPressEnter={handleAddTagConfirm}
            autoFocus
            placeholder={t('输入标签', 'Enter tag')}
          />
        ) : (
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setShowInput(true)}
            style={{ fontSize: 12, height: 26 }}
          >
            {t('添加标签', 'Add Tag')}
          </Button>
        )}
      </Space>

      {/* Synchronized JSON Textarea (compatible with existing tests, jsonValidator, and manual copy-paste) */}
      <Input.TextArea
        id={id}
        value={textValue}
        onChange={handleTextChange}
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder={resolvedPlaceholder}
      />
    </div>
  );
};

export default ArrayTagInput;
