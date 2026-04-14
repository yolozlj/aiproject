import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import './TopNav.css';

const { Header } = Layout;

const SSO_APP_ID = import.meta.env.VITE_SSO_APP_ID as string;
const SSO_LOGIN_URL = `https://sso.100tal.com/portal/login/${SSO_APP_ID}`;
// 官方文档示例为不编码写法，与文档保持一致
const SSO_LOGOUT_URL = `https://sso.100tal.com/sso/logout?path=${SSO_LOGIN_URL}`;

export const TopNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // 记录退出时间戳，用于检测 SSO 残留 cookie 导致的自动重新认证
    sessionStorage.setItem('sso_logout_at', String(Date.now()));
    // 官方退出登录：先清除 SSO cookie，再跳回 SSO 登录页
    window.location.href = SSO_LOGOUT_URL;
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
