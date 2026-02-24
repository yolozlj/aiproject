import { useState } from 'react';
import { Button, Card, Divider, message, Spin, Table, Input, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  getUserList,
  getUserById,
  searchUsers,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
} from '@/api/user';
import type { User, UserSimple } from '@/types/user';

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [searchResult, setSearchResult] = useState<UserSimple[]>([]);
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [testUserId, setTestUserId] = useState('');
  const [testUsername, setTestUsername] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 测试1: 获取用户列表
  const testGetUserList = async () => {
    setLoading(true);
    try {
      const result = await getUserList({ page: 1, pageSize: 10 });
      setUserList(result.data);
      message.success(`成功获取 ${result.data.length} 个用户！`);
      console.log('用户列表:', result);
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试2: 根据 ID 获取用户详情
  const testGetUserById = async () => {
    if (!testUserId) {
      message.warning('请先输入用户 ID');
      return;
    }
    setLoading(true);
    try {
      const user = await getUserById(testUserId);
      setUserDetail(user);
      message.success('成功获取用户详情！');
      console.log('用户详情:', user);
    } catch (error) {
      message.error('获取用户详情失败');
      console.error('错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试3: 搜索用户
  const testSearchUsers = async () => {
    if (!searchKeyword) {
      message.warning('请先输入搜索关键词');
      return;
    }
    setLoading(true);
    try {
      const result = await searchUsers(searchKeyword, 5);
      setSearchResult(result);
      message.success(`搜索到 ${result.length} 个用户！`);
      console.log('搜索结果:', result);
    } catch (error) {
      message.error('搜索用户失败');
      console.error('错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试4: 根据用户名查找用户
  const testGetUserByUsername = async () => {
    if (!testUsername) {
      message.warning('请先输入用户名');
      return;
    }
    setLoading(true);
    try {
      const user = await getUserByUsername(testUsername);
      if (user) {
        setUserDetail(user);
        message.success('找到用户！');
        console.log('用户:', user);
      } else {
        message.info('用户不存在');
        setUserDetail(null);
      }
    } catch (error) {
      message.error('查找用户失败');
      console.error('错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试5: 带筛选的用户列表
  const testGetUserListWithFilter = async () => {
    setLoading(true);
    try {
      const result = await getUserList({
        page: 1,
        pageSize: 10,
        keyword: 'admin',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUserList(result.data);
      message.success(`成功获取筛选后的 ${result.data.length} 个用户！`);
      console.log('筛选后的用户列表:', result);
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '全名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const searchColumns: ColumnsType<UserSimple> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true,
    },
    {
      title: '全名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Users API 测试页面</h1>
      <p>测试 Teable API 接入情况</p>

      <Spin spinning={loading}>
        {/* 测试1: 获取用户列表 */}
        <Card title="测试 1: 获取用户列表" style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" onClick={testGetUserList}>
              获取用户列表（前 10 条）
            </Button>
            <Button onClick={testGetUserListWithFilter}>
              获取筛选后的用户列表（包含 "admin"）
            </Button>
          </Space>
          {userList.length > 0 && (
            <>
              <Divider />
              <Table
                dataSource={userList}
                columns={userColumns}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            </>
          )}
        </Card>

        {/* 测试2: 根据 ID 获取用户详情 */}
        <Card title="测试 2: 根据 ID 获取用户详情" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="输入用户 ID (rec_xxx 或字段 id)"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={testGetUserById}>
              获取用户详情
            </Button>
          </Space>
          <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            提示: 可以从上面的用户列表中复制 ID
          </div>
        </Card>

        {/* 测试3: 搜索用户 */}
        <Card title="测试 3: 搜索用户" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="输入搜索关键词"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={testSearchUsers}>
              搜索用户（最多 5 条）
            </Button>
          </Space>
          {searchResult.length > 0 && (
            <>
              <Divider />
              <Table
                dataSource={searchResult}
                columns={searchColumns}
                rowKey="id"
                pagination={false}
              />
            </>
          )}
        </Card>

        {/* 测试4: 根据用户名查找 */}
        <Card title="测试 4: 根据用户名查找" style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="输入用户名"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={testGetUserByUsername}>
              查找用户
            </Button>
          </Space>
        </Card>

        {/* 用户详情显示 */}
        {userDetail && (
          <Card title="用户详情" style={{ marginBottom: 16 }}>
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
              {JSON.stringify(userDetail, null, 2)}
            </pre>
          </Card>
        )}

        {/* API 信息 */}
        <Card title="API 配置信息">
          <p>
            <strong>Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}
          </p>
          <p>
            <strong>Users Table ID:</strong> {import.meta.env.VITE_USERS_TABLE_ID}
          </p>
          <p>
            <strong>Mock 模式:</strong> {import.meta.env.VITE_USE_MOCK}
          </p>
        </Card>
      </Spin>
    </div>
  );
};

export default ApiTest;
