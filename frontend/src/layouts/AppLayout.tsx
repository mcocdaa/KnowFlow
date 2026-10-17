import { Button, Layout, theme } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router';
import BrandLogo from '../components/common/BrandLogo';
import SideNav from '../components/layout/SideNav';
import { useI18n } from '../i18n';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const { token } = theme.useToken();
  const { locale, toggleLocale } = useI18n();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          height: 54,
          lineHeight: '54px',
          paddingInline: 20,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BrandLogo />
          <span style={{ fontSize: 18, fontWeight: 600, color: token.colorTextHeading }}>KnowFlow</span>
        </div>
        <Button
          size="small"
          icon={<GlobalOutlined />}
          data-testid="lang-toggle-btn"
          data-action="toggle-locale"
          aria-label={locale === 'zh' ? '切换到英文 (Switch to English)' : 'Switch to Chinese (切换到中文)'}
          title={locale === 'zh' ? '切换到英文 (English)' : 'Switch to Chinese (中文)'}
          onClick={toggleLocale}
          style={{
            whiteSpace: 'nowrap',
            flexShrink: 0,
            fontWeight: 500,
            borderRadius: 6,
          }}
        >
          {locale === 'zh' ? '中文 / EN' : '中文'}
        </Button>
      </Header>
      <Layout>
        <Sider theme="light" width={156} breakpoint="md" collapsedWidth={0}>
          <SideNav />
        </Sider>
        <Content style={{ padding: '12px 14px', minWidth: 0, overflowX: 'hidden' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
