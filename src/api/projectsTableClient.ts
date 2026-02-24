/**
 * Projects Table API 客户端
 * 专门用于与 Projects Teable 表通信
 */
import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 创建 Projects 表专用 axios 实例
const projectsTableClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Projects Table Token
projectsTableClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 使用 Projects 表专用的 Token
    const projectsToken = import.meta.env.VITE_PROJECTS_TOKEN;

    if (projectsToken && config.headers) {
      config.headers.Authorization = `Bearer ${projectsToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[Projects Table Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
projectsTableClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('[Projects Table Response Error]', error);

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          console.error('Projects Table API 认证失败，请检查 Token');
          break;
        case 403:
          console.error('Projects Table API 权限不足');
          break;
        case 404:
          console.error('Projects Table API 资源不存在');
          break;
        case 500:
          console.error('Projects Table API 服务器错误');
          break;
      }
    } else if (error.request) {
      console.error('Projects Table API 网络连接失败');
    }

    return Promise.reject(error);
  }
);

export default projectsTableClient;
