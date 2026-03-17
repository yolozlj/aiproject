import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, TeamOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createUser } from '@/api/user';
import { getUserByUsername, getUserByEmail } from '@/api/user';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 检查用户名唯一性
      const existingUser = await getUserByUsername(values.username);
      if (existingUser) {
        form.setFields([{ name: 'username', errors: [t('auth.usernameExists')] }]);
        return;
      }

      // 检查邮箱唯一性
      const existingEmail = await getUserByEmail(values.email);
      if (existingEmail) {
        form.setFields([{ name: 'email', errors: [t('auth.emailExists')] }]);
        return;
      }

      // 创建外部角色用户，状态为 inactive（待审批）
      await createUser({
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        department: values.department,
        role: 'external',
        status: 'inactive',
      });

      message.success(t('auth.registerSuccess'));
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || '注册失败，请稍后重试');
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

      {/* 注册卡片 */}
      <Card className="login-card" bordered={false} style={{ maxWidth: 520 }}>
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 48 48" className="logo-icon">
              <rect x="8" y="8" width="32" height="32" rx="4" className="logo-rect" />
              <path d="M 16 24 L 22 30 L 32 18" className="logo-check" />
            </svg>
          </div>
          <h1 className="login-title" style={{ fontSize: 28 }}>{t('auth.registerTitle')}</h1>
          <p className="login-subtitle">Project Management System</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            name="username"
            label={t('user.username')}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 50, message: '用户名最多50个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="请输入用户名"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('user.password')}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="请输入密码"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="请再次输入密码"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label={t('user.fullName')}
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input
              prefix={<IdcardOutlined className="input-icon" />}
              placeholder="请输入姓名"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('user.email')}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="input-icon" />}
              placeholder="请输入邮箱"
              className="login-input"
            />
          </Form.Item>

          <Form.Item name="phone" label={t('user.phone')}>
            <Input
              prefix={<PhoneOutlined className="input-icon" />}
              placeholder="请输入手机号码（可选）"
              className="login-input"
            />
          </Form.Item>

          <Form.Item name="department" label={t('user.department')}>
            <Input
              prefix={<TeamOutlined className="input-icon" />}
              placeholder="请输入部门（可选）"
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
              {loading ? '提交中...' : t('auth.register')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: 'var(--color-accent, #64748b)', fontSize: 14 }}>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
