import api from './api'
import type { ApiResponse, Child, CreateChildRequest, UpdateChildRequest } from '../types'

/**
 * 孩子管理服务 - 处理孩子档案相关 API 调用
 * 所有接口使用 /children 路由前缀
 */
const childService = {
  /**
   * 获取当前用户的所有孩子列表
   * @returns 孩子档案数组
   */
  async getChildren(): Promise<Child[]> {
    const response = await api.get<ApiResponse<Child[]>>('/children')
    return response.data.data
  },

  /**
   * 创建新的孩子档案（通过自然语言描述）
   * 后端 AI 会解析描述内容，自动提取年龄、性格、关注点等信息
   * @param name - 孩子姓名
   * @param description - 自然语言描述（如："5岁男孩，活泼好动，最近害怕黑暗，喜欢恐龙和汽车"）
   * @returns 创建的孩子档案
   */
  async createChild(data: CreateChildRequest): Promise<Child> {
    const response = await api.post<ApiResponse<Child>>('/children', data)
    return response.data.data
  },

  /**
   * 更新孩子档案信息
   * @param id - 孩子 ID
   * @param data - 需要更新的字段（name 和/或 description）
   * @returns 更新后的孩子档案
   */
  async updateChild(id: string, data: UpdateChildRequest): Promise<Child> {
    const response = await api.put<ApiResponse<Child>>(`/children/${id}`, data)
    return response.data.data
  },

  /**
   * 删除孩子档案
   * @param id - 孩子 ID
   */
  async deleteChild(id: string): Promise<void> {
    await api.delete(`/children/${id}`)
  },
}

export default childService
