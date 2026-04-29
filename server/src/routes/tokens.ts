/**
 * Token 路由 - 余额、流水与模拟充值
 * 基础路径: /api/tokens
 */

import { Router } from 'express';
import { getTokenRecords, getTokenSummary, purchaseTokens } from '../controllers/tokenController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/** GET /api/tokens/summary - 获取余额与最近流水 */
router.get('/summary', getTokenSummary);

/** GET /api/tokens/records - 获取完整流水 */
router.get('/records', getTokenRecords);

/** POST /api/tokens/purchase - 模拟充值 */
router.post('/purchase', purchaseTokens);

export default router;
