import { useEffect, useMemo, useState } from 'react'
import storyService from '../services/storyService'
import type { Story } from '../types'

/**
 * 儿童端收藏与回看页面
 * 展示孩子收藏的故事和最近阅读记录
 */
const KidsFavoritesPage = () => {
  const [favorites, setFavorites] = useState<Story[]>([])
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites')
  const [error, setError] = useState('')

  useEffect(() => {
    /**
     * 加载已推送故事列表
     */
    const loadStories = async () => {
      try {
        const data = await storyService.getStories()
        const pushed = data.filter((story) => story.isPushed)
        setRecentStories(pushed)
        // 从 localStorage 读取收藏列表
        const savedIds = getFavoriteIds()
        setFavorites(pushed.filter((story) => savedIds.includes(story.id)))
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载故事失败')
      }
    }

    void loadStories()

    const handleStorage = () => {
      const savedIds = getFavoriteIds()
      storyService.getStories().then((data) => {
        const pushed = data.filter((story) => story.isPushed)
        setFavorites(pushed.filter((story) => savedIds.includes(story.id)))
      }).catch(() => {})
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const displayedStories = useMemo(
    () => (activeTab === 'favorites' ? favorites : recentStories),
    [activeTab, favorites, recentStories]
  )

  return (
    <div className="fairy-shell fairy-stack max-w-5xl">
      <section className="fairy-panel space-y-4 p-6 sm:p-7">
        <div className="space-y-3 text-center">
          <span className="fairy-kicker">回忆收藏册</span>
          <h1 className="text-3xl font-bold text-[#6d4c41]">我的收藏与记录</h1>
          <p className="fairy-subtitle">
            把喜欢的故事和最近翻开的书页，一起收进属于自己的小书匣里。
          </p>
        </div>
      </section>

      {error ? <p className="fairy-message-error">{error}</p> : null}

      <div className="flex flex-wrap justify-center gap-4">
        <button
          className={activeTab === 'favorites' ? 'fairy-bookmark-tab-active' : 'fairy-bookmark-tab'}
          onClick={() => setActiveTab('favorites')}
          type="button"
        >
          我的收藏（{favorites.length}）
        </button>
        <button
          className={activeTab === 'history' ? 'fairy-bookmark-tab-active' : 'fairy-bookmark-tab'}
          onClick={() => setActiveTab('history')}
          type="button"
        >
          阅读记录（{recentStories.length}）
        </button>
      </div>

      {displayedStories.length === 0 ? (
        <div className="fairy-empty flex min-h-[280px] items-center justify-center">
          {activeTab === 'favorites' ? '还没有收藏任何故事，在阅读时点击收藏即可。' : '暂无已推送的故事，请让家长在故事库中完成推送。'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {displayedStories.map((story, index) => {
            const image = parseImages(story.images)[0]
            return (
              <article className="fairy-memory-card" key={story.id}>
                <div className="fairy-book-cover h-44">
                  {image ? (
                    <img alt={story.title} className="h-full w-full object-cover" src={image} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      {['🌙', '✨', '🦁', '🌈', '🚀', '🌊'][index % 6]}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#6d4c41]">{story.title}</h3>
                    <span className="fairy-sticker-badge">
                      {activeTab === 'favorites' ? '收藏' : '回看'}
                    </span>
                  </div>
                  <p className="text-sm text-[#8f7d72]">
                    {story.theme ?? '睡前故事'} · {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                  {activeTab === 'history' ? (
                    <p className="text-xs text-[#8f7d72]">
                      {story.isPushed ? '📬 已推送到你的书架' : '📖 可阅读'}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8f7d72]">把喜欢的故事存成自己的回忆书签。</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem('kid-favorites')
    const parsed = JSON.parse(raw ?? '[]') as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseImages(rawImages?: string[] | string | null): string[] {
  if (!rawImages) return []
  if (Array.isArray(rawImages)) return rawImages
  try {
    const parsed = JSON.parse(rawImages) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default KidsFavoritesPage
