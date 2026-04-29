import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '../stores/authStore'

describe('ProtectedRoute', () => {
  it('未登录时重定向到登录页', () => {
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<div>仪表盘内容</div>} path="/dashboard" />
          </Route>
          <Route element={<div>登录页</div>} path="/login" />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('登录页')).toBeInTheDocument()
  })
})
