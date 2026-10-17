import { Menu } from 'antd';
import {
  ApiOutlined,
  BookOutlined,
  FolderOutlined,
  KeyOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { NavLink, useLocation } from 'react-router';
import { useI18n } from '../../i18n';

const SideNav = () => {
  const { pathname } = useLocation();
  const { t } = useI18n();

  const navItems = [
    { key: '/library', icon: <BookOutlined />, label: <NavLink to="/library">{t('知识库', 'Library')}</NavLink> },
    { key: '/categories', icon: <FolderOutlined />, label: <NavLink to="/categories">{t('分类管理', 'Categories')}</NavLink> },
    { key: '/keys', icon: <KeyOutlined />, label: <NavLink to="/keys">{t('Key 管理', 'Schema Keys')}</NavLink> },
    { key: '/plugins', icon: <ApiOutlined />, label: <NavLink to="/plugins">{t('插件', 'Plugins')}</NavLink> },
    { key: '/ai', icon: <RobotOutlined />, label: <NavLink to="/ai">{t('AI 助手', 'AI Assistant')}</NavLink> },
  ];

  return <Menu mode="inline" selectedKeys={[pathname]} items={navItems} style={{ borderInlineEnd: 0 }} />;
};

export default SideNav;
