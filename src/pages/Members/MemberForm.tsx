import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/store/authStore';
import { getUserById, createUser, updateUser } from '@/api/user';
import type { User, Role } from '@/types';
import './MemberForm.css';

const { Option } = Select;

const MemberForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!id;
  const canManage = isEdit
    ? hasPermission('user', 'update')
    : hasPermission('user', 'create');

  useEffect(() => {
    if (isEdit && id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const user = await getUserById(id);
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
      });
    } catch (error: any) {
      message.error(error.message || '加载失败');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        // 更新用户（不包含密码）
        await updateUser(id, {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          department: values.department,
          phone: values.phone,
          status: values.status,
        });
        message.success('更新成功');
      } else {
        // 创建用户
        await createUser({
          username: values.username,
          password: values.password,
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          department: values.department,
          phone: values.phone,
          status: values.status || 'active',
        });
        message.success('创建成功');
      }
      navigate('/members');
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManage) {
    return (
      <div className="member-form">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              您没有权限访问此页面
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="member-form">
      <div className="page-header">
        <h1 className="page-title">
          {isEdit ? t('member.editMember') : t('member.createMember')}
        </h1>
      </div>

      <Card bordered={false} loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label={t('user.username')}
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              disabled={isEdit}
              maxLength={50}
            />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              label={t('user.password')}
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                placeholder="请输入密码"
                maxLength={100}
              />
            </Form.Item>
          )}

          <Form.Item
            label={t('user.fullName')}
            name="fullName"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" maxLength={50} />
          </Form.Item>

          <Form.Item
            label={t('user.email')}
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" maxLength={100} />
          </Form.Item>

          <Form.Item
            label={t('user.role')}
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">{t('user.role_admin')}</Option>
              <Option value="project_manager">{t('user.role_project_manager')}</Option>
              <Option value="developer">{t('user.role_developer')}</Option>
              <Option value="user">{t('user.role_user')}</Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('user.department')} name="department">
            <Input placeholder="请输入部门" maxLength={50} />
          </Form.Item>

          <Form.Item
            label={t('user.phone')}
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input placeholder="请输入手机号码" maxLength={11} />
          </Form.Item>

          <Form.Item
            label={t('user.status')}
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="active"
          >
            <Select placeholder="请选择状态">
              <Option value="active">{t('user.status_active')}</Option>
              <Option value="inactive">{t('user.status_inactive')}</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {t('common.submit')}
              </Button>
              <Button onClick={() => navigate('/members')}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MemberForm;
