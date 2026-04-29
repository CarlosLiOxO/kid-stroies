/**
 * 故事控制器 - 处理故事生成、查询、更新、删除与推送
 * 使用 Mock 生成逻辑快速打通 MVP 联调闭环
 */

import { NextFunction, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateStory } from '../services/aiService';

const STORY_GENERATION_COST = 12;
const STORY_DOWNLOAD_COST = 6;

/**
 * 获取故事列表
 * 登录用户默认查看自己的故事；传入 isPublic=true 时查看公开故事
 */
export async function getStories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isPublic = req.query.isPublic === 'true';
    const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
    const keyword = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const where = isPublic
      ? {
          isPublic: true,
          ...(childId ? { childId } : {}),
          ...(keyword
            ? {
                OR: [
                  { title: { contains: keyword } },
                  { summary: { contains: keyword } },
                  { theme: { contains: keyword } },
                ],
              }
            : {}),
        }
      : {
          userId: req.user?.userId,
          ...(childId ? { childId } : {}),
          ...(keyword
            ? {
                OR: [
                  { title: { contains: keyword } },
                  { summary: { contains: keyword } },
                  { theme: { contains: keyword } },
                ],
              }
            : {}),
        };

    if (!isPublic && !req.user?.userId) {
      throw new AppError('未认证', 401);
    }

    const stories = await prisma.story.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        child: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: stories });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取单个故事详情
 * 仅允许作者本人或公开故事访问
 */
export async function getStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = String(req.params.id);
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        child: { select: { id: true, name: true } },
      },
    });

    if (!story) {
      throw new AppError('故事不存在', 404);
    }

    if (!story.isPublic && story.userId !== req.user?.userId) {
      throw new AppError('无权访问该故事', 403);
    }

    res.json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
}

/**
 * 创建并生成故事
 * 扣减用户 Token，生成多页故事内容和插画占位图
 */
export async function createStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const {
      childId,
      prompt,
      title,
      style = '睡前',
      artStyle = '水彩',
      isPublic = false,
      theme,
      educationalGoal,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new AppError('故事需求不能为空', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }
    if (user.tokens < STORY_GENERATION_COST) {
      throw new AppError('Token 余额不足，无法生成故事', 400);
    }

    const child =
      childId && typeof childId === 'string'
        ? await prisma.child.findFirst({ where: { id: childId, userId } })
        : null;

    if (childId && !child) {
      throw new AppError('孩子档案不存在', 404);
    }

    const normalizedPrompt = prompt.trim();
    const normalizedStyle = typeof style === 'string' ? style : '睡前';
    const normalizedArtStyle = typeof artStyle === 'string' ? artStyle : '水彩';

    const generated = await generateStory({
      prompt: normalizedPrompt,
      childName: child?.name ?? '小朋友',
      age: child?.age ?? undefined,
      style: normalizedStyle,
      artStyle: normalizedArtStyle,
      theme: typeof theme === 'string' && theme.trim() ? theme.trim() : inferTheme(normalizedPrompt),
      educationalGoal:
        typeof educationalGoal === 'string' && educationalGoal.trim()
          ? educationalGoal.trim()
          : inferEducationalGoal(normalizedPrompt),
      explicitTitle: typeof title === 'string' && title.trim() ? title.trim() : undefined,
    });

    const createdStory = await prisma.$transaction(async (tx) => {
      const story = await tx.story.create({
        data: {
          userId,
          childId: child?.id ?? null,
          title: generated.title,
          content: JSON.stringify(generated.pages),
          summary: generated.summary,
          style: normalizedStyle,
          artStyle: normalizedArtStyle,
          images: JSON.stringify(generated.images),
          tags: JSON.stringify(generated.tags),
          ageRange: child?.age ? `${Math.max(3, child.age - 1)}-${Math.max(6, child.age + 1)}` : '3-6',
          theme: generated.theme,
          educationalGoal: generated.educationalGoal,
          isPublic: Boolean(isPublic),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          tokens: { decrement: STORY_GENERATION_COST },
        },
      });

      await tx.tokenRecord.create({
        data: {
          userId,
          amount: -STORY_GENERATION_COST,
          type: 'spend',
          description: `生成故事《${generated.title}》`,
          relatedId: story.id,
        },
      });

      if (child) {
        const mergedTags = mergeChildStoryLearning(child.tags, generated.theme, generated.educationalGoal);
        await tx.child.update({
          where: { id: child.id },
          data: {
            tags: JSON.stringify(mergedTags),
          },
        });
      }

      return story;
    });

    res.status(201).json({
      success: true,
      data: createdStory,
      message: `故事生成成功，已消耗 ${STORY_GENERATION_COST} Token`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 更新故事元信息
 * 支持公开状态切换与重新推送标记
 */
export async function updateStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const storyId = String(req.params.id);

    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const story = await prisma.story.findFirst({ where: { id: storyId, userId } });
    if (!story) {
      throw new AppError('故事不存在', 404);
    }

    const { isPublic, isPushed, pushedAt } = req.body;
    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
        ...(typeof isPushed === 'boolean' ? { isPushed } : {}),
        ...(pushedAt ? { pushedAt: new Date(pushedAt) } : {}),
      },
    });

    res.json({ success: true, data: updated, message: '故事信息更新成功' });
  } catch (error) {
    next(error);
  }
}

