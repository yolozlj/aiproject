import { useState } from 'react';

const SimpleApiTest = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('正在请求...');

    try {
      const response = await fetch(
        'https://yach-teable.zhiyinlou.com/api/table/tblslYJz0kmyXI7tqc3/record?fieldKeyType=name&take=3',
        {
          headers: {
            'Authorization': 'Bearer teable_acchiUHrNoh6oJb91hq_937Bj7yM8iAvl3FYFmghbYriE5b+Hh+/G/8Zmc4YwiA='
          }
        }
      );

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult('错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 API 测试页面（简化版）</h1>

      <div style={{ marginBottom: '20px', padding: '20px', background: '#e6f7ff', borderRadius: '8px' }}>
        <p><strong>状态:</strong> {loading ? '加载中...' : '就绪'}</p>
        <p><strong>API:</strong> https://yach-teable.zhiyinlou.com/api</p>
        <p><strong>Table ID:</strong> tblslYJz0kmyXI7tqc3</p>
      </div>

      <button
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '请求中...' : '测试 API 接口'}
      </button>

      {result && (
        <div style={{
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <h3>响应结果:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {result}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#fff7e6', borderRadius: '8px' }}>
        <h3>💡 提示</h3>
        <p>如果看到这个页面，说明路由配置正常。</p>
        <p>点击上面的按钮测试 API 接口是否能正常调用。</p>
      </div>
    </div>
  );
};

export default SimpleApiTest;
