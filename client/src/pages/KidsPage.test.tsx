import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import KidsPage from './KidsPage'

const getStoriesMock = vi.fn()
const speakMock = vi.fn()
const cancelMock = vi.fn()

vi.mock('../services/storyService', () => ({
  default: {
    getStories: (...args: unknown[]) => getStoriesMock(...args),
  },
}))

describe('KidsPage', () => {
  beforeEach(() => {
    getStoriesMock.mockReset()
    speakMock.mockReset()
    cancelMock.mockReset()
    window.localStorage.clear()
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: function MockSpeechSynthesisUtterance(this: { text: string; lang?: string; rate?: number }, text: string) {
        this.text = text
      },
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: speakMock,
        cancel: cancelMock,
      },
      configurable: true,
      writable: true,
    })
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      value: window.SpeechSynthesisUtterance,
      configurable: true,
      writable: true,
    })
  })

  it('支持加载已推送故事、翻页、收藏与朗读当前页', async () => {
    getStoriesMock.mockResolvedValueOnce([
      {
        id: 'story-1',
        title: '月亮剧场的晚安信',
        content: JSON.stringify([
          { page: 1, text: '第一页的晚安故事。' },
          { page: 2, text: '第二页的月光悄悄落下来。' },
        ]),
        summary: '一篇给孩子的睡前故事。',
        theme: '睡前故事',
        createdAt: '2026-04-30T00:00:00.000Z',
        isPublic: false,
        isPushed: true,
        images: JSON.stringify([]),
      },
      {
        id: 'story-2',
        title: '不会展示的未推送故事',
        content: JSON.stringify([{ page: 1, text: '不该出现。' }]),
        summary: '未推送',
        theme: '测试',
        createdAt: '2026-04-30T00:00:00.000Z',
        isPublic: false,
        isPushed: false,
        images: JSON.stringify([]),
      },
    ])

    render(
      <BrowserRouter>
        <KidsPage />
      </BrowserRouter>
    )

    expect(await screen.findByRole('heading', { name: '月亮剧场的晚安信' })).toBeInTheDocument()
    expect(screen.queryByText('不会展示的未推送故事')).not.toBeInTheDocument()
    expect(screen.getByText('第 1 / 2 页 · 睡前故事')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '收藏与记录（0）' })).toHaveAttribute('href', '/kids/favorites')

    fireEvent.click(screen.getByRole('button', { name: '下一页' }))

    await waitFor(() => {
      expect(screen.getByText('第 2 / 2 页 · 睡前故事')).toBeInTheDocument()
    })
    expect(window.localStorage.getItem('kid-last-read')).toContain('"page":2')

    fireEvent.click(screen.getByRole('button', { name: '收藏故事' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '取消收藏' })).toBeInTheDocument()
    })
    expect(window.localStorage.getItem('kid-favorites')).toBe(JSON.stringify(['story-1']))
    expect(screen.getByRole('link', { name: '收藏与记录（1）' })).toHaveAttribute('href', '/kids/favorites')

    fireEvent.click(screen.getByRole('button', { name: '朗读这一页' }))

    expect(cancelMock).toHaveBeenCalledTimes(1)
    expect(speakMock).toHaveBeenCalledTimes(1)
  })
})
