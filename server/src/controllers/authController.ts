/**
 * 认证控制器 - 处理用户注册、登录、个人信息获取
 * 使用 bcryptjs 加密密码，jsonwebtoken 生成访问令牌
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { RegisterInput, LoginInput, ApiResponse, UserProfile, JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

/**
 * 生成 JWT Token
 * @param payload - Token 载荷，包含 userId 和 email
 * @returns 签名的 JWT 字符串，有效期 7 天
 */
function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET 环境变量未配置', 500);
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * 构造用户 Profile 响应（去除敏感信息）
 */
function buildUserProfile(user: {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    tokens: user.tokens,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * 用户注册
 * POST /api/auth/register
 * 创建新用户账号，密码使用 bcrypt 加密，新用户赠送 100 Token
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name }: RegisterInput = req.body;

    // 校验必填字段
    if (!email || !password || !name) {
      throw new AppError('邮箱、密码和姓名为必填项', 400);
    }

    // 校验邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('邮箱格式不正确', 400);
    }

    // 校验密码长度
    if (password.length < 6) {
      throw new AppError('密码长度不能少于 6 位', 400);
    }

    // 校验姓名长度
    if (name.trim().length < 2) {
      throw new AppError('姓名长度不能少于 2 个字符', 400);
    }

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('该邮箱已被注册', 409);
    }

    // 加密密码（salt rounds = 10）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（默认赠送 100 Token）
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
        tokens: 100,
      },
    });

    // 为新用户创建 Token 赠送记录
    await prisma.tokenRecord.create({
      data: {
        userId: user.id,
        amount: 100,
        type: 'bonus',
        description: '新用户注册赠送',
      },
    });

    // 生成 JWT Token
    const token = generateToken({ userId: user.id, email: user.email });

    // 返回成功响应
    const response: ApiResponse<{ user: UserProfile; token: string }> = {
      success: true,
      data: {
        user: buildUserProfile(user),
        token,
      },
      message: '注册成功！已赠送 100 Token',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * 用户登录
 * POST /api/auth/login
 * 验证邮箱和密码，返回 JWT Token
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password }: LoginInput = req.body;

    // 校验必填字段
    if (!email || !password) {
      throw new AppError('邮箱和密码为必填项', 400);
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('邮箱或密码不正确', 401);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('邮箱或密码不正确', 401);
    }

    // 生成 JWT Token
    const token = generateToken({ userId: user.id, email: user.email });

    // 返回成功响应
    const response: ApiResponse<{ user: UserProfile; token: string }> = {
      success: true,
      data: {
        user: buildUserProfile(user),
        token,
      },
      message: '登录成功',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * 获取当前用户个人信息
 * GET /api/auth/profile
 * 需要 Bearer Token 认证
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('未认证', 401);
    }

    // 从数据库获取最新用户信息
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: buildUserProfile(user),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
