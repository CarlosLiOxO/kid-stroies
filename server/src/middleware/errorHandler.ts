/**
 * 全局错误处理中间件
 * 捕获所有未处理的异常，返回统一的 API 错误响应
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * 自定义应用错误类 - 包含 HTTP 状态码
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 全局错误处理中间件
 * 捕获控制器和服务层抛出的所有异常，返回统一格式的 JSON 响应
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 记录错误日志
  console.error(`[错误] ${new Date().toISOString()} - ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // 判断是否为已知的应用错误
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: 'APP_ERROR',
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ApiResponse = {
      success: false,
      message: '请求体格式无效，请提供合法的 JSON',
      error: 'INVALID_JSON',
    };
    res.status(400).json(response);
    return;
  }

  // 其他未知错误返回 500
  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误，请稍后重试'
      : err.message || '未知服务器错误',
    error: 'INTERNAL_ERROR',
  };
  res.status(500).json(response);
}
