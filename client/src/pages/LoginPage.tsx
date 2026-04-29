import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * 登录页 - 用户登录入口
 * 使用 useAuthStore 管理登录流程，成功后跳转到 /dashboard
 */
const LoginPage = () => {
  /** 邮箱表单状态 */
  const [email, setEmail] = useState('')
  /** 密码表单状态 */
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  /**
   * 处理登录表单提交
   * 调用登录 API，成功后跳转到 dashboard 页面
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // 清除上次的错误信息
    clearError()

    try {
      await login(email, password)
      // 登录成功，跳转到仪表盘
      navigate('/dashboard')
    } catch {
      // 错误已由 store 处理，无需额外操作
    }
  }

  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="story-card p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-800 text-center mb-6">登录</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              className="input-field"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              className="input-field"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </p>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          还没有账号？
          <Link to="/register" className="text-amber-600 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
