import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'

describe('AppLayout', () => {
  it('认证页进入轻壳层，隐藏主导航与功能型页脚', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/login" element={<div>登录内容</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('登录内容')).toBeInTheDocument()
    expect(screen.queryByText('快速链接')).not.toBeInTheDocument()
    expect(screen.queryByText('仪表盘')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回首页' })).toHaveAttribute('href', '/')
  })

  it('普通页面保留完整导航与页脚', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<div>仪表盘内容</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('仪表盘内容')).toBeInTheDocument()
    expect(screen.getByText('快速链接')).toBeInTheDocument()
    expect(screen.getAllByText('仪表盘').length).toBeGreaterThan(0)
    expect(screen.getAllByText('儿童端').length).toBeGreaterThan(0)
  })
})
