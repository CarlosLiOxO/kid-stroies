/**
 * 孩子档案控制器 - 处理孩子的 CRUD 和 AI 标签提取
 * 支持从自然语言描述中提取结构化标签（模拟 AI 实现）
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * 获取当前用户的所有孩子列表
 * GET /api/children
 * 按创建时间倒序排列
 */
export const getChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const children = await prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: children });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个孩子详情 - 包含最近 10 篇关联故事
 * GET /api/children/:id
 */
export const getChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const child = await prisma.child.findFirst({
      where: { id, userId },
      include: { stories: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!child) {
      throw new AppError('孩子档案不存在', 404);
    }
    res.json({ success: true, data: child });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建孩子档案 - 包含 AI 标签提取
 * POST /api/children
 * 接收自然语言描述，调用 AI 提取结构化标签
 * AI 提取失败不会阻塞创建流程
 */
export const createChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('孩子名称不能为空', 400);
    }

    // 如果提供了自然语言描述，使用 AI 提取结构化标签
    let tags: Record<string, any> = {};
    let age: number | null = null;
    let gender: string | null = null;
    let personality: string | null = null;
    let concerns: string | null = null;

    if (description && description.trim()) {
      try {
        tags = await extractTagsWithAI(description);
        age = tags.age || null;
        gender = tags.gender || null;
        personality = tags.personality || null;
        concerns = tags.concerns || null;
      } catch (aiError) {
        // AI 提取失败不阻塞创建流程，使用基本标签
        console.warn('AI 标签提取失败，使用默认值:', aiError);
        tags = { raw: description };
      }
    }

    const child = await prisma.child.create({
      data: {
        userId,
        name: name.trim(),
        age,
        gender,
        personality,
        concerns,
        tags: JSON.stringify(tags),
      },
    });

    res.status(201).json({ success: true, data: child, message: '孩子档案创建成功' });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新孩子档案
 * PUT /api/children/:id
 * 支持部分更新，如果更新了描述则重新提取标签
 */
export const updateChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { name, description } = req.body;

    const existing = await prisma.child.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('孩子档案不存在', 404);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();

    if (description !== undefined && description.trim()) {
      try {
        const tags = await extractTagsWithAI(description);
        updateData.age = tags.age || null;
        updateData.gender = tags.gender || null;
        updateData.personality = tags.personality || null;
        updateData.concerns = tags.concerns || null;
        updateData.tags = JSON.stringify(tags);
      } catch {
        updateData.tags = JSON.stringify({ raw: description });
      }
    }

    const child = await prisma.child.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: child, message: '孩子档案更新成功' });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除孩子档案
 * DELETE /api/children/:id
 * 同时删除该孩子关联的所有故事
 */
export const deleteChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await prisma.child.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('孩子档案不存在', 404);
    }

    // 先删除关联的故事，再删除孩子档案
    await prisma.story.deleteMany({ where: { childId: id } });
    await prisma.child.delete({ where: { id } });

    res.json({ success: true, message: '孩子档案已删除' });
  } catch (error) {
    next(error);
  }
};

/**
 * 使用 AI 从自然语言描述中提取结构化标签
 * 当前为基于关键词匹配的模拟实现，生产环境可替换为 LLM API 调用
 * @param description - 用户输入的自然语言描述
 * @returns 结构化的标签对象，包含 age、gender、personality、concerns、interests 等字段
 */
async function extractTagsWithAI(description: string): Promise<Record<string, any>> {
  const tags: Record<string, any> = {};

  // 提取年龄
  const ageMatch = description.match(/(\d+)\s*[岁岁半]/);
  if (ageMatch) tags.age = parseInt(ageMatch[1]);

  // 提取性别
  if (/男孩|男宝|儿子|弟弟|哥哥/.test(description)) tags.gender = '男';
  else if (/女孩|女宝|女儿|妹妹|姐姐/.test(description)) tags.gender = '女';

  // 提取性格特征
  const personalityKeywords = ['活泼', '安静', '内向', '外向', '勇敢', '胆小', '好奇', '固执', '温柔', '调皮', '好动'];
  const matchedPersonality = personalityKeywords.filter(k => description.includes(k));
  if (matchedPersonality.length > 0) tags.personality = matchedPersonality.join('、');

  // 提取家长关注点/困难
  const concernKeywords = ['怕黑', '怕生', '挑食', '不刷牙', '不睡觉', '爱哭', '发脾气', '不合群', '注意力', '分离焦虑'];
  const matchedConcerns = concernKeywords.filter(k => description.includes(k));
  if (matchedConcerns.length > 0) tags.concerns = matchedConcerns.join('、');

  // 提取兴趣爱好
  const interestKeywords = ['恐龙', '公主', '汽车', '动物', '太空', '海洋', '画画', '唱歌', '跳舞', '积木', '运动'];
  const matchedInterests = interestKeywords.filter(k => description.includes(k));
  if (matchedInterests.length > 0) tags.interests = matchedInterests.join('、');

  return tags;
}
