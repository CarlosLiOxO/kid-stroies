import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CommunityPage from './CommunityPage'

const getStoriesMock = vi.fn()
const downloadStoryMock = vi.fn()

vi.mock('../services/storyService', () => ({
  default: {
    getStories: (...args: unknown[]) => getStoriesMock(...args),
    downloadStory: (...args: unknown[]) => downloadStoryMock(...args),
  },
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector?: (state: { user: { tokens: number }; refreshProfile: () => Promise<void> }) => unknown) => {
    const state = {
      user: { tokens: 88 },
      refreshProfile: vi.fn(),
    }
    return selector ? selector(state) : state
  },
}))

describe('CommunityPage', () => {
  it('社区卡片内容区链接到详情页，下载按钮保留独立操作', async () => {
    getStoriesMock.mockResolvedValueOnce([
      {
        id: 'story-1',
        title: '小月亮和星星邮差',
        content: JSON.stringify([
          { page: 1, text: '第一页预览' },
          { page: 2, text: '第二页预览' },
        ]),
        summary: '一篇适合睡前阅读的温暖冒险故事。',
        theme: '成长主题',
        educationalGoal: '建立安全感',
        createdAt: '2026-04-29T00:00:00.000Z',
        isPublic: true,
        isPushed: false,
        images: JSON.stringify([]),
        downloadCount: 3,
        user: { id: 'user-1', name: '小月亮妈妈' },
        style: '睡前',
        artStyle: '水彩',
      },
    ])

    render(
      <BrowserRouter>
        <CommunityPage />
      </BrowserRouter>
    )

    const detailLink = await screen.findByRole('link', { name: /小月亮和星星邮差/ })
    expect(detailLink).toHaveAttribute('href', '/stories/story-1')
    expect(screen.getByRole('button', { name: '带回我的故事库（6 Token）' })).toBeInTheDocument()
  })
})
