import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import './TopNav.css';

const { Header } = Layout;

export const TopNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // 标记"刚退出登录"，让 Login 页展示退出确认而非自动跳 SSO
    localStorage.setItem('sso_logged_out', '1');
    // SSO logout 清除 cookie 后重定向回我们自己的 Login 页（而非 SSO 登录页）
    // 避免 SSO 残留持久化 cookie 导致自动重新登录
    const appLoginUrl = `${window.location.origin}/aiproject/login`;
    window.location.href = `https://sso.100tal.com/sso/logout?path=${appLoginUrl}`;
  };

  const menuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="top-nav">
      <div className="top-logo">
        <div className="top-logo-icon">P</div>
        <span className="top-logo-text">项目管理</span>
      </div>
      <div className="user-menu">
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space className="user-info">
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={user?.avatar}
            />
            <span className="username">{user?.fullName}</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TopNav;
