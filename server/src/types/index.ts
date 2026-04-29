/**
 * 核心类型定义 - 与 Prisma 模型对应的 TypeScript 接口
 * 用于前端交互的类型约束
 */

/** 用户基本信息（不含密码） */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  tokens: number;
  createdAt: string;
  updatedAt: string;
}

/** 用户注册请求参数 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

/** 用户登录请求参数 */
export interface LoginInput {
  email: string;
  password: string;
}

/** 认证返回的 Token 载荷 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** 儿童档案信息 */
export interface ChildInfo {
  id: string;
  userId: string;
  name: string;
  age: number | null;
  gender: string | null;
  personality: string | null;
  concerns: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 绘本故事信息 */
export interface StoryInfo {
  id: string;
  userId: string;
  childId: string | null;
  title: string;
  content: string;
  summary: string | null;
  style: string;
  artStyle: string;
  images: string | null;
  tags: string | null;
  ageRange: string | null;
  theme: string | null;
  educationalGoal: string | null;
  isPublic: boolean;
  isPushed: boolean;
  pushedAt: string | null;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Token 使用记录 */
export interface TokenRecordInfo {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'bonus';
  description: string;
  relatedId: string | null;
  createdAt: string;
}
