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
      console.error('加载OpenClaw属性失败:', error);
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
        alert('OpenClaw属性保存成功');
      } else {
        const error = await response.json();
        alert(`保存失败: ${error.detail}`);
      }
    } catch (error) {
      console.error('保存OpenClaw属性失败:', error);
      alert('保存失败，请重试');
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
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>OpenClaw 桥接属性</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>项目ID <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          value={formData.openclaw_project_id}
          onChange={(e) => handleChange('openclaw_project_id', e.target.value)}
          placeholder="请输入项目唯一ID"
          style={inputStyle}
          disabled={readOnly}
          required
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>归档类型</label>
        <select
          value={formData.openclaw_archive_type}
          onChange={(e) => handleChange('openclaw_archive_type', e.target.value)}
          style={selectStyle}
          disabled={readOnly}
        >
          <option value="requirement">需求文档</option>
          <option value="code">代码</option>
          <option value="test">测试用例</option>
          <option value="document">普通文档</option>
          <option value="flow_record">流程记录</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>折叠层级</label>
        <select
          value={formData.openclaw_fold_level}
          onChange={(e) => handleChange('openclaw_fold_level', parseInt(e.target.value))}
          style={selectStyle}
          disabled={readOnly}
        >
          <option value={1}>1 - 顶层摘要</option>
          <option value={2}>2 - 中层内容</option>
          <option value={3}>3 - 完整内容</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>生成者</label>
        <input
          type="text"
          value={formData.openclaw_agent_source}
          onChange={(e) => handleChange('openclaw_agent_source', e.target.value)}
          placeholder="编码Agent / 调试Agent / AutoFlow"
          style={inputStyle}
          disabled={readOnly}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>摘要</label>
        <textarea
          value={formData.openclaw_summary}
          onChange={(e) => handleChange('openclaw_summary', e.target.value)}
          placeholder="一句话摘要，AI只读摘要不读全文"
          style={textareaStyle}
          disabled={readOnly}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>流程ID</label>
        <input
          type="text"
          value={formData.openclaw_flow_id}
          onChange={(e) => handleChange('openclaw_flow_id', e.target.value)}
          placeholder="AutoFlow流程ID（可选）"
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
          {loading ? '保存中...' : '保存OpenClaw属性'}
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
