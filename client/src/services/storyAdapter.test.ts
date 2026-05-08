import { describe, expect, it } from 'vitest'
import type { StoryDTO } from '../types'
import { normalizeStory } from './storyAdapter'

const baseStory: StoryDTO = {
  id: 'story-1',
  userId: 'user-1',
  childId: 'child-1',
  title: '小月亮和星星邮差',
  content: JSON.stringify([
    { page: 1, text: '第一页内容' },
    { page: 2, text: '第二页内容' },
  ]),
  summary: null,
  style: '睡前',
  artStyle: '水彩',
  images: JSON.stringify(['https://example.com/cover.png']),
  tags: null,
  ageRange: '3-6',
  theme: '勇气',
  educationalGoal: '建立安全感',
  isPublic: true,
  isPushed: false,
  pushedAt: null,
  downloadCount: 0,
  createdAt: '2026-05-08T00:00:00.000Z',
  updatedAt: '2026-05-08T00:00:00.000Z',
}

describe('normalizeStory', () => {
  it('把分页 JSON 与图片字符串统一转换为展示模型', () => {
    const story = normalizeStory(baseStory)

    expect(story.pages).toEqual([
      { page: 1, text: '第一页内容' },
      { page: 2, text: '第二页内容' },
    ])
    expect(story.images).toEqual(['https://example.com/cover.png'])
    expect(story.previewText).toBe('第一页内容 第二页内容')
  })

  it('在 content 不是合法 JSON 时回退为单页正文', () => {
    const story = normalizeStory({
      ...baseStory,
      content: '这是一段旧格式正文',
      images: null,
    })

    expect(story.pages).toEqual([{ page: 1, text: '这是一段旧格式正文' }])
    expect(story.images).toEqual([])
    expect(story.previewText).toBe('这是一段旧格式正文')
  })

  it('过滤空图片并在正文缺失时返回统一兜底文案', () => {
    const story = normalizeStory({
      ...baseStory,
      content: JSON.stringify([{ page: 1, text: '   ' }]),
      images: ['https://example.com/1.png', '', '   '],
    })

    expect(story.pages).toEqual([])
    expect(story.images).toEqual(['https://example.com/1.png'])
    expect(story.previewText).toBe('点击查看故事详情。')
  })
})
