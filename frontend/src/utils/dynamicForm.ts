import type { Rule } from 'antd/es/form';
import type { KeyDefinition } from '../types';

export const isJsonValueType = (valueType: string): boolean =>
  valueType === 'array' || valueType === 'object';

export const jsonValidator = async (_rule: unknown, value: unknown): Promise<void> => {
  if (value === undefined || value === null || value === '') return;
  if (typeof value !== 'string') return;
  try {
    JSON.parse(value);
  } catch {
    throw new Error('JSON 格式不正确');
  }
};

export const buildFieldRules = (definition: KeyDefinition): Rule[] => {
  const rules: Rule[] = [];

  if (definition.is_required && definition.value_type !== 'boolean') {
    rules.push({ required: true, message: `请输入${definition.title}` });
  }
  if (isJsonValueType(definition.value_type)) {
    rules.push({ validator: jsonValidator });
  }

  return rules;
};

export const serializeInitialValues = (
  definitions: KeyDefinition[],
  initialValues?: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  definitions.forEach((definition) => {
    const raw = initialValues?.[definition.name] ?? definition.default_value;
    if (raw === undefined || raw === null) return;

    if (isJsonValueType(definition.value_type) && typeof raw !== 'string') {
      result[definition.name] = JSON.stringify(raw, null, 2);
    } else {
      result[definition.name] = raw;
    }
  });

  return result;
};

export const transformJsonValues = (
  values: Record<string, unknown>,
  definitions: KeyDefinition[],
): Record<string, unknown> => {
  const result = { ...values };

  definitions.forEach((definition) => {
    if (!isJsonValueType(definition.value_type)) return;

    const raw = result[definition.name];
    if (typeof raw === 'string' && raw.trim() !== '') {
      result[definition.name] = JSON.parse(raw);
    }
  });

  return result;
};
