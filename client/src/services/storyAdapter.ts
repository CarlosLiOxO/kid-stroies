import type { Story, StoryDTO, StoryPage } from '../types'

const STORY_PREVIEW_FALLBACK = '点击查看故事详情。'

/**
 * 统一把后端故事数据转换成前端展示模型
 */
export function normalizeStory(raw: StoryDTO): Story {
  const pages = parseStoryPages(raw.content)
  const images = parseStoryImages(raw.images)

  return {
    ...raw,
    pages,
    images,
    previewText: buildStoryPreview(pages),
  }
}

/**
 * 批量归一化故事数组
 */
export function normalizeStories(rawStories: StoryDTO[]): Story[] {
  return rawStories.map(normalizeStory)
}

function parseStoryPages(rawContent: string): StoryPage[] {
  if (!rawContent) {
    return []
  }

  try {
    const parsed = JSON.parse(rawContent) as unknown
    if (!Array.isArray(parsed)) {
      return fallbackStoryPage(rawContent)
    }

    const pages = parsed
      .map((item, index) => normalizeStoryPage(item, index))
      .filter((page): page is StoryPage => page !== null)

    return pages
  } catch {
    return fallbackStoryPage(rawContent)
  }
}

function normalizeStoryPage(item: unknown, index: number): StoryPage | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  const pageRecord = item as { page?: unknown; text?: unknown }
  if (typeof pageRecord.text !== 'string' || !pageRecord.text.trim()) {
    return null
  }

  return {
    page: typeof pageRecord.page === 'number' ? pageRecord.page : index + 1,
    text: pageRecord.text.trim(),
  }
}

function fallbackStoryPage(rawContent: string): StoryPage[] {
  const content = rawContent.trim()
  if (!content) {
    return []
  }

  return [
    {
      page: 1,
      text: content,
    },
  ]
}

function parseStoryImages(rawImages?: string[] | string | null): string[] {
  if (!rawImages) {
    return []
  }

  if (Array.isArray(rawImages)) {
    return rawImages.filter(isNonEmptyString)
  }

  try {
    const parsed = JSON.parse(rawImages) as unknown
    return Array.isArray(parsed) ? parsed.filter(isNonEmptyString) : []
  } catch {
    return []
  }
}

function buildStoryPreview(pages: StoryPage[]): string {
  const preview = pages
    .slice(0, 2)
    .map((page) => page.text)
    .filter(Boolean)
    .join(' ')
    .trim()

  return preview || STORY_PREVIEW_FALLBACK
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
