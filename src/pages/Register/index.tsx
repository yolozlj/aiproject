import { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Descriptions, Alert } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createUser, getUserByEmail } from '@/api/user';
import type { SSOUser } from '@/api/auth';

const { Option } = Select;
const { TextArea } = Input;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // 从路由 state 中获取 SSO 用户信息
  const ssoUser = (location.state as { ssoUser?: SSOUser })?.ssoUser;

  // 未经 SSO 验证直接访问此页面，重定向到登录
  if (!ssoUser) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="login-bg-circle circle-1"></div>
          <div className="login-bg-circle circle-2"></div>
          <div className="login-bg-circle circle-3"></div>
        </div>
        <Card className="login-card" bordered={false}>
          <Alert
            type="warning"
            message="请先通过公司账号登录"
            description="访问权限申请需要先完成 SSO 身份验证。"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Link to="/login">
            <Button type="primary" block>返回登录</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 检查是否已有申请（避免重复提交）
      const existing = await getUserByEmail(ssoUser.email);
      if (existing) {
        message.warning('您已有访问申请记录，请等待管理员审批或联系管理员处理。');
        navigate('/login');
        return;
      }

      // 创建待审批用户记录
      const username = ssoUser.account || ssoUser.workcode || ssoUser.email.split('@')[0];
      await createUser({
        username,
        fullName: ssoUser.name,
        email: ssoUser.email,
        workcode: ssoUser.workcode,
        role: values.role,
        status: 'inactive',
      });

      message.success('申请已提交，请等待管理员审批后再登录。');
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || '提交申请失败，请稍后重试');
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

      {/* 申请卡片 */}
      <Card className="login-card" bordered={false} style={{ maxWidth: 520 }}>
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 48 48" className="logo-icon">
              <rect x="8" y="8" width="32" height="32" rx="4" className="logo-rect" />
              <path d="M 16 24 L 22 30 L 32 18" className="logo-check" />
            </svg>
          </div>
          <h1 className="login-title" style={{ fontSize: 26 }}>申请访问权限</h1>
          <p className="login-subtitle">Access Permission Request</p>
        </div>

        {/* SSO 身份信息（只读展示） */}
        <Descriptions
          bordered
          size="small"
          column={1}
          style={{ marginBottom: 24 }}
          title={<span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>已验证的公司身份</span>}
        >
          <Descriptions.Item label="姓名">{ssoUser.name}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{ssoUser.email}</Descriptions.Item>
          {ssoUser.workcode && (
            <Descriptions.Item label="工号">{ssoUser.workcode}</Descriptions.Item>
          )}
          {ssoUser.account && (
            <Descriptions.Item label="账号">{ssoUser.account}</Descriptions.Item>
          )}
        </Descriptions>

        <Form
          form={form}
          name="access-request"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            name="role"
            label="申请角色"
            rules={[{ required: true, message: '请选择申请的角色' }]}
            initialValue="external"
          >
            <Select placeholder="请选择申请的角色">
              <Option value="project_manager">项目经理</Option>
              <Option value="developer">开发人员</Option>
              <Option value="user">普通用户</Option>
              <Option value="external">外部用户</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="申请理由"
            rules={[{ required: true, message: '请填写申请理由' }]}
          >
            <TextArea
              placeholder="请说明申请访问此系统的原因及使用场景…"
              rows={3}
              maxLength={500}
              showCount
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
              {loading ? '提交中…' : '提交申请'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/login" style={{ color: 'var(--color-accent, #64748b)', fontSize: 13 }}>
            返回登录
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
