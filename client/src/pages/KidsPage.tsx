import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import storyService from '../services/storyService'
import type { Story } from '../types'

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
  const pages = selectedStory?.pages ?? []
  const currentPage = pages[pageIndex]
  const images = selectedStory?.images ?? []
  const currentImage = images[pageIndex] ?? images[0]

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
    <div className="fairy-shell">
      <div className="grid gap-6 lg:min-h-[calc(100vh-12rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="fairy-panel w-full p-5 lg:max-w-sm">
          <div className="mb-5 space-y-3 text-center">
            <span className="fairy-kicker">今晚故事剧场</span>
            <h1 className="text-3xl font-bold text-[#6d4c41]">我的故事</h1>
            <p className="text-sm leading-6 text-[#7d6d64]">挑一篇喜欢的故事，慢慢翻开今晚的月光书页。</p>
          </div>
          <Link
            className="btn-outline mb-5 flex w-full justify-center"
            to="/kids/favorites"
          >
            收藏与记录（{favorites.length}）
          </Link>
          {error ? <div className="fairy-message-error">{error}</div> : null}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2">
            {stories.map((story, index) => (
              <button
                className={`fairy-book-card p-4 text-center ${
                  selectedStoryId === story.id
                    ? 'border-[#d7c2ff] bg-[#2e2149] text-white shadow-[0_20px_45px_rgba(54,38,92,0.28)]'
                    : 'bg-white/82 text-[#625470] hover:border-[#d7c2ff]'
                }`}
                key={story.id}
                onClick={() => {
                  setSelectedStoryId(story.id)
                  setPageIndex(0)
                }}
                type="button"
              >
                <div className="fairy-book-cover mb-3 flex h-20 items-center justify-center rounded-2xl text-3xl">
                  {['🌙', '✨', '🦁', '🌈', '🚀', '🌊'][index % 6]}
                </div>
                <p className="text-sm font-semibold">{story.title}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="fairy-kids-stage flex-1">
          {!selectedStory || !currentPage ? (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[2rem] bg-white/10 text-center text-white/80">
              暂时还没有已推送的故事，请让家长先在故事库中完成推送。
            </div>
          ) : (
            <div className="flex h-full flex-col gap-6">
              <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="fairy-sticker-badge">今晚故事剧场</span>
                  <h2 className="mt-3 text-3xl font-bold text-white">{selectedStory.title}</h2>
                  <p className="mt-2 text-sm text-white/70">
                    第 {pageIndex + 1} / {pages.length} 页 · {selectedStory.theme ?? '睡前故事'}
                  </p>
                </div>
                <button className="btn-primary" onClick={handleSpeak} type="button">
                  朗读这一页
                </button>
              </header>

              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-outline"
                  onClick={handleToggleFavorite}
                  type="button"
                >
                  {favorites.includes(selectedStory.id) ? '取消收藏' : '收藏故事'}
                </button>
                {favorites.includes(selectedStory.id) ? (
                  <span className="fairy-sticker-badge">
                    已加入收藏
                  </span>
                ) : null}
              </div>

              <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="fairy-book-card overflow-hidden border-white/20 bg-white/10">
                  {currentImage ? (
                    <img
                      alt={selectedStory.title}
                      className="h-full min-h-[320px] w-full object-cover"
                      src={currentImage}
                    />
                  ) : (
                    <div className="flex h-full min-h-[320px] items-center justify-center text-7xl">📚</div>
                  )}
                </div>

                <article className="flex min-h-[320px] flex-col rounded-[2rem] border border-white/15 bg-white/10 p-6">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                    Page {currentPage.page}
                  </p>
                  <p className="flex-1 text-lg leading-10 text-white/92">{currentPage.text}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={pageIndex === 0}
                      onClick={() => handleTurnPage(Math.max(0, pageIndex - 1))}
                      type="button"
                    >
                      上一页
                    </button>
                    <button
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
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

export default KidsPage
