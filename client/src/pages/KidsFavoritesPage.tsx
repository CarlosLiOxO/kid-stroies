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
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-neutral-800">我的收藏与记录</h1>

        {error ? <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        {/* 标签切换 */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            className={`rounded-full px-8 py-3 text-base font-semibold transition ${activeTab === 'favorites' ? 'bg-neutral-900 text-white' : 'border border-neutral-300 bg-white text-neutral-700'}`}
            onClick={() => setActiveTab('favorites')}
            type="button"
          >
            我的收藏（{favorites.length}）
          </button>
          <button
            className={`rounded-full px-8 py-3 text-base font-semibold transition ${activeTab === 'history' ? 'bg-neutral-900 text-white' : 'border border-neutral-300 bg-white text-neutral-700'}`}
            onClick={() => setActiveTab('history')}
            type="button"
          >
            阅读记录（{recentStories.length}）
          </button>
        </div>

        {displayedStories.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-neutral-200 bg-white text-neutral-500">
            {activeTab === 'favorites' ? '还没有收藏任何故事，在阅读时点击收藏即可。' : '暂无已推送的故事，请让家长在故事库中完成推送。'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {displayedStories.map((story, index) => {
              const image = parseImages(story.images)[0]
              return (
                <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm" key={story.id}>
                  <div className="h-44 bg-neutral-100">
                    {image ? (
                      <img alt={story.title} className="h-full w-full object-cover" src={image} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        {['🌙', '✨', '🦁', '🌈', '🚀', '🌊'][index % 6]}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-neutral-800">{story.title}</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      {story.theme ?? '睡前故事'} · {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                    {activeTab === 'history' ? (
                      <p className="mt-2 text-xs text-neutral-400">
                        {story.isPushed ? '📬 已推送到你的书架' : '📖 可阅读'}
                      </p>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
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
