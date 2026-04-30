import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from './LoginPage'

const authStoreState = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  restoreSession: vi.fn(),
  refreshProfile: vi.fn(),
  setUser: vi.fn(),
  clearError: vi.fn(),
  user: null,
  token: null,
  isLoading: false,
  error: null as string | null,
}

vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector?: (state: typeof authStoreState) => unknown) =>
    selector ? selector(authStoreState) : authStoreState,
}))

describe('LoginPage', () => {
  it('展示第四批登录入口文案与跳转链接', () => {
    authStoreState.isLoading = false
    authStoreState.error = null

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: '回到今晚的故事准备台' })).toBeInTheDocument()
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '立即注册' })).toHaveAttribute('href', '/register')
  })
})
