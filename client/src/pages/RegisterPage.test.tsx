import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import RegisterPage from './RegisterPage'

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

describe('RegisterPage', () => {
  it('展示第四批注册入口文案与跳转链接', () => {
    authStoreState.isLoading = false
    authStoreState.error = null

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: '为孩子开启第一本专属童话' })).toBeInTheDocument()
    expect(screen.getByLabelText('昵称')).toBeInTheDocument()
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '立即登录' })).toHaveAttribute('href', '/login')
  })
})
