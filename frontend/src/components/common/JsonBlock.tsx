import { theme, Typography } from 'antd';
import { useI18n } from '../../i18n';

interface JsonBlockProps {
  value: unknown;
}

const JsonBlock = ({ value }: JsonBlockProps) => {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const displayValue = Array.isArray(value)
    ? value.map((item) => (typeof item === 'string' ? t(item) : item))
    : value;

  return (
    <Typography.Paragraph style={{ marginBottom: 0 }}>
      <pre
        style={{
          margin: 0,
          padding: '8px 12px',
          background: token.colorFillQuaternary,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadius,
          fontSize: token.fontSizeSM,
          maxHeight: 240,
          overflow: 'auto',
        }}
      >
        {JSON.stringify(displayValue, null, 2)}
      </pre>
    </Typography.Paragraph>
  );
};

export default JsonBlock;
