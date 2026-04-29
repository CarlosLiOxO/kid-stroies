/**
 * 孩子档案路由 - 孩子 CRUD 相关的 API 端点
 * 基础路径: /api/children
 * 所有端点均需认证
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
} from '../controllers/childController';

const router = Router();

// 所有孩子路由都需要认证
router.use(authMiddleware);

/** GET /api/children - 获取当前用户的所有孩子列表 */
router.get('/', getChildren);

/** GET /api/children/:id - 获取单个孩子详情（含最近故事） */
router.get('/:id', getChild);

/** POST /api/children - 创建孩子档案（支持 AI 标签提取） */
router.post('/', createChild);

/** PUT /api/children/:id - 更新孩子档案 */
router.put('/:id', updateChild);

/** DELETE /api/children/:id - 删除孩子档案（含关联故事） */
router.delete('/:id', deleteChild);

export default router;
