import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/store/authStore';
import { getUserList, deleteUser } from '@/api/user';
import type { User, Role } from '@/types';
import dayjs from 'dayjs';
import './MemberList.css';

const { Option } = Select;

const MemberList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission, user: currentUser } = usePermission();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | undefined>();
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>();

  // 权限检查
  const canManageUsers = hasPermission('user', 'create') || hasPermission('user', 'update');

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [page, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUserList({
        page,
        pageSize,
        keyword,
        role: roleFilter,
        status: statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUsers(result.data);
      setTotal(result.total);
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setKeyword('');
    setRoleFilter(undefined);
    setStatusFilter(undefined);
    setPage(1);
    fetchUsers();
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: t('common.confirmDelete'),
      content: `确定要删除用户 "${record.fullName}" 吗？`,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success(t('common.success'));
          fetchUsers();
        } catch (error: any) {
          message.error(error.message || t('common.error'));
        }
      },
    });
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const getRoleColor = (role: Role) => {
    const colors: Record<Role, string> = {
      admin: 'red',
      project_manager: 'orange',
      developer: 'blue',
      user: 'default',
    };
    return colors[role] || 'default';
  };

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'success' : 'default';
  };

  const columns = [
    {
      title: t('user.username'),
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: t('user.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      width: 120,
    },
    {
      title: t('user.email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: t('user.role'),
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: Role) => (
        <Tag color={getRoleColor(role)}>
          {t(`user.role_${role}`)}
        </Tag>
      ),
    },
    {
      title: t('user.department'),
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: t('user.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text: string) => text || '-',
    },
    {
      title: t('user.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'active' | 'inactive') => (
        <Tag color={getStatusColor(status)}>
          {t(`user.status_${status}`)}
        </Tag>
      ),
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: User) => (
        <Space size="small">
          {hasPermission('user', 'update') && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/members/${record.id}/edit`)}
            >
              {t('common.edit')}
            </Button>
          )}
          {hasPermission('user', 'delete') && currentUser?.id !== record.id && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              {t('common.delete')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!canManageUsers) {
    return (
      <div className="member-list">
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
    <div className="member-list">
      <div className="page-header">
        <h1 className="page-title">{t('member.title')}</h1>
        {hasPermission('user', 'create') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/members/new')}
          >
            {t('member.createMember')}
          </Button>
        )}
      </div>

      <Card bordered={false} className="filter-card">
        <Space size="middle" wrap>
          <Input
            placeholder={t('common.search')}
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Select
            placeholder={t('user.role')}
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="admin">{t('user.role_admin')}</Option>
            <Option value="project_manager">{t('user.role_project_manager')}</Option>
            <Option value="developer">{t('user.role_developer')}</Option>
            <Option value="user">{t('user.role_user')}</Option>
          </Select>
          <Select
            placeholder={t('user.status')}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="active">{t('user.status_active')}</Option>
            <Option value="inactive">{t('user.status_inactive')}</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            {t('common.filter')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
      </Card>

      <Card bordered={false} style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default MemberList;
