/**
 * Teable API 客户端
 * 专门用于与 Teable 数据库通信
 */
import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 创建 Teable 专用 axios 实例
const teableClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Teable Token
teableClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 使用 Users 表的 Token
    const teableToken = import.meta.env.VITE_USERS_TOKEN;

    if (teableToken && config.headers) {
      config.headers.Authorization = `Bearer ${teableToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[Teable Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
teableClient.interceptors.response.use(
  (response) => {
    // Teable API 直接返回数据，不需要额外处理
    return response;
  },
  (error: AxiosError) => {
    console.error('[Teable Response Error]', error);

    // 错误处理
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('Teable API 认证失败，请检查 Token');
          break;
        case 403:
          console.error('Teable API 权限不足');
          break;
        case 404:
          console.error('Teable API 资源不存在');
          break;
        case 500:
          console.error('Teable API 服务器错误');
          break;
        default:
          console.error('Teable API 请求失败:', data);
      }
    } else if (error.request) {
      console.error('Teable API 网络连接失败');
    }

    return Promise.reject(error);
  }
);

export default teableClient;
