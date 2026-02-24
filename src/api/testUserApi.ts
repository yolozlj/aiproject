/**
 * 测试 Users API 接口
 * 运行此文件以验证 Teable API 是否正常工作
 */
import { getUserList, getUserById, searchUsers, getUserByUsername } from './user';

async function testUserApi() {
  console.log('=== 开始测试 Users API ===\n');

  try {
    // 测试 1: 获取用户列表
    console.log('测试 1: 获取用户列表');
    const userList = await getUserList({ page: 1, pageSize: 10 });
    console.log(`✓ 成功获取 ${userList.data.length} 个用户`);
    console.log('第一个用户:', userList.data[0]);
    console.log();

    // 测试 2: 根据 ID 获取用户详情（使用第一个用户的 ID）
    if (userList.data.length > 0) {
      const firstUserId = userList.data[0].id;
      console.log('测试 2: 获取用户详情');
      console.log('用户 ID:', firstUserId);
      const userDetail = await getUserById(firstUserId);
      console.log('✓ 成功获取用户详情:', userDetail);
      console.log();
    }

    // 测试 3: 搜索用户
    console.log('测试 3: 搜索用户 (搜索关键词: "admin")');
    const searchResult = await searchUsers('admin', 5);
    console.log(`✓ 搜索到 ${searchResult.length} 个用户`);
    console.log('搜索结果:', searchResult);
    console.log();

    // 测试 4: 根据用户名查找用户
    if (userList.data.length > 0) {
      const username = userList.data[0].username;
      console.log('测试 4: 根据用户名查找用户');
      console.log('用户名:', username);
      const user = await getUserByUsername(username);
      console.log('✓ 找到用户:', user);
      console.log();
    }

    console.log('=== 所有测试通过! ===');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 如果直接运行此文件，则执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testUserApi();
}

export { testUserApi };
