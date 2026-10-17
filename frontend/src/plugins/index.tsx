import React from 'react';
import { Tag, Typography } from 'antd';
import { registerPluginComponent, type PluginComponentProps } from './loader';
import StarRating from './components/StarRating';
import { useI18n } from '../i18n';

export { PluginRenderer, hasPluginComponent, getPluginComponent } from './loader';
export type { PluginComponentProps } from './loader';

const StarRatingWrapper: React.FC<PluginComponentProps> = (props) => {
  return (
    <StarRating
      value={props.value as number}
      itemId={props.itemId}
      onUpdate={props.onUpdate}
      readOnly={props.readOnly}
    />
  );
};

const ARCHIVE_TYPE_LABELS: Record<string, { zh: string; en: string; color: string }> = {
  requirement: { zh: '需求', en: 'Requirement', color: 'purple' },
  code: { zh: '代码', en: 'Code', color: 'cyan' },
  test: { zh: '测试', en: 'Test', color: 'orange' },
  document: { zh: '文档', en: 'Document', color: 'blue' },
  flow_record: { zh: '流程记录', en: 'Flow Record', color: 'geekblue' },
};

const FOLD_LEVEL_LABELS: Record<number, { zh: string; en: string; color: string }> = {
  1: { zh: 'L1 顶层摘要', en: 'L1 Top Summary', color: 'green' },
  2: { zh: 'L2 中层折叠', en: 'L2 Mid Fold', color: 'gold' },
  3: { zh: 'L3 完整内容', en: 'L3 Full Content', color: 'default' },
};

const OpenClawPluginWrapper: React.FC<PluginComponentProps> = ({ value, keyDefinition }) => {
  const { t, locale } = useI18n();
  if (value === undefined || value === null || value === '') {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }
  if (keyDefinition.name === 'openclaw_archive_type') {
    const info = ARCHIVE_TYPE_LABELS[String(value)];
    if (info) {
      return <Tag color={info.color}>{locale === 'zh' ? info.zh : info.en}</Tag>;
    }
  }
  if (keyDefinition.name === 'openclaw_fold_level') {
    const info = FOLD_LEVEL_LABELS[Number(value)];
    if (info) {
      return <Tag color={info.color}>{locale === 'zh' ? info.zh : info.en}</Tag>;
    }
  }
  if (keyDefinition.name === 'openclaw_project_id') {
    return <Tag color="blue">{String(value)}</Tag>;
  }
  return <Typography.Text>{typeof value === 'string' ? t(value) : String(value)}</Typography.Text>;
};

export function initializePlugins(): void {
  registerPluginComponent('rating', StarRatingWrapper);
  registerPluginComponent('knowflow_openclaw', OpenClawPluginWrapper);
}

initializePlugins();
