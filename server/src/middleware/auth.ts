/**
 * JWT 认证中间件
 * 从请求头 Authorization 中提取 Bearer Token 并验证
 * 验证通过后将用户信息挂载到 req.user
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

/** 扩展 Express Request 类型，添加 user 属性 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 认证中间件 - 验证 JWT Token
 * 从 Authorization header 提取 Bearer token，验证后解析用户信息
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // 从请求头中提取 Bearer Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: '认证令牌格式无效',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    // 验证 JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 环境变量未配置');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // 将解析出的用户信息挂载到请求对象上
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '认证令牌无效或已过期',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: '认证服务异常',
      error: 'INTERNAL_ERROR',
    });
  }
}

/**
 * 可选认证中间件 - 不强制要求 Token
 * 如果提供了有效 Token 则解析用户信息，否则继续执行
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret) {
          const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
          req.user = decoded;
        }
      }
    }
  } catch {
    // 可选认证不抛出错误，Token 无效时忽略
  }
  next();
}
