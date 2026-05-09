import type { Child } from '../../types'

/** 采访步骤 */
export type InterviewStep = 'child' | 'incident' | 'goal' | 'style' | 'artStyle' | 'summary'

/** 采访消息角色 */
export type InterviewRole = 'ai' | 'user'

/** 采访消息 */
export interface InterviewMessage {
  /** 消息唯一标识 */
  id: string
  /** 消息角色 */
  role: InterviewRole
  /** 消息正文 */
  text: string
}

/** 采访过程中的槽位状态 */
export interface InterviewState {
  /** 这次要为哪个孩子生成故事 */
  childId: string
  /** 今天发生的事情 */
  incident: string
  /** 成长目标 */
  educationalGoal: string
  /** 故事风格 */
  style: string
  /** 插画风格 */
  artStyle: string
  /** 是否同步到社区 */
  isPublic: boolean
}

export const STORY_STYLE_OPTIONS = ['睡前', '冒险', '治愈', '教育'] as const
export const ART_STYLE_OPTIONS = ['水彩', '卡通', '油画', '梦幻'] as const

const DEFAULT_STYLE = STORY_STYLE_OPTIONS[0]
const DEFAULT_ART_STYLE = ART_STYLE_OPTIONS[0]

/** 创建采访默认状态 */
export function createInitialInterviewState(): InterviewState {
  return {
    childId: '',
    incident: '',
    educationalGoal: '',
    style: DEFAULT_STYLE,
    artStyle: DEFAULT_ART_STYLE,
    isPublic: false,
  }
}

/** 生成采访开场白 */
export function getOpeningMessages(children: Child[], selectedChild: Child | null): InterviewMessage[] {
  if (children.length === 0) {
    return [
      createAiMessage('还没找到孩子档案，我们先去添加一个小主角，再回来开始今晚的故事采访吧。'),
    ]
  }

  if (children.length === 1 && selectedChild) {
    const opening = pickTemplate(
      [
        `今晚我想先认识一下 ${selectedChild.name} 的小心事。和我说说，今天有什么想慢慢聊成故事的小瞬间吧？`,
        `好呀，今晚这场睡前采访就先陪着 ${selectedChild.name}。今天发生了什么小事，想让我帮你轻轻织进故事里呢？`,
        `今晚我来当你的睡前故事采访官，先陪陪 ${selectedChild.name}。和我说说，今天有什么小事想慢慢聊成故事吧？`,
      ],
      selectedChild.name
    )

    return [
      createAiMessage(opening),
    ]
  }

  const prompt = pickTemplate(
    [
      '今晚想把这段小故事送给哪位小朋友呀？你可以点点名字，也可以直接告诉我。',
      '这次我们先来确认一下，今晚的故事主角会是哪位小朋友呢？',
      '先让我认识一下今晚的小主角吧，你想把这篇故事写给谁呢？',
    ],
    children.map((child) => child.name).join('|')
  )

  return [
    createAiMessage(prompt),
  ]
}

/** 获取每一步的 AI 提问 */
export function getStepPrompt(step: InterviewStep, childName?: string | null, seedText = ''): string {
  switch (step) {
    case 'child':
      return pickTemplate(
        [
          '今晚想把这段小故事送给哪位小朋友呀？',
          '先告诉我，今晚这篇故事最想写给谁呢？',
          '我们先确认一下，今晚的小主角会是哪位小朋友呀？',
        ],
        seedText || childName || 'child'
      )
    case 'incident':
      return pickTemplate(
        [
          `好呀，那今晚就先陪陪${childName ? ` ${childName}` : '这位小朋友'}。今天发生了什么小事，或者最近有什么想写进故事里的瞬间呢？`,
          `收到，那我们今晚就围着${childName ? ` ${childName}` : '这位小朋友'}来慢慢聊。今天有没有什么小事，特别想被写进故事里呢？`,
          `太好了，那这篇故事就先送给${childName ? ` ${childName}` : '这位小朋友'}。最近有什么小烦恼、小进步，或者想被轻轻接住的瞬间吗？`,
        ],
        childName || 'incident'
      )
    case 'goal':
      return pickTemplate(
        [
          '那这次你最想借故事轻轻陪 TA 练习什么，或者缓解哪种小情绪呢？',
          '那今晚这篇故事里，你最想悄悄帮 TA 学会什么呀？',
          '如果把这篇故事当作温柔提醒，你最希望它陪 TA 练习哪件事呢？',
        ],
        seedText || childName || 'goal'
      )
    case 'style':
      return pickTemplate(
        [
          '接下来想让我把这篇故事写得更温柔哄睡一点，还是带一点小冒险的勇气呢？',
          '这次故事的口吻，你更想要轻轻哄睡的感觉，还是多一点勇敢出发的小冒险？',
          '那故事气质这边，你更想让我写得柔软安静一点，还是更有一点小冒险的亮光呢？',
        ],
        seedText || childName || 'style'
      )
    case 'artStyle':
      return pickTemplate(
        [
          '如果把今晚故事摊开成绘本，你更想看到水彩般柔柔的画面，还是更可爱一点的卡通风呢？',
          '要是把这个故事翻成一本小绘本，你更喜欢柔柔的水彩感，还是更俏皮一点的卡通感呢？',
          '最后帮我挑一下画面吧。要是把这个故事摊开成绘本，你更想看到柔柔的水彩，还是更可爱一点的卡通风呢？',
        ],
        seedText || childName || 'artStyle'
      )
    case 'summary':
      return '我已经把这次采访整理好啦，看看这份故事设定对不对。'
  }
}