/**
 * 删除故事
 * 仅作者本人可删除
 */
export async function deleteStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const storyId = String(req.params.id);

    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const story = await prisma.story.findFirst({ where: { id: storyId, userId } });
    if (!story) {
      throw new AppError('故事不存在', 404);
    }

    await prisma.story.delete({ where: { id: storyId } });

    res.json({ success: true, message: '故事已删除' });
  } catch (error) {
    next(error);
  }
}

/**
 * 推送故事到孩子端
 * 通过修改推送标记模拟推送流程
 */
export async function pushStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const storyId = String(req.params.id);

    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const story = await prisma.story.findFirst({ where: { id: storyId, userId } });
    if (!story) {
      throw new AppError('故事不存在', 404);
    }

    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        isPushed: true,
        pushedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated, message: '故事已推送到孩子端' });
  } catch (error) {
    next(error);
  }
}

/**
 * 下载公开故事
 * 对非作者用户扣减 Token，并给作者结算收益
 */
export async function downloadStory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const storyId = String(req.params.id);

    if (!userId) {
      throw new AppError('未认证', 401);
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story || !story.isPublic) {
      throw new AppError('公开故事不存在', 404);
    }

    if (story.userId === userId) {
      res.json({ success: true, data: story, message: '这是你自己的故事，无需下载消耗' });
      return;
    }

    const buyer = await prisma.user.findUnique({ where: { id: userId } });
    if (!buyer) {
      throw new AppError('用户不存在', 404);
    }
    if (buyer.tokens < STORY_DOWNLOAD_COST) {
      throw new AppError('Token 余额不足，无法下载故事', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { tokens: { decrement: STORY_DOWNLOAD_COST } },
      });

      await tx.user.update({
        where: { id: story.userId },
        data: { tokens: { increment: STORY_DOWNLOAD_COST } },
      });

      await tx.tokenRecord.create({
        data: {
          userId,
          amount: -STORY_DOWNLOAD_COST,
          type: 'spend',
          description: `下载故事《${story.title}》`,
          relatedId: story.id,
        },
      });

      await tx.tokenRecord.create({
        data: {
          userId: story.userId,
          amount: STORY_DOWNLOAD_COST,
          type: 'earn',
          description: `故事《${story.title}》被下载获得收益`,
          relatedId: story.id,
        },
      });

      await tx.story.update({
        where: { id: story.id },
        data: { downloadCount: { increment: 1 } },
      });
    });

    const refreshed = await prisma.story.findUnique({ where: { id: story.id } });
    res.json({
      success: true,
      data: refreshed,
      message: `下载成功，已消耗 ${STORY_DOWNLOAD_COST} Token`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 根据需求文本推断主题
 */
function inferTheme(prompt: string): string {
  if (prompt.includes('刷牙')) return '刷牙习惯';
  if (prompt.includes('怕黑')) return '勇敢面对黑暗';
  if (prompt.includes('睡觉')) return '安心入睡';
  if (prompt.includes('分享')) return '学会分享';
  return '成长冒险';
}

/**
 * 根据需求文本推断教育目标
 */
function inferEducationalGoal(prompt: string): string {
  if (prompt.includes('刷牙')) return '建立自律习惯';
  if (prompt.includes('怕黑')) return '培养安全感';
  if (prompt.includes('不想')) return '理解并接纳情绪';
  return '建立积极自信';
}

/**
 * 合并孩子画像学习标签
 * 在 tags JSON 中记录故事主题与教育目标出现频次
 */
function mergeChildStoryLearning(
  existingTags: string | null,
  theme: string,
  educationalGoal: string
): Record<string, unknown> {
  const parsed = safeParseJson(existingTags);
  const storyThemes = isRecord(parsed.storyThemes) ? parsed.storyThemes : {};
  const goals = isRecord(parsed.educationalGoals) ? parsed.educationalGoals : {};

  storyThemes[theme] = typeof storyThemes[theme] === 'number' ? (storyThemes[theme] as number) + 1 : 1;
  goals[educationalGoal] =
    typeof goals[educationalGoal] === 'number' ? (goals[educationalGoal] as number) + 1 : 1;

  return {
    ...parsed,
    storyThemes,
    educationalGoals: goals,
    lastStoryTheme: theme,
    lastEducationalGoal: educationalGoal,
  };
}

/**
 * 安全解析 JSON 字符串
 */
function safeParseJson(raw: string | null): Record<string, unknown> {
  if (!raw) {
    return {};
  }

  try {
    const value = JSON.parse(raw) as unknown;
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}

/**
 * 判断值是否为普通对象
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
