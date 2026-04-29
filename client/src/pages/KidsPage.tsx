import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import storyService from '../services/storyService'
import type { Story } from '../types'

type ReaderPage = {
  page: number
  text: string
}

/**
 * 儿童端 - 面向儿童的简化故事阅读界面
 * 展示已推送故事、支持翻页阅读和浏览器 TTS 朗读
 */
const KidsPage = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }
    try {
      return JSON.parse(window.localStorage.getItem('kid-favorites') ?? '[]') as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    /**
     * 拉取当前可阅读的故事
     */
    const loadStories = async () => {
      try {
        const data = await storyService.getStories()
        const pushedStories = data.filter((story) => story.isPushed)
        setStories(pushedStories)
        if (pushedStories[0]) {
          setSelectedStoryId(pushedStories[0].id)
          setPageIndex(0)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '加载故事失败'
        setError(message)
      }
    }

    void loadStories()
  }, [])

  const selectedStory = useMemo(
    () => stories.find((story) => story.id === selectedStoryId) ?? null,
    [selectedStoryId, stories]
  )
  const pages = useMemo(() => parseStoryPages(selectedStory?.content), [selectedStory?.content])
  const currentPage = pages[pageIndex]
  const images = useMemo(() => parseImages(selectedStory?.images), [selectedStory?.images])

  /**
   * 朗读当前页文本
   */
  const handleSpeak = () => {
    if (!currentPage?.text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentPage.text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  /**
   * 收藏或取消收藏故事
   */
  const handleToggleFavorite = () => {
    if (!selectedStory) {
      return
    }

    setFavorites((current) => {
      const next = current.includes(selectedStory.id)
        ? current.filter((item) => item !== selectedStory.id)
        : [...current, selectedStory.id]
      window.localStorage.setItem('kid-favorites', JSON.stringify(next))
      return next
    })
  }

  /**
   * 记录阅读进度
   */
  const handleTurnPage = (nextPageIndex: number) => {
    setPageIndex(nextPageIndex)
    if (!selectedStory || typeof window === 'undefined') {
      return
    }

    const record = {
      storyId: selectedStory.id,
      title: selectedStory.title,
      page: nextPageIndex + 1,
      readAt: new Date().toISOString(),
    }
    window.localStorage.setItem('kid-last-read', JSON.stringify(record))
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm lg:max-w-sm">
          <h1 className="mb-4 text-center text-3xl font-bold text-neutral-800">我的故事</h1>
          <p className="mb-5 text-center text-sm text-neutral-500">今天晚上，挑一篇喜欢的故事慢慢读吧。</p>
          <Link
            className="mb-5 block rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
            to="/kids/favorites"
          >
            收藏与记录（{favorites.length}）
          </Link>
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2">
            {stories.map((story, index) => (
              <button
                className={`rounded-2xl border p-4 text-center transition ${
                  selectedStoryId === story.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                }`}
                key={story.id}
                onClick={() => {
                  setSelectedStoryId(story.id)
                  setPageIndex(0)
                }}
                type="button"
              >
                <div className="mb-3 flex h-20 items-center justify-center rounded-2xl bg-white/70 text-3xl">
                  {['🌙', '✨', '🦁', '🌈', '🚀', '🌊'][index % 6]}
                </div>
                <p className="text-sm font-semibold">{story.title}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          {!selectedStory || !currentPage ? (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[2rem] bg-neutral-50 text-center text-neutral-500">
              暂时还没有已推送的故事，请让家长先在故事库中完成推送。
            </div>
          ) : (
            <div className="flex h-full flex-col gap-6">
              <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-800">{selectedStory.title}</h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    第 {pageIndex + 1} / {pages.length} 页 · {selectedStory.theme ?? '睡前故事'}
                  </p>
                </div>
                <button className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white" onClick={handleSpeak} type="button">
                  朗读这一页
                </button>
              </header>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700"
                  onClick={handleToggleFavorite}
                  type="button"
                >
                  {favorites.includes(selectedStory.id) ? '取消收藏' : '收藏故事'}
                </button>
                {favorites.includes(selectedStory.id) ? (
                  <span className="rounded-full bg-amber-100 px-4 py-3 text-sm font-medium text-amber-700">
                    已加入收藏
                  </span>
                ) : null}
              </div>

              <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="overflow-hidden rounded-[2rem] bg-neutral-100">
                  {images[pageIndex] || images[0] ? (
                    <img
                      alt={selectedStory.title}
                      className="h-full min-h-[320px] w-full object-cover"
                      src={images[pageIndex] ?? images[0]}
                    />
                  ) : (
                    <div className="flex h-full min-h-[320px] items-center justify-center text-7xl">📚</div>
                  )}
                </div>

                <article className="flex min-h-[320px] flex-col rounded-[2rem] border border-neutral-200 bg-neutral-50 p-6">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
                    Page {currentPage.page}
                  </p>
                  <p className="flex-1 text-lg leading-10 text-neutral-700">{currentPage.text}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={pageIndex === 0}
                      onClick={() => handleTurnPage(Math.max(0, pageIndex - 1))}
                      type="button"
                    >
                      上一页
                    </button>
                    <button
                      className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={pageIndex >= pages.length - 1}
                      onClick={() => handleTurnPage(Math.min(pages.length - 1, pageIndex + 1))}
                      type="button"
                    >
                      下一页
                    </button>
                  </div>
                </article>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * 解析故事分页内容
 */
function parseStoryPages(rawContent?: string): ReaderPage[] {
  if (!rawContent) {
    return []
  }

  try {
    const parsed = JSON.parse(rawContent) as ReaderPage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 解析故事插画数组
 */
function parseImages(rawImages?: string[] | string | null): string[] {
  if (!rawImages) {
    return []
  }
  if (Array.isArray(rawImages)) {
    return rawImages
  }

  try {
    const parsed = JSON.parse(rawImages) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default KidsPage
