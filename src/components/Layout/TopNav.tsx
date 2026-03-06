import { useState } from 'react';
import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import './TopNav.css';

const { Header } = Layout;

export const TopNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'changePassword',
      icon: <LockOutlined />,
      label: t('nav.changePassword'),
      onClick: () => setChangePasswordOpen(true),
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
      <div className="logo" />
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
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Header>
  );
};

export default TopNav;
