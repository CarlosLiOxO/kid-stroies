import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('展示首页核心入口文案', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByText('欢迎来到童话故事平台')).toBeInTheDocument()
    expect(screen.getByText('创建故事')).toBeInTheDocument()
    expect(screen.getByText('故事库')).toBeInTheDocument()
    expect(screen.getByText('社区分享')).toBeInTheDocument()
  })

  it('首页快捷入口跳转到对应页面', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByRole('link', { name: /创建故事/ })).toHaveAttribute('href', '/create-story')
    expect(screen.getByRole('link', { name: /故事库/ })).toHaveAttribute('href', '/stories')
    expect(screen.getByRole('link', { name: /社区分享/ })).toHaveAttribute('href', '/community')
  })
})
