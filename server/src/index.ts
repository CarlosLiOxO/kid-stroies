/**
 * 儿童绘本平台 - 后端服务入口
 * Express 服务器主文件，负责配置中间件、挂载路由、启动服务
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import storiesRoutes from './routes/stories';
import tokenRoutes from './routes/tokens';
import { errorHandler } from './middleware/errorHandler';

/** 创建 Express 应用实例 */
const app = express();

/** 服务端口 */
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// ==================== 中间件配置 ====================

/** 配置 CORS - 开发环境和生产环境自动放行 */
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedPatterns = [
        /^http:\/\/localhost:517\d$/,
        /^http:\/\/127\.0\.0\.1:517\d$/,
        /\.onrender\.com$/,
        /\.netlify\.app$/,
      ];

      if (
        !origin ||
        allowedPatterns.some((pattern) => pattern.test(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('当前来源未被 CORS 白名单允许'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/** 解析 JSON 请求体 */
app.use(express.json({ limit: '10mb' }));

/** 解析 URL 编码的请求体 */
app.use(express.urlencoded({ extended: true }));

// ==================== 路由挂载 ====================

/** 认证相关路由 */
app.use('/api/auth', authRoutes);

/** 孩子档案相关路由 */
app.use('/api/children', childrenRoutes);

/** 故事相关路由 */
app.use('/api/stories', storiesRoutes);

/** Token 相关路由 */
app.use('/api/tokens', tokenRoutes);

/** 健康检查端点 */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
  });
});

// ==================== 全局错误处理 ====================

/** 全局错误处理中间件（必须放在所有路由之后） */
app.use(errorHandler);

// ==================== 启动服务 ====================

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 儿童绘本平台后端服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`🔧 运行环境: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
