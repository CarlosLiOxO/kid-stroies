import { useState } from 'react'
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="page-container">
      <section className="fairy-auth-stage mx-auto max-w-5xl">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="fairy-auth-hero flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="fairy-kicker">First Story</p>
              <h1 className="fairy-title text-3xl md:text-5xl">为孩子开启第一本专属童话</h1>
              <p className="fairy-subtitle">
                注册后就能创建孩子档案、生成专属故事，把每晚的陪伴变成一个温柔而稳定的故事仪式。
              </p>
            </div>
            <div className="fairy-surface-muted space-y-3 text-sm leading-7 text-[#7d6d64]">
              <p>1. 建立孩子画像，记录性格、情绪和成长关注点。</p>
              <p>2. 生成专属童话与插画，把今天的小情绪编进故事里。</p>
              <p>3. 推送到孩子端，让每晚都有一页属于自己的晚安世界。</p>
            </div>
          </div>

          <div className="fairy-auth-card p-6 sm:p-8">
            <div className="mb-5 space-y-2 text-center">
              <h2 className="fairy-section-title text-2xl md:text-3xl">现在开始</h2>
              <p className="fairy-auth-note">创建账号后，就能立刻进入故事工坊。</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* 昵称输入 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6d4c41]" htmlFor="register-name">昵称</label>
                <input
                  type="text"
                  id="register-name"
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
                <label className="mb-1 block text-sm font-medium text-[#6d4c41]" htmlFor="register-email">邮箱</label>
                <input
                  type="email"
                  id="register-email"
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
                <label className="mb-1 block text-sm font-medium text-[#6d4c41]" htmlFor="register-password">密码</label>
                <input
                  type="password"
                  id="register-password"
                  className="input-field"
                  placeholder="请输入密码（至少6位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              {error ? <p className="fairy-message-error">{error}</p> : null}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? '注册中...' : '注册'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#8f7d72]">
              已有账号？
              <Link to="/login" className="ml-1 font-semibold text-[#b7773a] hover:underline">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RegisterPage
