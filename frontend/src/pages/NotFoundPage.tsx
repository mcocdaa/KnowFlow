import { Button, Result } from 'antd';
import { Link } from 'react-router';

const NotFoundPage = () => (
  <Result
    status="404"
    title="404"
    subTitle="页面不存在"
    extra={
      <Link to="/library">
        <Button type="primary">回到知识库</Button>
      </Link>
    }
  />
);

export default NotFoundPage;
