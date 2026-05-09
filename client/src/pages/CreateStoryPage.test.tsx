import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { Child, Story } from '../types'
import CreateStoryPage from './CreateStoryPage'

const mockRefreshProfile = vi.fn()
const mockFetchChildren = vi.fn()
const mockSetCurrentChild = vi.fn()
const mockAddStory = vi.fn()
const mockClearError = vi.fn()

let mockChildren: Child[] = []
let mockCurrentChild: Child | null = null
let mockIsLoading = false
let mockError: string | null = null

vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector: (state: { refreshProfile: typeof mockRefreshProfile }) => unknown) =>
    selector({
      refreshProfile: mockRefreshProfile,
    }),
}))

vi.mock('../stores/childStore', () => ({
  useChildStore: (
    selector: (state: {
      children: Child[]
      currentChild: Child | null
      fetchChildren: typeof mockFetchChildren
      setCurrentChild: typeof mockSetCurrentChild
    }) => unknown
  ) =>
    selector({
      children: mockChildren,
      currentChild: mockCurrentChild,
      fetchChildren: mockFetchChildren,
      setCurrentChild: mockSetCurrentChild,
    }),
}))

vi.mock('../stores/storyStore', () => ({
  useStoryStore: (
    selector: (state: {
      addStory: typeof mockAddStory
      isLoading: boolean
      error: string | null
      clearError: typeof mockClearError
    }) => unknown
  ) =>
    selector({
      addStory: mockAddStory,
      isLoading: mockIsLoading,
      error: mockError,
      clearError: mockClearError,
    }),
}))

describe('CreateStoryPage', () => {
  beforeEach(() => {
    mockChildren = []
    mockCurrentChild = null
    mockIsLoading = false
    mockError = null
    mockFetchChildren.mockResolvedValue(undefined)
    mockSetCurrentChild.mockReset()
    mockAddStory.mockReset()
    mockClearError.mockReset()
    mockRefreshProfile.mockReset()
  })

  it('没有孩子档案时提示先添加孩子档案', async () => {
    renderPage()

    await waitFor(() => expect(mockFetchChildren).toHaveBeenCalled())

    expect(screen.getByText('请先添加孩子档案')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '去添加孩子档案' })).toHaveAttribute('href', '/children')
    expect(screen.queryByLabelText('采访输入框')).not.toBeInTheDocument()
  })

  it('采访完成并确认后调用 addStory', async () => {
    const user = userEvent.setup()
    const child = createChild()
    mockChildren = [child]
    mockAddStory.mockResolvedValue(createStory())
    mockRefreshProfile.mockResolvedValue(undefined)

    renderPage()

    await screen.findByText(/今晚.*小米.*慢慢聊成故事/)

    await user.type(screen.getByLabelText('采访输入框'), '今天不想刷牙')
    await user.click(screen.getByRole('button', { name: '发送回答' }))

    await screen.findByText(/今天不想刷牙.*练习什么|今天不想刷牙.*学会什么/)

    await user.type(screen.getByLabelText('采访输入框'), '建立刷牙习惯')
    await user.click(screen.getByRole('button', { name: '发送回答' }))

    await screen.findByText(/建立刷牙习惯.*哄睡|建立刷牙习惯.*小冒险|建立刷牙习惯.*柔软安静/)

    await user.click(screen.getByRole('button', { name: '睡前' }))
    await user.click(screen.getByRole('button', { name: '发送回答' }))

    await screen.findByText(/睡前.*水彩|睡前.*卡通/)

    await user.click(screen.getByRole('button', { name: '水彩' }))
    await user.click(screen.getByRole('button', { name: '发送回答' }))

    await screen.findByText('我已经把这次采访整理好啦，看看这份故事设定对不对。')
    expect(screen.getByText(/小米.*今天不想刷牙.*建立刷牙习惯.*水彩绘本/)).toBeInTheDocument()
    expect(screen.getAllByText('今天不想刷牙')).toHaveLength(2)
    expect(screen.getAllByText('建立刷牙习惯')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: '就这样生成故事' }))

    await waitFor(() =>
      expect(mockAddStory).toHaveBeenCalledWith(
        expect.objectContaining({
          childId: child.id,
          style: '睡前',
          artStyle: '水彩',
          educationalGoal: '建立刷牙习惯',
        })
      )
    )

    await waitFor(() => expect(mockRefreshProfile).toHaveBeenCalled())
    expect(screen.getByText('刷牙小骑士')).toBeInTheDocument()
  })
})

/** 渲染创建故事页 */
function renderPage() {
  return render(
    <MemoryRouter>
      <CreateStoryPage />
    </MemoryRouter>
  )
}

/** 创建测试孩子 */
function createChild(): Child {
  return {
    id: 'child-1',
    userId: 'user-1',
    name: '小米',
    age: 5,
    gender: '男',
    personality: '活泼',
    concerns: '不爱刷牙',
    tags: '["勇敢"]',
    createdAt: '2026-05-08T00:00:00.000Z',
    updatedAt: '2026-05-08T00:00:00.000Z',
  }
}

/** 创建测试故事 */
function createStory(): Story {
  return {
    id: 'story-1',
    userId: 'user-1',
    childId: 'child-1',
    title: '刷牙小骑士',
    summary: '一个关于建立刷牙习惯的温柔睡前故事。',
    style: '睡前',
    artStyle: '水彩',
    tags: null,
    ageRange: '3-5',
    theme: '今天不想刷牙',
    educationalGoal: '建立刷牙习惯',
    isPublic: false,
    createdAt: '2026-05-08T00:00:00.000Z',
    updatedAt: '2026-05-08T00:00:00.000Z',
    pages: [
      {
        page: 1,
        text: '小骑士今天不太想刷牙。',
      },
    ],
    images: [],
    previewText: '小骑士今天不太想刷牙。',
  }
}
