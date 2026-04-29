/**
 * 认证路由 - 用户注册、登录、个人信息相关的 API 端点
 * 基础路径: /api/auth
 */

import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/** POST /api/auth/register - 用户注册 */
router.post('/register', register);

/** POST /api/auth/login - 用户登录 */
router.post('/login', login);

/** GET /api/auth/profile - 获取当前用户个人信息（需认证） */
router.get('/profile', authMiddleware, getProfile);

export default router;
