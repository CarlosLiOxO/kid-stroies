/**
 * 故事路由 - 故事生成、管理、推送与下载
 * 基础路径: /api/stories
 */

import { Router } from 'express';
import {
  createStory,
  deleteStory,
  downloadStory,
  getStories,
  getStory,
  pushStory,
  updateStory,
} from '../controllers/storyController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

/** GET /api/stories - 获取故事列表（公开故事或当前用户故事） */
router.get('/', optionalAuth, getStories);

/** GET /api/stories/:id - 获取故事详情 */
router.get('/:id', optionalAuth, getStory);

/** POST /api/stories - 创建并生成故事 */
router.post('/', authMiddleware, createStory);

/** PATCH /api/stories/:id - 更新故事元信息 */
router.patch('/:id', authMiddleware, updateStory);

/** DELETE /api/stories/:id - 删除故事 */
router.delete('/:id', authMiddleware, deleteStory);

/** POST /api/stories/:id/push - 推送故事到孩子端 */
router.post('/:id/push', authMiddleware, pushStory);

/** POST /api/stories/:id/download - 下载公开故事 */
router.post('/:id/download', authMiddleware, downloadStory);

export default router;
