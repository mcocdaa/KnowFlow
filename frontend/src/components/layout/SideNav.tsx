import { Menu } from 'antd';
import {
  ApiOutlined,
  BookOutlined,
  FolderOutlined,
  KeyOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { NavLink, useLocation } from 'react-router';

const navItems = [
  { key: '/library', icon: <BookOutlined />, label: <NavLink to="/library">知识库</NavLink> },
  { key: '/categories', icon: <FolderOutlined />, label: <NavLink to="/categories">分类管理</NavLink> },
  { key: '/keys', icon: <KeyOutlined />, label: <NavLink to="/keys">Key 管理</NavLink> },
  { key: '/plugins', icon: <ApiOutlined />, label: <NavLink to="/plugins">插件</NavLink> },
  { key: '/ai', icon: <RobotOutlined />, label: <NavLink to="/ai">AI 助手</NavLink> },
];

const SideNav = () => {
  const { pathname } = useLocation();

  return <Menu mode="inline" selectedKeys={[pathname]} items={navItems} style={{ borderInlineEnd: 0 }} />;
};

export default SideNav;
