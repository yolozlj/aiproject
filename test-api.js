/**
 * 直接测试 Teable Users API
 * 运行: node test-api.js
 */

const API_BASE_URL = 'https://yach-teable.zhiyinlou.com/api';
const TABLE_ID = 'tblslYJz0kmyXI7tqc3';
const TOKEN = 'teable_acchiUHrNoh6oJb91hq_937Bj7yM8iAvl3FYFmghbYriE5b+Hh+/G/8Zmc4YwiA=';

async function testAPI() {
  console.log('=== 开始测试 Teable Users API ===\n');

  try {
    // 测试 1: 获取用户列表
    console.log('📋 测试 1: 获取用户列表 (前 10 条)');
    const response1 = await fetch(
      `${API_BASE_URL}/table/${TABLE_ID}/record?fieldKeyType=name&take=10`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      }
    );

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }

    const data1 = await response1.json();
    console.log(`✅ 成功! 获取到 ${data1.records?.length || 0} 个用户`);

    if (data1.records && data1.records.length > 0) {
      console.log('\n第一个用户的数据:');
      console.log(JSON.stringify(data1.records[0], null, 2));

      // 保存第一个用户的 ID 供后续测试使用
      const firstUserId = data1.records[0].id;
      const firstUsername = data1.records[0].fields.username;

      // 测试 2: 根据 ID 获取用户详情
      console.log(`\n📋 测试 2: 获取用户详情 (ID: ${firstUserId})`);
      const response2 = await fetch(
        `${API_BASE_URL}/table/${TABLE_ID}/record/${firstUserId}?fieldKeyType=name`,
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
          },
        }
      );

      if (!response2.ok) {
        throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
      }

      const data2 = await response2.json();
      console.log('✅ 成功! 用户详情:');
      console.log(JSON.stringify(data2, null, 2));

      // 测试 3: 搜索用户
      console.log('\n📋 测试 3: 搜索用户 (关键词: "admin")');
      const response3 = await fetch(
        `${API_BASE_URL}/table/${TABLE_ID}/record?fieldKeyType=name&search=admin&take=5`,
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
          },
        }
      );

      if (!response3.ok) {
        throw new Error(`HTTP ${response3.status}: ${response3.statusText}`);
      }

      const data3 = await response3.json();
      console.log(`✅ 成功! 搜索到 ${data3.records?.length || 0} 个用户`);
      if (data3.records && data3.records.length > 0) {
        console.log('搜索结果 (仅显示 ID 和用户名):');
        data3.records.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.fields.username || 'N/A'} (${record.id})`);
        });
      }

      // 测试 4: 根据用户名查找用户
      if (firstUsername) {
        console.log(`\n📋 测试 4: 根据用户名查找用户 (用户名: "${firstUsername}")`);

        const filter = {
          conjunction: 'and',
          filterSet: [
            {
              fieldId: 'fld7WopPaB3uHDdCzfI', // username field ID
              operator: 'is',
              value: firstUsername,
            },
          ],
        };

        const url = new URL(`${API_BASE_URL}/table/${TABLE_ID}/record`);
        url.searchParams.append('fieldKeyType', 'name');
        url.searchParams.append('take', '1');
        url.searchParams.append('filter', JSON.stringify(filter));

        const response4 = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
          },
        });

        if (!response4.ok) {
          throw new Error(`HTTP ${response4.status}: ${response4.statusText}`);
        }

        const data4 = await response4.json();
        if (data4.records && data4.records.length > 0) {
          console.log('✅ 成功! 找到用户:');
          console.log(`  用户名: ${data4.records[0].fields.username}`);
          console.log(`  邮箱: ${data4.records[0].fields.email || 'N/A'}`);
          console.log(`  角色: ${data4.records[0].fields.role || 'N/A'}`);
        } else {
          console.log('⚠️  未找到用户');
        }
      }

      // 测试 5: 带复杂筛选的查询
      console.log('\n📋 测试 5: 复杂筛选查询 (包含 "admin" 的用户名或全名)');

      const complexFilter = {
        conjunction: 'or',
        filterSet: [
          { fieldId: 'fld7WopPaB3uHDdCzfI', operator: 'contains', value: 'admin' },
          { fieldId: 'fldUA8av97AJkHJbxoP', operator: 'contains', value: 'admin' },
        ],
      };

      const url5 = new URL(`${API_BASE_URL}/table/${TABLE_ID}/record`);
      url5.searchParams.append('fieldKeyType', 'name');
      url5.searchParams.append('take', '10');
      url5.searchParams.append('filter', JSON.stringify(complexFilter));

      const response5 = await fetch(url5.toString(), {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      });

      if (!response5.ok) {
        throw new Error(`HTTP ${response5.status}: ${response5.statusText}`);
      }

      const data5 = await response5.json();
      console.log(`✅ 成功! 筛选到 ${data5.records?.length || 0} 个用户`);
      if (data5.records && data5.records.length > 0) {
        console.log('筛选结果:');
        data5.records.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.fields.username || 'N/A'} - ${record.fields.full_name || 'N/A'}`);
        });
      }

    } else {
      console.log('⚠️  数据库中没有用户数据');
    }

    console.log('\n=== ✅ 所有测试通过! ===');
    console.log('\n📊 测试总结:');
    console.log('  ✓ 基础查询 (获取用户列表)');
    console.log('  ✓ 单条记录查询 (根据 ID 获取详情)');
    console.log('  ✓ 全文搜索');
    console.log('  ✓ 精确筛选 (根据字段值)');
    console.log('  ✓ 复杂筛选 (多条件组合)');

  } catch (error) {
    console.error('\n❌ 测试失败!');
    console.error('错误信息:', error.message);

    if (error.cause) {
      console.error('详细错误:', error.cause);
    }

    console.log('\n请检查:');
    console.log('  1. API Base URL 是否正确');
    console.log('  2. Table ID 是否正确');
    console.log('  3. Token 是否有效');
    console.log('  4. 网络连接是否正常');
  }
}

// 运行测试
testAPI();
