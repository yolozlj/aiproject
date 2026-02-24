import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '@/types';

// 创建 axios 实例
const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
client.interceptors.response.use(
  (response) => {
    // 如果返回的是标准 API 响应格式
    const data = response.data as ApiResponse;

    // 根据业务状态码判断
    if (data.code === 0 || data.code === 200) {
      return response;
    }

    // 业务错误
    const error: ApiError = {
      code: data.code,
      message: data.message || '请求失败',
      details: data.data,
    };

    return Promise.reject(error);
  },
  (error: AxiosError) => {
    // HTTP 错误处理
    const apiError: ApiError = {
      code: error.response?.status || 500,
      message: '网络错误',
    };

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Token 过期或未授权
          apiError.message = '登录已过期，请重新登录';
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          // 跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          apiError.message = '没有权限访问';
          break;
        case 404:
          apiError.message = '请求的资源不存在';
          break;
        case 500:
          apiError.message = '服务器错误';
          break;
        default:
          apiError.message = (error.response.data as any)?.message || '请求失败';
      }
    } else if (error.request) {
      apiError.message = '网络连接失败';
    }

    return Promise.reject(apiError);
  }
);

export default client;
