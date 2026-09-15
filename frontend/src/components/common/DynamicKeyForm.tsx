import { Form, Input, InputNumber, Switch } from 'antd';
import type { FormInstance } from 'antd';
import type { KeyDefinition } from '../../types';
import { buildFieldRules, serializeInitialValues, transformJsonValues } from '../../utils/dynamicForm';

interface DynamicKeyFormProps {
  form: FormInstance;
  definitions: KeyDefinition[];
  initialValues?: Record<string, unknown>;
  onFinish: (values: Record<string, unknown>) => void | Promise<void>;
}

const DynamicKeyForm = ({ form, definitions, initialValues, onFinish }: DynamicKeyFormProps) => {
  const visibleDefinitions = definitions.filter((definition) => definition.is_visible);

  const handleFinish = (values: Record<string, unknown>) => {
    void onFinish(transformJsonValues(values, visibleDefinitions));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      preserve={false}
      initialValues={serializeInitialValues(visibleDefinitions, initialValues)}
      onFinish={handleFinish}
    >
      {visibleDefinitions.map((definition) => {
        const isBoolean = definition.value_type === 'boolean';
        const isJson = definition.value_type === 'array' || definition.value_type === 'object';

        return (
          <Form.Item
            key={definition.name}
            name={definition.name}
            label={definition.title}
            valuePropName={isBoolean ? 'checked' : 'value'}
            rules={buildFieldRules(definition)}
            extra={definition.description || undefined}
          >
            {isBoolean ? (
              <Switch />
            ) : definition.value_type === 'number' ? (
              <InputNumber style={{ width: '100%' }} />
            ) : (
              <Input.TextArea
                autoSize={{ minRows: isJson ? 2 : 1, maxRows: isJson ? 8 : 6 }}
                placeholder={isJson ? '例如 ["a","b"] 或 {"key":"value"}' : undefined}
              />
            )}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default DynamicKeyForm;
