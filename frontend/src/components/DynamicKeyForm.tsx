import React, { useEffect } from 'react';
import { Form, Input, Switch, InputNumber, Button, Input as AntInput } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { KeyDefinition, ValueType } from '../types';
import { hasPluginComponent, getPluginComponent } from '../plugins';

interface DynamicKeyFormProps {
  mode: 'import' | 'edit' | 'add';
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  itemId?: string;
}

const { TextArea } = AntInput;

const renderInputByType = (valueType: ValueType, key: KeyDefinition, itemId?: string) => {
  if (key.plugin_name && hasPluginComponent(key.plugin_name)) {
    const PluginComponent = getPluginComponent(key.plugin_name);
    if (PluginComponent) {
      return (
        <PluginComponent
          value={key.default_value}
          itemId={itemId || ''}
          keyDefinition={{
            name: key.name,
            title: key.title,
            value_type: key.value_type,
          }}
          onUpdate={() => {}}
          readOnly={false}
        />
      );
    }
  }
  
  switch (valueType) {
    case 'string':
      return <TextArea rows={3} />;
    case 'number':
      return <InputNumber style={{ width: '100%' }} />;
    case 'boolean':
      return <Switch />;
    case 'array':
      return <TextArea placeholder='使用 JSON 格式，例如: ["item1", "item2"]' rows={3} />;
    case 'object':
      return <TextArea placeholder='使用 JSON 格式，例如: {"key": "value"}' rows={4} />;
    default:
      return <Input />;
  }
};

export const DynamicKeyForm: React.FC<DynamicKeyFormProps> = ({ mode: _mode, initialValues, onSubmit, itemId }) => {
  const { definitionList } = useSelector((state: RootState) => state.key);
  const [form] = Form.useForm();

  const visibleKeys = definitionList.filter((key: KeyDefinition) => key.is_visible);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  const getInitialValue = (key: KeyDefinition) => {
    if (initialValues && initialValues[key.name] !== undefined) {
      return initialValues[key.name];
    }
    return key.default_value;
  };

  return (
    <Form 
      form={form}
      onFinish={onSubmit} 
      layout="vertical"
    >
      {visibleKeys.map((key: KeyDefinition) => {
        const hasPlugin = key.plugin_name && hasPluginComponent(key.plugin_name);
        
        if (hasPlugin) {
          return (
            <Form.Item
              key={key.name}
              label={key.title}
              required={key.is_required}
              tooltip={key.description}
            >
              {renderInputByType(key.value_type, key, itemId)}
            </Form.Item>
          );
        }
        
        return (
          <Form.Item
            key={key.name}
            name={key.name}
            label={key.title}
            required={key.is_required}
            initialValue={getInitialValue(key)}
            valuePropName={key.value_type === 'boolean' ? 'checked' : undefined}
            tooltip={key.description}
          >
            {renderInputByType(key.value_type, key, itemId)}
          </Form.Item>
        );
      })}
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
          确认
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DynamicKeyForm;
