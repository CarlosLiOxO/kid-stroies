import { create } from 'zustand'
import axios from 'axios'
import type { CreateStoryRequest, Story, UpdateStoryRequest } from '../types'
import storyService from '../services/storyService'

/** 故事管理 Store 状态 */
interface StoryState {
  /** 故事列表 */
  stories: Story[]
  /** 是否加载中 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null

  /** 获取故事列表 */
  fetchStories: (params?: Record<string, string>) => Promise<void>
  /** 添加新故事 */
  addStory: (data: CreateStoryRequest) => Promise<Story>
  /** 更新故事 */
  updateStory: (id: string, data: UpdateStoryRequest) => Promise<Story>
  /** 删除故事 */
  deleteStory: (id: string) => Promise<void>
  /** 推送故事 */
  pushStory: (id: string) => Promise<Story>
  /** 清除错误 */
  clearError: () => void
}

/**
 * 故事管理状态 store
 * 管理故事的增删改查操作
 */
export const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  isLoading: false,
  error: null,

  /**
   * 从服务端获取故事列表
   */
  fetchStories: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const stories = await storyService.getStories(params)
      set({ stories, isLoading: false })
    } catch (err) {
      const message = getReadableErrorMessage(err, '获取故事列表失败')
      set({ error: message, isLoading: false })
    }
  },

  /**
   * 创建新故事
   */
  addStory: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const newStory = await storyService.createStory(data)
      set((state) => ({
        stories: [newStory, ...state.stories],
        isLoading: false,
      }))
      return newStory
    } catch (err) {
      const message = getReadableErrorMessage(err, '创建故事失败')
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 更新故事信息
   */
  updateStory: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await storyService.updateStory(id, data)
      set((state) => ({
        stories: state.stories.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      }))
      return updated
    } catch (err) {
      const message = getReadableErrorMessage(err, '更新故事失败')
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 删除故事
   */
  deleteStory: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await storyService.deleteStory(id)
      set((state) => ({
        stories: state.stories.filter((s) => s.id !== id),
        isLoading: false,
      }))
    } catch (err) {
      const message = getReadableErrorMessage(err, '删除故事失败')
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 推送故事到孩子端
   */
  pushStory: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await storyService.pushStory(id)
      set((state) => ({
        stories: state.stories.map((story) => (story.id === id ? updated : story)),
        isLoading: false,
      }))
      return updated
    } catch (err) {
      const message = getReadableErrorMessage(err, '推送故事失败')
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /** 清除错误信息 */
  clearError: () => set({ error: null }),
}))

/**
 * 提取更适合展示给用户的错误文案
 */
function getReadableErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage
    }

    if (error.code === 'ECONNABORTED') {
      return 'AI 正在生成较长故事，可能遇到冷启动或生成时间较长，请稍后重试。'
    }
  }

  return error instanceof Error ? error.message : fallback
}