/** 根据当前步骤返回快捷建议 */
export function getStepSuggestions(step: InterviewStep, children: Child[]): string[] {
  switch (step) {
    case 'child':
      return children.map((child) => child.name)
    case 'incident':
      return ['今天不想刷牙', '睡前不愿关灯', '和朋友闹别扭']
    case 'goal':
      return ['建立刷牙习惯', '更勇敢表达', '学会分享']
    case 'style':
      return [...STORY_STYLE_OPTIONS]
    case 'artStyle':
      return [...ART_STYLE_OPTIONS]
    case 'summary':
      return []
  }
}

/** 匹配用户输入的孩子 */
export function findChildByInput(children: Child[], input: string): Child | null {
  const normalized = normalizeInput(input)
  if (!normalized) {
    return null
  }

  return (
    children.find((child) => normalizeInput(child.name) === normalized) ??
    children.find((child) => normalizeInput(child.name).includes(normalized)) ??
    null
  )
}

/** 归一化故事风格 */
export function normalizeStoryStyle(input: string): string {
  if (matchByKeyword(input, ['冒险', '勇敢', '探索'])) {
    return '冒险'
  }
  if (matchByKeyword(input, ['治愈', '温柔', '安抚', '陪伴'])) {
    return '治愈'
  }
  if (matchByKeyword(input, ['教育', '成长', '习惯', '引导'])) {
    return '教育'
  }
  return '睡前'
}

/** 归一化插画风格 */
export function normalizeArtStyle(input: string): string {
  if (matchByKeyword(input, ['卡通', '可爱'])) {
    return '卡通'
  }
  if (matchByKeyword(input, ['油画', '厚涂'])) {
    return '油画'
  }
  if (matchByKeyword(input, ['梦幻', '星空', '奇幻'])) {
    return '梦幻'
  }
  return '水彩'
}

/** 构建事件后的温柔承接语 */
export function buildIncidentFollowUp(incident: string): string {
  const highlight = extractHighlight(incident)
  return pickTemplate(
    [
      `收到啦，今晚我们就把${highlight}这件小烦恼，慢慢聊成一个温柔故事。`,
      `我接住这个小线索啦，原来今晚想围着${highlight}，给孩子织一篇故事。`,
      `嗯嗯，我记下啦，今晚想先陪陪${highlight}这件小心事。`,
    ],
    incident
  )
}

/** 构建成长目标后的温柔承接语 */
export function buildGoalFollowUp(goal: string): string {
  const highlight = extractHighlight(goal)
  return pickTemplate(
    [
      `我接住啦，这次故事想悄悄帮 TA 练习${highlight}。`,
      `明白了，那今晚这篇故事就轻轻朝着${highlight}这个方向去陪伴 TA。`,
      `好呀，我记住这个目标了，今晚我们就把重点放在${highlight}上。`,
    ],
    goal
  )
}

/** 构建故事风格后的温柔承接语 */
export function buildStyleFollowUp(style: string): string {
  return pickTemplate(
    [
      `好呀，那我会把语气写得更偏“${style}”一点。`,
      `收到，这次我会把整篇故事写得更靠近“${style}”这份感觉。`,
      `好呀，那今晚的语气就往“${style}”这边轻轻靠近。`,
    ],
    style
  )
}

/** 构建摘要阶段的自然总结 */
export function buildSummaryNarration(state: InterviewState, childName?: string | null): string {
  const childLabel = childName ?? '这位小朋友'
  const incident = extractHighlight(state.incident)
  const goal = extractHighlight(state.educationalGoal)
  const seed = `${childLabel}-${state.incident}-${state.educationalGoal}-${state.style}-${state.artStyle}`

  return pickTemplate(
    [
      `我来确认一下：今晚是写给${childLabel}的，我们会围绕${incident}这件小烦恼，用更偏${state.style}的口吻，把它写成一篇帮助${goal}的${state.artStyle}绘本。`,
      `让我轻轻复述一遍：这篇故事会送给${childLabel}，主题是${incident}，我会用更偏${state.style}的语气，把它写成一篇帮助${goal}的${state.artStyle}绘本。`,
      `我先和你对一对：今晚的故事主角是${childLabel}，线索会围着${incident}展开，整体口吻偏${state.style}，最后会变成一篇帮助${goal}的${state.artStyle}绘本。`,
    ],
    seed
  )
}

/** 创建一条 AI 消息 */
export function createAiMessage(text: string): InterviewMessage {
  return createMessage('ai', text)
}

/** 创建一条用户消息 */
export function createUserMessage(text: string): InterviewMessage {
  return createMessage('user', text)
}

/** 创建通用消息对象 */
function createMessage(role: InterviewRole, text: string): InterviewMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  }
}

/** 标准化输入内容 */
function normalizeInput(input: string): string {
  return input.trim().toLowerCase()
}

/** 按关键词匹配风格 */
function matchByKeyword(input: string, keywords: string[]): boolean {
  const normalized = input.trim()
  return keywords.some((keyword) => normalized.includes(keyword))
}

/** 根据稳定 seed 选择固定轮换模板 */
function pickTemplate(options: string[], seed: string): string {
  if (options.length === 0) {
    return ''
  }

  const normalized = seed.trim()
  if (!normalized) {
    return options[0]
  }

  const score = Array.from(normalized).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0)
  return options[score % options.length]
}

/** 从用户回答中提炼适合复述的亮点短语 */
function extractHighlight(input: string): string {
  const normalized = input.trim()
  if (!normalized) {
    return '今晚的小心事'
  }

  const firstSentence = normalized.split(/[，。！？!?,]/)[0]?.trim() ?? normalized
  return firstSentence.length > 18 ? `${firstSentence.slice(0, 18)}...` : firstSentence
}
