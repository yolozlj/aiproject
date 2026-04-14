import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import './TopNav.css';

const { Header } = Layout;

const SSO_APP_ID = import.meta.env.VITE_SSO_APP_ID as string;
const SSO_LOGOUT_URL = `https://sso.100tal.com/portal/logout/${SSO_APP_ID}`;

export const TopNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // 跳转 SSO 退出端点，清除 SSO session，避免直接自动登录
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
