import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * 注册页 - 新用户注册入口
 * 使用 useAuthStore 管理注册流程，成功后跳转到 /dashboard
 */
const RegisterPage = () => {
  /** 姓名表单状态 */
  const [name, setName] = useState('')
  /** 邮箱表单状态 */
  const [email, setEmail] = useState('')
  /** 密码表单状态 */
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()

  /**
   * 处理注册表单提交
   * 调用注册 API，成功后跳转到 dashboard 页面
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // 清除上次的错误信息
    clearError()

    try {
      await register(email, password, name)
      // 注册成功，跳转到仪表盘
      navigate('/dashboard')
    } catch {
      // 错误已由 store 处理，无需额外操作
    }
  }

  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="story-card p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-800 text-center mb-6">注册</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 昵称输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              className="input-field"
              placeholder="请输入昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

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
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </p>
          )}

          {/* 注册按钮 */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          已有账号？
          <Link to="/login" className="text-amber-600 hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
