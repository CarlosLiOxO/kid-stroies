import { create } from 'zustand'
import type { Child } from '../types'
import childService from '../services/childService'

/** 孩子管理 Store 状态 */
interface ChildState {
  /** 孩子列表 */
  children: Child[]
  /** 当前选中的孩子 */
  currentChild: Child | null
  /** 是否加载中 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null

  /** 从服务端获取孩子列表 */
  fetchChildren: () => Promise<void>
  /** 添加孩子档案（通过名称和自然语言描述） */
  addChild: (name: string, description: string) => Promise<void>
  /** 更新孩子信息 */
  updateChild: (id: string, data: { name?: string; description?: string }) => Promise<void>
  /** 删除孩子档案 */
  deleteChild: (id: string) => Promise<void>
  /** 设置当前选中孩子 */
  setCurrentChild: (child: Child | null) => void
  /** 清除错误 */
  clearError: () => void
}

/**
 * 孩子管理状态 store
 * 管理孩子的增删改查操作，以及当前选中孩子的状态
 */
export const useChildStore = create<ChildState>((set) => ({
  children: [],
  currentChild: null,
  isLoading: false,
  error: null,

  /**
   * 从服务端获取当前用户的所有孩子列表
   * 获取成功后自动更新 children 数组
   */
  fetchChildren: async () => {
    set({ isLoading: true, error: null })
    try {
      const children = await childService.getChildren()
      set({ children, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取孩子列表失败'
      set({ error: message, isLoading: false })
    }
  },

  /**
   * 添加新的孩子档案
   * @param name - 孩子姓名
   * @param description - 自然语言描述文本
   */
  addChild: async (name: string, description: string) => {
    set({ isLoading: true, error: null })
    try {
      const newChild = await childService.createChild({ name, description })
      set((state) => ({
        children: [...state.children, newChild],
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '添加孩子失败'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 更新指定孩子的档案信息
   * @param id - 孩子 ID
   * @param data - 要更新的字段
   */
  updateChild: async (id: string, data: { name?: string; description?: string }) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await childService.updateChild(id, data)
      set((state) => ({
        children: state.children.map((c) => (c.id === id ? updated : c)),
        currentChild: state.currentChild?.id === id ? updated : state.currentChild,
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新孩子信息失败'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * 删除指定孩子档案
   * 如果删除的是当前选中的孩子，自动取消选中
   * @param id - 孩子 ID
   */
  deleteChild: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await childService.deleteChild(id)
      set((state) => ({
        children: state.children.filter((c) => c.id !== id),
        currentChild: state.currentChild?.id === id ? null : state.currentChild,
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除孩子失败'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /** 设置当前选中的孩子 */
  setCurrentChild: (child: Child | null) => set({ currentChild: child }),

  /** 清除错误信息 */
  clearError: () => set({ error: null }),
}))
