import api from './api'
import { normalizeStories, normalizeStory } from './storyAdapter'
import type { ApiResponse, CreateStoryRequest, Story, StoryDTO, UpdateStoryRequest } from '../types'

/**
 * 故事管理服务 - 处理故事相关 API 调用
 */
const storyService = {
  /**
   * 获取故事列表
   * @param params - 可选查询参数（childId, isPublic 等）
   * @returns 故事列表数组
   */
  async getStories(params?: Record<string, string>): Promise<Story[]> {
    const response = await api.get<ApiResponse<StoryDTO[]>>('/stories', { params })
    return normalizeStories(response.data.data)
  },

  /**
   * 获取单个故事详情
   * @param id - 故事 ID
   * @returns 故事详情
   */
  async getStory(id: string): Promise<Story> {
    const response = await api.get<ApiResponse<StoryDTO>>(`/stories/${id}`)
    return normalizeStory(response.data.data)
  },

  /**
   * 创建新故事
   * @param data - 故事信息（不含 id、userId、createdAt）
   * @returns 创建的故事
   */
  async createStory(data: CreateStoryRequest): Promise<Story> {
    const response = await api.post<ApiResponse<StoryDTO>>('/stories', data, {
      timeout: 90000,
    })
    return normalizeStory(response.data.data)
  },

  /**
   * 更新故事元信息
   * @param id - 故事 ID
   * @param data - 更新字段
   * @returns 更新后的故事
   */
  async updateStory(id: string, data: UpdateStoryRequest): Promise<Story> {
    const response = await api.patch<ApiResponse<StoryDTO>>(`/stories/${id}`, data)
    return normalizeStory(response.data.data)
  },

  /**
   * 推送故事到孩子端
   * @param id - 故事 ID
   * @returns 推送后的故事
   */
  async pushStory(id: string): Promise<Story> {
    const response = await api.post<ApiResponse<StoryDTO>>(`/stories/${id}/push`)
    return normalizeStory(response.data.data)
  },

  /**
   * 下载公开故事
   * @param id - 故事 ID
   * @returns 下载后的故事
   */
  async downloadStory(id: string): Promise<Story> {
    const response = await api.post<ApiResponse<StoryDTO>>(`/stories/${id}/download`)
    return normalizeStory(response.data.data)
  },

  /**
   * 删除故事
   * @param id - 故事 ID
   */
  async deleteStory(id: string): Promise<void> {
    await api.delete(`/stories/${id}`)
  },
}

export default storyService
