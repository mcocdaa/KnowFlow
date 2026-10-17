import type { ReactNode } from 'react';
import { Button, Empty, Result, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useI18n } from '../../i18n';

interface StatePlaceholderProps {
  variant: 'loading' | 'empty' | 'error';
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  children?: ReactNode;
}

const StatePlaceholder = ({ variant, title, description, onRetry, children }: StatePlaceholderProps) => {
  const { t } = useI18n();

  if (variant === 'loading') {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (variant === 'error') {
    return (
      <Result
        status="warning"
        title={title ?? t('加载失败', 'Failed to load')}
        subTitle={description}
        extra={
          onRetry ? (
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
              {t('重试', 'Retry')}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={description ?? title ?? t('暂无数据', 'No data')}
    >
      {children}
    </Empty>
  );
};

export default StatePlaceholder;
