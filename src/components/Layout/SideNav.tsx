import { useState } from 'react';
import { Layout } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/store/authStore';
import './SideNav.css';

const { Sider } = Layout;

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const SideNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermission();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: NavItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('nav.dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: t('nav.projects'),
      onClick: () => navigate('/projects'),
    },
    ...(hasPermission('user', 'read') ? [{
      key: '/members',
      icon: <TeamOutlined />,
      label: t('nav.members'),
      onClick: () => navigate('/members'),
    }] : []),
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/projects')) return '/projects';
    if (path.startsWith('/members')) return '/members';
    if (path.startsWith('/settings')) return '/settings';
    return '/dashboard';
  };

  const selectedKey = getSelectedKey();

  return (
    <Sider
      width={200}
      collapsedWidth={72}
      collapsed={collapsed}
      trigger={null}
      className={`side-nav ${collapsed ? 'side-nav-collapsed' : ''}`}
    >
      {/* Logo */}
      <div className="sider-logo">
        <div className="sider-logo-icon">P</div>
        {!collapsed && <span className="sider-logo-text">项目管理</span>}
      </div>

      {/* 自定义菜单 */}
      <nav className="sider-menu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`sider-menu-item ${selectedKey === item.key ? 'sider-menu-item-selected' : ''}`}
            onClick={item.onClick}
          >
            <span className="sider-menu-icon">{item.icon}</span>
            {!collapsed && <span className="sider-menu-label">{item.label}</span>}
          </div>
        ))}
      </nav>

      {/* 折叠按钮 */}
      <div
        className="sider-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <RightOutlined /> : <LeftOutlined />}
      </div>
    </Sider>
  );
};

export default SideNav;
