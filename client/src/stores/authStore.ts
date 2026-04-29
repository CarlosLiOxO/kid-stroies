import { create } from 'zustand'
import type { User } from '../types'
import authService from '../services/authService'

/** 认证 Store 状态 */
interface AuthState {
  /** 当前登录用户 */
  user: User | null
  /** JWT token */
  token: string | null
  /** 是否处于加载状态 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null

  /** 用户登录 */
  login: (email: string, password: string) => Promise<void>
  /** 用户注册 */
  register: (email: string, password: string, name: string) => Promise<void>
  /** 退出登录 */
  logout: () => void
  /** 从 localStorage 恢复登录态 */
  restoreSession: () => void
  /** 刷新当前用户信息 */
  refreshProfile: () => Promise<void>
  /** 手动同步用户信息 */
  setUser: (user: User | null) => void
  /** 清除错误 */
  clearError: () => void
}

/**
 * 认证状态管理 store
 * 管理用户登录/注册/登出全流程
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  /**
   * 用户登录 - 调用 API 并保存 token 到 localStorage
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login({ email, password })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      set({ user: response.user, token: response.token, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 用户注册 - 调用 API 并保存 token 到 localStorage
   */
  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.register({ email, password, name })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      set({ user: response.user, token: response.token, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 退出登录 - 清除本地存储和 store 状态
   */
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  /**
   * 恢复会话 - 从 localStorage 读取之前保存的登录状态
   */
  restoreSession: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        set({ user, token })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },

  /**
   * 刷新当前用户资料
   * 从服务端获取最新用户信息并同步到本地状态
   */
  refreshProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = await authService.getProfile()
      localStorage.setItem('user', JSON.stringify(user))
      set((state) => ({
        user,
        token: state.token ?? localStorage.getItem('token'),
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '刷新用户信息失败'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 手动设置当前用户
   */
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },

  /** 清除错误信息 */
  clearError: () => set({ error: null }),
}))
