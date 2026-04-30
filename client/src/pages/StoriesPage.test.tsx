import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import StoriesPage from './StoriesPage'

const childStoreState = {
  children: [
    {
      id: 'child-1',
      name: '小明',
    },
  ],
  fetchChildren: vi.fn(),
}

const storyStoreState = {
  stories: [
    {
      id: 'story-1',
      childId: 'child-1',
      title: '小明和星星船的冒险',
      content: JSON.stringify([{ page: 1, text: '这是第一页。' }]),
      summary: '一个关于勇气和刷牙习惯的冒险故事。',
      theme: '刷牙习惯',
      createdAt: '2026-04-29T00:00:00.000Z',
      isPublic: false,
      isPushed: false,
      images: JSON.stringify([]),
    },
  ],
  isLoading: false,
  error: null,
  fetchStories: vi.fn(),
  updateStory: vi.fn(),
  deleteStory: vi.fn(),
  pushStory: vi.fn(),
}

vi.mock('../stores/childStore', () => ({
  useChildStore: (selector?: (state: typeof childStoreState) => unknown) =>
    selector ? selector(childStoreState) : childStoreState,
}))

vi.mock('../stores/storyStore', () => ({
  useStoryStore: (selector?: (state: typeof storyStoreState) => unknown) =>
    selector ? selector(storyStoreState) : storyStoreState,
}))

describe('StoriesPage', () => {
  it('故事卡片内容区链接到详情页，按钮区保留独立操作', () => {
    render(
      <BrowserRouter>
        <StoriesPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('link', { name: /小明和星星船的冒险/ })).toHaveAttribute('href', '/stories/story-1')
    expect(screen.getByRole('button', { name: '公开到社区' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '推送到孩子端' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument()
  })
})
