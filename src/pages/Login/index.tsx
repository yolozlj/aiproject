import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import './Login.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 背景装饰 */}
      <div className="login-background">
        <div className="login-bg-circle circle-1"></div>
        <div className="login-bg-circle circle-2"></div>
        <div className="login-bg-circle circle-3"></div>
      </div>

      {/* 登录卡片 */}
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 48 48" className="logo-icon">
              <rect x="8" y="8" width="32" height="32" rx="4" className="logo-rect" />
              <path d="M 16 24 L 22 30 L 32 18" className="logo-check" />
            </svg>
          </div>
          <h1 className="login-title">项目管理系统</h1>
          <p className="login-subtitle">Project Management System</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.username') + '不能为空' }]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder={t('auth.username')}
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.password') + '不能为空' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder={t('auth.password')}
              className="login-input"
            />
          </Form.Item>

          <Form.Item className="login-button-wrapper">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="login-button"
            >
              {loading ? '登录中...' : t('auth.login')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
