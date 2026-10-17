import React, { useState, useEffect } from 'react';

interface OpenClawAttributes {
  openclaw_project_id?: string;
  openclaw_archive_type?: string;
  openclaw_fold_level?: number;
  openclaw_agent_source?: string;
  openclaw_summary?: string;
  openclaw_flow_id?: string;
}

interface OpenClawFormProps {
  value: unknown;
  itemId: string;
  keyDefinition: {
    name: string;
    title: string;
    value_type: string;
  };
  onUpdate: (value: unknown) => void;
  readOnly?: boolean;
}

const OpenClawForm: React.FC<OpenClawFormProps> = ({
  value,
  itemId,
  keyDefinition,
  onUpdate,
  readOnly = false
}) => {
  const isEn = typeof window !== 'undefined' && window.localStorage?.getItem('knowflow_lang') === 'en';
  const t = (zh: string, en: string) => (isEn ? en : zh);

  const initialValues = (value as OpenClawAttributes) || {};

  const [formData, setFormData] = useState<OpenClawAttributes>({
    openclaw_project_id: initialValues.openclaw_project_id || '',
    openclaw_archive_type: initialValues.openclaw_archive_type || 'document',
    openclaw_fold_level: initialValues.openclaw_fold_level || 3,
    openclaw_agent_source: initialValues.openclaw_agent_source || '',
    openclaw_summary: initialValues.openclaw_summary || '',
    openclaw_flow_id: initialValues.openclaw_flow_id || ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemId && !initialValues.openclaw_project_id) {
      loadOpenClawAttributes();
    }
  }, [itemId]);

  const loadOpenClawAttributes = async () => {
    try {
      const response = await fetch(`/api/v1/plugins/knowflow_openclaw/items/${itemId}/openclaw`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error(t('加载OpenClaw属性失败:', 'Failed to load OpenClaw attributes:'), error);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (readOnly) return;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (readOnly) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/plugins/knowflow_openclaw/items/${itemId}/openclaw`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onUpdate(result.data);
        alert(t('OpenClaw属性保存成功', 'OpenClaw attributes saved successfully'));
      } else {
        const error = await response.json();
        alert(t(`保存失败: ${error.detail}`, `Failed to save: ${error.detail}`));
      }
    } catch (error) {
      console.error(t('保存OpenClaw属性失败:', 'Failed to save OpenClaw attributes:'), error);
      alert(t('保存失败，请重试', 'Failed to save, please try again'));
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #e8e8e8',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    maxWidth: '600px'
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: '500',
    fontSize: '14px',
    color: '#333'
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: readOnly ? '#f5f5f5' : 'white',
    cursor: readOnly ? 'not-allowed' : 'text'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: readOnly ? 'not-allowed' : 'pointer'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: readOnly || loading ? 'not-allowed' : 'pointer',
    opacity: readOnly || loading ? 0.6 : 1,
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
        {t('OpenClaw 桥接属性', 'OpenClaw Bridge Attributes')}
      </h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>{t('项目ID', 'Project ID')} <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          value={formData.openclaw_project_id}
          onChange={(e) => handleChange('openclaw_project_id', e.target.value)}
          placeholder={t('请输入项目唯一ID', 'Enter unique project ID')}
          style={inputStyle}
          disabled={readOnly}
          required
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>{t('归档类型', 'Archive Type')}</label>
        <select
          value={formData.openclaw_archive_type}
          onChange={(e) => handleChange('openclaw_archive_type', e.target.value)}
          style={selectStyle}
          disabled={readOnly}
        >
          <option value="requirement">{t('需求文档', 'Requirement')}</option>
          <option value="code">{t('代码', 'Code')}</option>
          <option value="test">{t('测试用例', 'Test Case')}</option>
          <option value="document">{t('普通文档', 'Document')}</option>
          <option value="flow_record">{t('流程记录', 'Flow Record')}</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>{t('折叠层级', 'Fold Level')}</label>
        <select
          value={formData.openclaw_fold_level}
          onChange={(e) => handleChange('openclaw_fold_level', parseInt(e.target.value))}
          style={selectStyle}
          disabled={readOnly}
        >
          <option value={1}>{t('1 - 顶层摘要', '1 - Top Summary')}</option>
          <option value={2}>{t('2 - 中层内容', '2 - Mid-level Content')}</option>
          <option value={3}>{t('3 - 完整内容', '3 - Full Content')}</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>{t('生成者', 'Agent Source')}</label>
        <input
          type="text"
          value={formData.openclaw_agent_source}
          onChange={(e) => handleChange('openclaw_agent_source', e.target.value)}
          placeholder={t('编码Agent / 调试Agent / AutoFlow', 'Coding Agent / Debug Agent / AutoFlow')}
          style={inputStyle}
          disabled={readOnly}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>{t('摘要', 'Summary')}</label>
        <textarea
          value={formData.openclaw_summary}
          onChange={(e) => handleChange('openclaw_summary', e.target.value)}
          placeholder={t('一句话摘要，AI只读摘要不读全文', 'One-line summary for AI indexing')}
          style={textareaStyle}
          disabled={readOnly}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>{t('流程ID', 'Flow ID')}</label>
        <input
          type="text"
          value={formData.openclaw_flow_id}
          onChange={(e) => handleChange('openclaw_flow_id', e.target.value)}
          placeholder={t('AutoFlow流程ID（可选）', 'AutoFlow ID (Optional)')}
          style={inputStyle}
          disabled={readOnly}
        />
      </div>

      {!readOnly && (
        <button
          onClick={handleSubmit}
          style={buttonStyle}
          disabled={loading || !formData.openclaw_project_id.trim()}
        >
          {loading ? t('保存中...', 'Saving...') : t('保存OpenClaw属性', 'Save OpenClaw Attributes')}
        </button>
      )}
    </div>
  );
};

export default OpenClawForm;

// 注册插件组件
if (typeof window !== 'undefined' && (window as any).registerPluginComponent) {
  (window as any).registerPluginComponent('knowflow_openclaw', OpenClawForm);
}
