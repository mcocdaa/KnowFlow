import { theme, Typography } from 'antd';

interface JsonBlockProps {
  value: unknown;
}

const JsonBlock = ({ value }: JsonBlockProps) => {
  const { token } = theme.useToken();

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
        {JSON.stringify(value, null, 2)}
      </pre>
    </Typography.Paragraph>
  );
};

export default JsonBlock;
