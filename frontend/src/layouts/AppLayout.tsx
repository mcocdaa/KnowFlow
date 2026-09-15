import { Layout, theme } from 'antd';
import { Outlet } from 'react-router';
import BrandLogo from '../components/common/BrandLogo';
import SideNav from '../components/layout/SideNav';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingInline: 24,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <BrandLogo />
        <span style={{ fontSize: 18, fontWeight: 600, color: token.colorTextHeading }}>KnowFlow</span>
      </Header>
      <Layout>
        <Sider theme="light" width={220} breakpoint="lg" collapsedWidth={0}>
          <SideNav />
        </Sider>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
