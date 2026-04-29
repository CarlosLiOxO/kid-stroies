import axios from 'axios'

/**
 * Axios 实例 - API 请求基础配置
 * 自动附加 JWT token，baseURL 通过环境变量配置以支持多环境部署
 */

/** 创建 axios 实例，配置基础 URL - 生产环境走环境变量，本地开发走 Vite 代理 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器 - 自动在请求头中附加 JWT token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器 - 统一处理响应错误（如 401 未授权）
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 未授权时清除本地 token 并跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
