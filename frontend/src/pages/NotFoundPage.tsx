import { Button, Result } from 'antd';
import { Link } from 'react-router';
import { useI18n } from '../i18n';

const NotFoundPage = () => {
  const { t } = useI18n();
  return (
    <Result
      status="404"
      title="404"
      subTitle={t('页面不存在', 'Page Not Found')}
      extra={
        <Link to="/library">
          <Button type="primary">{t('回到知识库', 'Back to Library')}</Button>
        </Link>
      }
    />
  );
};

export default NotFoundPage;
