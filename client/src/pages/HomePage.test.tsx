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

    expect(screen.getByText('把今天的小情绪，编成今晚的睡前童话')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '开始编故事' })).toHaveAttribute('href', '/create-story')
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

    expect(screen.getByRole('link', { name: /^浏览故事库$/ })).toHaveAttribute('href', '/stories')
    expect(screen.getByText('创建故事').closest('a')).toHaveAttribute('href', '/create-story')
    expect(screen.getByText('社区分享').closest('a')).toHaveAttribute('href', '/community')
  })
})
