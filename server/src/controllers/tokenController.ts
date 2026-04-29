/**
 * Token 控制器 - 处理余额查询、流水查询与模拟充值
 */

import { NextFunction, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * 获取当前用户 Token 概览
 */
export async function getTokenSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const recentRecords = await prisma.tokenRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        balance: user.tokens,
        recentRecords,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取当前用户全部 Token 流水
 */
export async function getTokenRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const records = await prisma.tokenRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

/**
 * 模拟充值 Token
 * MVP 阶段用于打通购买流程
 */
export async function purchaseTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const amount = Number(req.body.amount ?? 0);

    if (!userId) {
      throw new AppError('未认证', 401);
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError('充值数量必须大于 0', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tokens: { increment: amount },
      },
    });

    await prisma.tokenRecord.create({
      data: {
        userId,
        amount,
        type: 'earn',
        description: `模拟充值 ${amount} Token`,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        balance: updatedUser.tokens,
      },
      message: 'Token 充值成功',
    });
  } catch (error) {
    next(error);
  }
}
