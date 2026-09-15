import { Layout } from 'antd';
import { Outlet } from 'react-router';
import BrandLogo from '../components/common/BrandLogo';
import SideNav from '../components/layout/SideNav';

const { Header, Sider, Content } = Layout;

const AppLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingInline: 24,
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <BrandLogo />
      <span style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>KnowFlow</span>
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

export default AppLayout;
