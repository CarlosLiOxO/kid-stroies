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

interface StoryLengthPlan {
  pageCount: number;
  sentenceGuide: string;
  summaryGuide: string;
}

/**
 * 调用 GLM 大模型生成童话故事
 * 返回结构化的分页故事内容
 */
export async function generateStory(input: StoryGenInput): Promise<StoryGenOutput> {
  const ageHint = input.age ? `${input.age}岁` : '小朋友';
  const lengthPlan = getStoryLengthPlan(input.age);

  const systemPrompt = `你是一位温暖而富有想象力的儿童文学作家，专长是为${ageHint}的孩子创作睡前童话。
你的故事需要具备以下特质：
1. 语言温暖、简洁，适合朗读，每句话不超过25个字
2. 将孩子的真实经历和困扰巧妙融入童话情节
3. 包含明确的积极教育目标，但不直白说教
4. 每篇故事严格输出${lengthPlan.pageCount}页，${lengthPlan.sentenceGuide}，有明确的故事起伏
5. 故事中主角就是孩子自己的名字"${input.childName}"

请严格按以下JSON格式回复，不要包含任何其他内容：
{
  "title": "故事标题（8-15字）",
  "summary": "故事摘要（${lengthPlan.summaryGuide}）",
  "pages": ${buildPageSchemaExample(lengthPlan.pageCount)}
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
    const parsed = parseGLMResponse(content, input, lengthPlan.pageCount);

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
function parseGLMResponse(content: string, input: StoryGenInput, targetPageCount: number): StoryGenOutput {
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
      pages: Array.isArray(parsed.pages) && parsed.pages.length > 0
        ? normalizeGeneratedPages(parsed.pages, input, targetPageCount)
        : buildFallbackPages(input, targetPageCount),
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
      const pages = buildPagesFromSentences(sentences, input, targetPageCount);

      return {
        title: input.explicitTitle || `${input.childName}的${input.theme}童话`,
        summary: cleanContent.slice(0, 60),
        pages,
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
  const { pageCount } = getStoryLengthPlan(input.age);

  return {
    title,
    summary: `围绕"${input.theme}"展开的${input.style}风格睡前童话，帮助孩子理解并练习${input.educationalGoal}。`,
    pages: buildFallbackPages(input, pageCount),
    images: generatePlaceholderImages(input),
    tags: { theme: input.theme, educationalGoal: input.educationalGoal, style: input.style, artStyle: input.artStyle },
    theme: input.theme,
    educationalGoal: input.educationalGoal,
  };
}

/**
 * 生成兜底分页内容
 */
function buildFallbackPages(input: StoryGenInput, pageCount: number): Array<{ page: number; text: string }> {
  const pages: Array<{ page: number; text: string }> = [
    {
      page: 1,
      text: `夜幕轻轻落下，${input.childName}抱着小枕头想着今天的事：${input.prompt}。窗边的月亮婆婆轻声说，今晚会有一场关于${input.theme}的温柔冒险。`,
    },
  ];

  const middleTemplates = [
    `${input.childName}来到一片会发光的森林，小露珠像星星一样闪亮。风铃鸟告诉他，只要愿意慢一点听听自己的心，就能找到前进的方向。`,
    `沿着银色小路往前走，${input.childName}遇见了一只皱着眉的小兔子。小兔子说自己也常常会紧张，于是两个小伙伴决定一起练习${input.educationalGoal}。`,
    `他们经过软绵绵的云桥时，桥下传来轻轻的水声。${input.childName}鼓起勇气迈出一步，发现原来难题不像想象中那么可怕。`,
    `不远处的萤火虫老师送来一盏小灯，说这盏灯会在心里亮起来。每当${input.childName}想到今天的困扰，就会记起自己已经在慢慢变勇敢。`,
    `后来，他们来到会唱歌的花园。花瓣一边摇晃，一边提醒${input.childName}，真正的力量不是一下子变完美，而是愿意一次次认真尝试。`,
    `一阵温暖的风吹过，${input.childName}忽然想起家人的笑脸。那份熟悉的安心，让他决定把关于${input.theme}的烦恼，变成新的练习机会。`,
    `在星光湖边，${input.childName}把心里的担心轻轻说给月亮听。湖面泛起一圈圈亮光，像在告诉他，每一点小小进步都值得被看见。`,
    `快到山顶时，${input.childName}已经学会先深呼吸，再认真观察。曾经让人犹豫的事，现在也能一步一步找到办法。`,
  ];

  const middleCount = Math.max(0, pageCount - 3);
  for (let index = 0; index < middleCount; index += 1) {
    pages.push({
      page: pages.length + 1,
      text: middleTemplates[index],
    });
  }

  pages.push({
    page: pages.length + 1,
    text: `当最后一道小考验来到眼前，${input.childName}没有像从前那样退缩。因为他已经明白，学会${input.educationalGoal}，就是把勇气一点点放进自己的心里。`,
  });

  pages.push({
    page: pages.length + 1,
    text: `当第一颗晨星亮起时，${input.childName}终于完成了这场冒险。回到家后，他轻轻对自己说：“明天我也可以做到。”这晚，他睡得格外香甜。`,
  });

  return pages.slice(0, pageCount).map((page, index) => ({
    page: index + 1,
    text: page.text,
  }));
}

/**
 * 根据年龄返回目标故事篇幅
 */
function getStoryLengthPlan(age?: number): StoryLengthPlan {
  if (!age || age <= 5) {
    return { pageCount: 6, sentenceGuide: '每页 3-4 句', summaryGuide: '40-70 字' };
  }

  if (age <= 8) {
    return { pageCount: 8, sentenceGuide: '每页 3-4 句', summaryGuide: '50-80 字' };
  }

  return { pageCount: 10, sentenceGuide: '每页 4-5 句', summaryGuide: '60-100 字' };
}

/**
 * 生成模型输出示例中的分页 JSON 结构
 */
function buildPageSchemaExample(pageCount: number): string {
  const pages = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    return `    { "page": ${page}, "text": "第${page}页故事内容..." }`;
  });

  return `[\n${pages.join(',\n')}\n  ]`;
}

/**
 * 规范化模型返回的分页结果，确保页数与目标一致
 */
function normalizeGeneratedPages(
  pages: Array<{ page: number; text: string }>,
  input: StoryGenInput,
  targetPageCount: number
): Array<{ page: number; text: string }> {
  const normalized = pages
    .map((page) => (typeof page.text === 'string' ? page.text.trim() : ''))
    .filter(Boolean)
    .slice(0, targetPageCount)
    .map((text, index) => ({ page: index + 1, text }));

  if (normalized.length >= targetPageCount) {
    return normalized;
  }

  const fallbackPages = buildFallbackPages(input, targetPageCount);
  return [
    ...normalized,
    ...fallbackPages.slice(normalized.length).map((page, index) => ({
      page: normalized.length + index + 1,
      text: page.text,
    })),
  ];
}

/**
 * 将纯文本回复切分成目标页数的分页内容
 */
function buildPagesFromSentences(
  sentences: string[],
  input: StoryGenInput,
  targetPageCount: number
): Array<{ page: number; text: string }> {
  const cleanSentences = sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (cleanSentences.length === 0) {
    return buildFallbackPages(input, targetPageCount);
  }

  const pageGroups: string[][] = Array.from({ length: targetPageCount }, () => []);
  cleanSentences.forEach((sentence, index) => {
    pageGroups[index % targetPageCount].push(sentence);
  });

  const nonEmptyPages = pageGroups
    .map((group, index) => ({
      page: index + 1,
      text: group.length > 0 ? `${group.join('。')}。` : '',
    }))
    .filter((page) => page.text);

  return normalizeGeneratedPages(nonEmptyPages, input, targetPageCount);
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
