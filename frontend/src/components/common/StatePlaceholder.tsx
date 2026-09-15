import type { ReactNode } from 'react';
import { Button, Empty, Result, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface StatePlaceholderProps {
  variant: 'loading' | 'empty' | 'error';
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  children?: ReactNode;
}

const StatePlaceholder = ({ variant, title, description, onRetry, children }: StatePlaceholderProps) => {
  if (variant === 'loading') {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (variant === 'error') {
    return (
      <Result
        status="warning"
        title={title ?? '加载失败'}
        subTitle={description}
        extra={
          onRetry ? (
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
              重试
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={description ?? title ?? '暂无数据'}
    >
      {children}
    </Empty>
  );
};

export default StatePlaceholder;
