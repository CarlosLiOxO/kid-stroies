/**
 * 童话故事平台 - 核心类型定义
 * 定义应用中使用的所有数据模型接口
 */

/** 用户信息 */
export interface User {
  /** 用户唯一标识 */
  id: string
  /** 邮箱地址 */
  email: string
  /** 用户昵称 */
  name: string
  /** 头像 URL */
  avatar?: string
  /** 用户代币余额 */
  tokens: number
  /** 账户创建时间 */
  createdAt: string
}

/** 孩子档案 */
export interface Child {
  /** 孩子唯一标识 */
  id: string
  /** 关联的家长用户 ID */
  userId: string
  /** 孩子姓名 */
  name: string
  /** 孩子年龄（由后端 AI 解析，可能为 null） */
  age?: number | null
  /** 性别（由后端 AI 解析，可能为 null） */
  gender?: string | null
  /** 性格特点描述 */
  personality?: string | null
  /** 家长关注的问题（自然语言文本） */
  concerns?: string | null
  /** 标签 JSON 字符串（如 '["勇敢","聪明"]'） */
  tags?: string | null
  /** 创建时间 */
  createdAt: string
  /** 最后更新时间 */
  updatedAt: string
}

/** 故事关联的简要用户信息 */
export interface StoryAuthor {
  id: string
  name: string
  avatar?: string | null
}

/** 故事关联的简要孩子信息 */
export interface StoryChild {
  id: string
  name: string
}

/** 故事记录 */
export interface Story {
  /** 故事唯一标识 */
  id: string
  /** 创建者用户 ID */
  userId: string
  /** 关联的孩子 ID（可选） */
  childId?: string | null
  /** 故事标题 */
  title: string
  /** 故事内容（后端以 JSON 字符串存储分页内容） */
  content: string
  /** 摘要 */
  summary?: string | null
  /** 故事风格（如 "冒险"、"睡前"等） */
  style?: string
  /** 美术风格（如 "水彩"、"卡通"等） */
  artStyle?: string
  /** 故事配图 URL 列表 */
  images?: string[] | string | null
  /** 扩展标签 */
  tags?: string | null
  /** 适龄范围 */
  ageRange?: string | null
  /** 主题 */
  theme?: string | null
  /** 教育目标 */
  educationalGoal?: string | null
  /** 是否公开到社区 */
  isPublic: boolean
  /** 是否已推送到孩子端 */
  isPushed?: boolean
  /** 推送时间 */
  pushedAt?: string | null
  /** 下载次数 */
  downloadCount?: number
  /** 创建时间 */
  createdAt: string
  /** 最后更新时间 */
  updatedAt?: string
  /** 作者信息（社区列表/详情返回） */
  user?: StoryAuthor
  /** 关联孩子简要信息 */
  child?: StoryChild
}

/** 代币交易记录 */
export interface TokenRecord {
  /** 记录唯一标识 */
  id: string
  /** 关联用户 ID */
  userId: string
  /** 变动金额（正数为充值，负数为消费） */
  amount: number
  /** 交易类型 */
  type: 'earn' | 'spend' | 'bonus'
  /** 交易描述 */
  description: string
  /** 关联资源 ID */
  relatedId?: string | null
  /** 创建时间 */
  createdAt: string
}

/** API 统一响应格式 - 与后端 ApiResponse<T> 结构保持一致 */
export interface ApiResponse<T> {
  /** 请求是否成功 */
  success: boolean
  /** 响应消息 */
  message?: string
  /** 响应数据 */
  data: T
}

/** 登录请求体 */
export interface LoginRequest {
  email: string
  password: string
}

/** 注册请求体 */
export interface RegisterRequest {
  email: string
  password: string
  name: string
}

/** 登录/注册响应 */
export interface AuthResponse {
  user: User
  token: string
}

/** 创建孩子请求体 */
export interface CreateChildRequest {
  /** 孩子姓名 */
  name: string
  /** 自然语言描述 */
  description: string
}

/** 更新孩子请求体 */
export interface UpdateChildRequest {
  /** 孩子姓名（可选更新） */
  name?: string
  /** 自然语言描述（可选更新） */
  description?: string
}

/** 创建故事请求体 */
export interface CreateStoryRequest {
  /** 关联孩子 ID */
  childId?: string
  /** 自然语言需求 */
  prompt: string
  /** 自定义标题 */
  title?: string
  /** 故事风格 */
  style: string
  /** 插画风格 */
  artStyle: string
  /** 是否公开到社区 */
  isPublic?: boolean
  /** 显式主题 */
  theme?: string
  /** 教育目标 */
  educationalGoal?: string
}

/** 更新故事请求体 */
export interface UpdateStoryRequest {
  /** 是否公开 */
  isPublic?: boolean
  /** 是否已推送 */
  isPushed?: boolean
  /** 推送时间 */
  pushedAt?: string
}

/** Token 概览响应 */
export interface TokenSummary {
  /** 当前余额 */
  balance: number
  /** 最近记录 */
  recentRecords: TokenRecord[]
}
