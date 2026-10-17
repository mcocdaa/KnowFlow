import { DatePicker, Form, Input, InputNumber, Switch } from 'antd';
import type { FormInstance } from 'antd';
import type { KeyDefinition } from '../../types';
import { buildFieldRules, serializeInitialValues, transformJsonValues } from '../../utils/dynamicForm';
import { useI18n } from '../../i18n';
import ArrayTagInput from './ArrayTagInput';

interface DynamicKeyFormProps {
  form: FormInstance;
  definitions: KeyDefinition[];
  initialValues?: Record<string, unknown>;
  onFinish: (values: Record<string, unknown>) => void | Promise<void>;
}

const DynamicKeyForm = ({ form, definitions, initialValues, onFinish }: DynamicKeyFormProps) => {
  const { t } = useI18n();
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
        const isArray = definition.value_type === 'array';
        const isDate = (definition.value_type as string) === 'date';
        const isObject = definition.value_type === 'object';

        return (
          <Form.Item
            key={definition.name}
            name={definition.name}
            label={t(definition.title)}
            valuePropName={isBoolean ? 'checked' : 'value'}
            rules={buildFieldRules(definition)}
            extra={definition.description ? t(definition.description) : undefined}
          >
            {isBoolean ? (
              <Switch />
            ) : definition.value_type === 'number' ? (
              <InputNumber style={{ width: '100%' }} />
            ) : isDate ? (
              <DatePicker style={{ width: '100%' }} />
            ) : isArray ? (
              <ArrayTagInput />
            ) : (
              <Input.TextArea
                autoSize={{ minRows: isObject ? 2 : 1, maxRows: isObject ? 8 : 6 }}
                placeholder={isObject ? t('例如 {"key":"value"}', 'e.g. {"key":"value"}') : undefined}
              />
            )}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default DynamicKeyForm;
