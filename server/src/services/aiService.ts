/**
 * AI 服务 - 封装 GLM 大模型调用
 * 基于 OpenAI 兼容 SDK，对接智谱 GLM API
 */

import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 手动加载 .env 文件（绕过 dotenvx 拦截）
 * 只解析 GLM_ 开头的变量，不影响其他配置
 */
function loadEnvFromFile(): void {
  try {
    const envPath = resolve(__dirname, '../../.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env 文件读取失败时忽略，使用环境变量 fallback
  }
}
loadEnvFromFile();

// 启动时验证 API Key 是否已加载
if (!process.env.GLM_API_KEY) {
  console.warn('[GLM] ⚠️  GLM_API_KEY 未配置，故事生成将使用模板兜底');
} else {
  console.log('[GLM] ✅ API Key 已加载，模型:', process.env.GLM_MODEL || 'glm-4.7');
}

/** GLM 客户端懒初始化单例 */
let _glmClient: OpenAI | null = null;
function getGLMClient(): OpenAI {
  if (!_glmClient) {
    _glmClient = new OpenAI({
      apiKey: process.env.GLM_API_KEY || 'missing-key',
      baseURL: process.env.GLM_API_BASE || 'https://open.bigmodel.cn/api/paas/v4',
    });
  }
  return _glmClient;
}

function getGLMModel(): string {
  return process.env.GLM_MODEL || 'glm-4.7';
}

/** 故事生成输入参数 */
export interface StoryGenInput {
  prompt: string;
  childName: string;
  age?: number;
  style: string;
  artStyle: string;
  theme: string;
  educationalGoal: string;
  explicitTitle?: string;
}

/** 故事生成输出 */
export interface StoryGenOutput {
  title: string;
  summary: string;
  pages: Array<{ page: number; text: string }>;
  images: string[];
  tags: Record<string, string>;
  theme: string;
  educationalGoal: string;
}

/**
 * 调用 GLM 大模型生成童话故事
 * 返回结构化的分页故事内容
 */
export async function generateStory(input: StoryGenInput): Promise<StoryGenOutput> {
  const ageHint = input.age ? `${input.age}岁` : '小朋友';

  const systemPrompt = `你是一位温暖而富有想象力的儿童文学作家，专长是为${ageHint}的孩子创作睡前童话。
你的故事需要具备以下特质：
1. 语言温暖、简洁，适合朗读，每句话不超过25个字
2. 将孩子的真实经历和困扰巧妙融入童话情节
3. 包含明确的积极教育目标，但不直白说教
4. 每篇故事4页，每页2-3句话，有明确的故事起伏
5. 故事中主角就是孩子自己的名字"${input.childName}"

请严格按以下JSON格式回复，不要包含任何其他内容：
{
  "title": "故事标题（8-15字）",
  "summary": "故事摘要（30-60字）",
  "pages": [
    { "page": 1, "text": "第1页故事内容..." },
    { "page": 2, "text": "第2页故事内容..." },
    { "page": 3, "text": "第3页故事内容..." },
    { "page": 4, "text": "第4页故事内容..." }
  ]
}`;

  const userPrompt = `请为${ageHint}孩子"${input.childName}"创作一篇睡前童话。

【故事需求】
${input.prompt}

【故事风格】${input.style}
【插画风格】${input.artStyle}（用于后续配图参考）
【核心主题】${input.theme}
【教育目标】${input.educationalGoal}
${input.explicitTitle ? `【指定标题】${input.explicitTitle}` : ''}

请创作一个温暖、有教育意义、与孩子真实经历紧密关联的童话故事。`;

  try {
    const completion = await getGLMClient().chat.completions.create({
      model: getGLMModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? '';

    // 尝试从回复中提取 JSON
    const parsed = parseGLMResponse(content, input);

    return {
      title: parsed.title,
      summary: parsed.summary,
      pages: parsed.pages,
      images: parsed.images,
      tags: parsed.tags,
      theme: parsed.theme,
      educationalGoal: parsed.educationalGoal,
    };
  } catch (error) {
    // 如果 GLM 调用失败，回退到模板生成
    console.error('[GLM] 故事生成失败，使用模板兜底:', error instanceof Error ? error.message : error);
    return buildFallbackStory(input);
  }
}

/**
 * 解析 GLM 返回的 JSON 内容
 * 兼容 markdown 代码块包裹的情况
 */
function parseGLMResponse(content: string, input: StoryGenInput): StoryGenOutput {
  // 尝试提取 JSON 代码块
  const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : content;

  try {
    const parsed = JSON.parse(jsonStr) as {
      title?: string;
      summary?: string;
      pages?: Array<{ page: number; text: string }>;
    };

    return {
      title: parsed.title || input.explicitTitle || `${input.childName}的${input.theme}童话`,
      summary: parsed.summary || `一篇关于${input.theme}的${input.style}风格睡前童话。`,
      pages: Array.isArray(parsed.pages) && parsed.pages.length >= 4
        ? parsed.pages.slice(0, 4).map((page, index) => ({ page: index + 1, text: page.text }))
        : buildFallbackPages(input),
      images: generatePlaceholderImages(input),
      tags: {
        theme: input.theme,
        educationalGoal: input.educationalGoal,
        style: input.style,
        artStyle: input.artStyle,
      },
      theme: input.theme,
      educationalGoal: input.educationalGoal,
    };
  } catch {
    // JSON 解析失败，当作纯文本处理
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[{}\[\]"]/g, '')
      .trim();

    if (cleanContent.length > 50) {
      const sentences = cleanContent.split(/[。！？\n]/).filter(Boolean);
      const pages: Array<{ page: number; text: string }> = [];
      for (let i = 0; i < Math.min(4, Math.ceil(sentences.length / 3)); i++) {
        pages.push({
          page: i + 1,
          text: sentences.slice(i * 3, i * 3 + 3).join('。') + '。',
        });
      }

      return {
        title: input.explicitTitle || `${input.childName}的${input.theme}童话`,
        summary: cleanContent.slice(0, 60),
        pages: pages.length >= 4 ? pages : [...pages, ...buildFallbackPages(input).slice(pages.length)],
        images: generatePlaceholderImages(input),
        tags: { theme: input.theme, educationalGoal: input.educationalGoal, style: input.style, artStyle: input.artStyle },
        theme: input.theme,
        educationalGoal: input.educationalGoal,
      };
    }

    return buildFallbackStory(input);
  }
}

/**
 * 模板兜底故事生成
 * 当 GLM 不可用时使用
 */
function buildFallbackStory(input: StoryGenInput): StoryGenOutput {
  const title = input.explicitTitle ?? `${input.childName}的${input.theme}${input.educationalGoal ? `与${input.educationalGoal}` : ''}童话`;

  return {
    title,
    summary: `围绕"${input.theme}"展开的${input.style}风格睡前童话，帮助孩子理解并练习${input.educationalGoal}。`,
    pages: buildFallbackPages(input),
    images: generatePlaceholderImages(input),
    tags: { theme: input.theme, educationalGoal: input.educationalGoal, style: input.style, artStyle: input.artStyle },
    theme: input.theme,
    educationalGoal: input.educationalGoal,
  };
}

/**
 * 生成兜底分页内容
 */
function buildFallbackPages(input: StoryGenInput): Array<{ page: number; text: string }> {
  return [
    {
      page: 1,
      text: `夜幕轻轻落下，${input.childName}抱着小枕头，想着今天发生的事：${input.prompt}。月亮婆婆在窗边微笑，说今晚会有一场温柔又神奇的冒险。`,
    },
    {
      page: 2,
      text: `${input.childName}来到一片会发光的森林，森林里的小伙伴们告诉他，只要学会${input.educationalGoal}，就能找到藏在星光里的勇气。`,
    },
    {
      page: 3,
      text: `一路上，${input.childName}用自己的${input.style}精神帮助了迷路的小兔子，也慢慢明白，原来面对"${input.theme}"并不难，难的是迈出第一步。`,
    },
    {
      page: 4,
      text: `当第一颗晨星亮起时，${input.childName}终于完成了挑战。回到家后，他轻轻对自己说："明天我也可以做到。"这晚，他睡得格外香甜。`,
    },
  ];
}

/**
 * 生成占位插画 URL
 */
function generatePlaceholderImages(input: StoryGenInput): string[] {
  return [
    `https://placehold.co/640x480/fef3c7/7c3aed?text=${encodeURIComponent(input.childName + '·封面')}`,
    `https://placehold.co/640x480/e9d5ff/7c3aed?text=${encodeURIComponent(input.theme + '·插画')}`,
    `https://placehold.co/640x480/fce7f3/db2777?text=${encodeURIComponent(input.artStyle + '·梦境')}`,
  ];
}
