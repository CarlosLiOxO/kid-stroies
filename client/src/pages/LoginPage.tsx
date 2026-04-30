import { useState } from 'react'
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="page-container">
      <section className="fairy-auth-stage mx-auto max-w-xl">
        <div className="fairy-auth-card w-full p-6 sm:p-8">
          <div className="mb-6 space-y-3 text-center">
            <p className="fairy-kicker">Welcome Back</p>
            <h1 className="fairy-title text-3xl md:text-4xl">回到今晚的故事准备台</h1>
            <p className="fairy-subtitle">
              继续为孩子准备今晚的专属童话、插画和那些值得慢慢说出口的小情绪。
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 邮箱输入 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#6d4c41]" htmlFor="login-email">
                邮箱
              </label>
              <input
                type="email"
                id="login-email"
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
              <label className="mb-1 block text-sm font-medium text-[#6d4c41]" htmlFor="login-password">
                密码
              </label>
              <input
                type="password"
                id="login-password"
                className="input-field"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error ? <p className="fairy-message-error">{error}</p> : null}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-5 space-y-3 text-center">
            <p className="fairy-auth-note">欢迎回来，继续把今天的陪伴变成孩子最期待的睡前故事。</p>
            <p className="text-sm text-[#8f7d72]">
              还没有账号？
              <Link to="/register" className="ml-1 font-semibold text-[#b7773a] hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
