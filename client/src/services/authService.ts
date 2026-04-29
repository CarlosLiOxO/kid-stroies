import api from './api'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types'

/**
 * 认证服务 - 处理登录、注册和用户信息相关 API 调用
 * 后端统一返回 ApiResponse<T> 格式：{ success: boolean, data: T, message: string }
 * 需要解包 response.data.data 获取实际业务数据
 */
const authService = {
  /**
   * 用户登录
   * @param data - 登录请求体（邮箱、密码）
   * @returns 认证响应（用户信息 + JWT token）
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return response.data.data
  },

  /**
   * 用户注册
   * @param data - 注册请求体（邮箱、密码、昵称）
   * @returns 认证响应（用户信息 + JWT token）
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  /**
   * 获取当前登录用户信息
   * @returns 用户信息
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  },
}

export default authService
