import React from 'react';
import { Form, Input, InputNumber, Switch, DatePicker, Rate } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface DynamicKeyFormProps {
  mode: 'import' | 'edit';
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
}

export const DynamicKeyForm: React.FC<DynamicKeyFormProps> = ({ mode, initialValues, onSubmit }) => {
  const { definitions } = useSelector((state: RootState) => state.key);
  
  const visibleKeys = definitions.filter(key =>
    mode === 'import' ? key.isVisibleOnImport : key.isVisibleOnEdit
  );

  const renderInput = (key: any) => {
    switch (key.dataType) {
      case 'string':
        return <Input />;
      case 'number':
        if (key.name === 'star_rating') return <Rate />;
        return <InputNumber />;
      case 'boolean':
        return <Switch />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      default:
        return <Input />;
    }
  };

  return (
    <Form onFinish={onSubmit} initialValues={initialValues}>
      {visibleKeys.map(key => (
        <Form.Item
          key={key.id}
          name={key.name}
          label={key.description || key.name}
          required={key.isRequired}
          initialValue={key.defaultValue}
        >
          {key.isReadOnly ? (
            <Input disabled style={{ color: '#999', background: '#f5f5f5' }} />
          ) : (
            renderInput(key)
          )}
        </Form.Item>
      ))}
    </Form>
  );
};
