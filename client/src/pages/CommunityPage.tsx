import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import storyService from '../services/storyService'
import { useAuthStore } from '../stores/authStore'
import type { Story } from '../types'

/**
 * 社区页 - 故事分享社区
 * 浏览其他家长分享的公开故事并支持下载
 */
const CommunityPage = () => {
  const user = useAuthStore((state) => state.user)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)

  const [stories, setStories] = useState<Story[]>([])
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [ageFilter, setAgeFilter] = useState('all')
  const [themeFilter, setThemeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    /**
     * 拉取公开社区故事
     */
    const loadCommunityStories = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await storyService.getStories({ isPublic: 'true' })
        setStories(data)
      } catch (err) {
        const msg = err instanceof Error ? err.message : '加载社区故事失败'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }

    void loadCommunityStories()
  }, [])

  const filteredStories = useMemo(() => {
    const result = stories.filter((story) => {
      const matchesKeyword =
        !keyword ||
        story.title.includes(keyword) ||
        (story.summary ?? '').includes(keyword) ||
        (story.theme ?? '').includes(keyword)

      const matchesTheme = themeFilter === 'all' || story.theme === themeFilter
      const matchesAge = ageFilter === 'all' || story.ageRange === ageFilter

      return matchesKeyword && matchesTheme && matchesAge
    })

    return [...result].sort((left, right) => {
      if (sortBy === 'popular') {
        return (right.downloadCount ?? 0) - (left.downloadCount ?? 0)
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }, [ageFilter, keyword, sortBy, stories, themeFilter])

  const themeOptions = useMemo(() => {
    return ['all', ...new Set(stories.map((story) => story.theme).filter(Boolean) as string[])]
  }, [stories])
  const ageOptions = useMemo(() => {
    return ['all', ...new Set(stories.map((story) => story.ageRange).filter(Boolean) as string[])]
  }, [stories])

  /**
   * 下载社区故事
   */
  const handleDownload = async (story: Story) => {
    setMessage('')
    setError('')
    try {
      await storyService.downloadStory(story.id)
      await refreshProfile()
      setStories((current) =>
        current.map((item) =>
          item.id === story.id
            ? {
                ...item,
                downloadCount: (item.downloadCount ?? 0) + 1,
              }
            : item
        )
      )
      setMessage(`《${story.title}》已加入你的故事库，已同步扣除 Token。`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '下载故事失败'
      setError(msg)
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title mb-2">故事社区</h1>
          <p className="text-amber-700">探索其他家长分享的公开故事，找到灵感后也可以下载到自己的故事库。</p>
        </div>
        <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
          我的余额：{user?.tokens ?? 0} Token
        </div>
      </div>

      <section className="story-card p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            className="input-field"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索主题、标题或教育目标"
            value={keyword}
          />
          <select className="input-field" onChange={(event) => setAgeFilter(event.target.value)} value={ageFilter}>
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age === 'all' ? '全部年龄段' : age}
              </option>
            ))}
          </select>
          <select className="input-field" onChange={(event) => setThemeFilter(event.target.value)} value={themeFilter}>
            {themeOptions.map((theme) => (
              <option key={theme} value={theme}>
                {theme === 'all' ? '全部主题' : theme}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            onChange={(event) => setSortBy(event.target.value as 'latest' | 'popular')}
            value={sortBy}
          >
            <option value="latest">按时间排序</option>
            <option value="popular">按热度排序</option>
          </select>
        </div>
      </section>

      {message ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      {isLoading ? (
        <div className="story-card p-8 text-center text-gray-500">社区故事加载中...</div>
      ) : filteredStories.length === 0 ? (
        <div className="story-card p-8 text-center text-gray-500">暂时没有匹配的公开故事。</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredStories.map((story) => {
            const preview = parseStoryPreview(story.content)
            const image = parseImages(story.images)[0]
            return (
              <article className="story-card overflow-hidden" key={story.id}>
                <div className="h-48 bg-amber-100">
                  {image ? (
                    <img alt={story.title} className="h-full w-full object-cover" src={image} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">✨</div>
                  )}
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-amber-800">
                        <Link className="hover:text-amber-600 hover:underline" to={`/stories/${story.id}`}>{story.title}</Link>
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {story.user ? (
                          <span className="flex items-center gap-1">
                            <span>👤 {story.user.name}</span>
                            <span className="text-gray-300">·</span>
                          </span>
                        ) : null}
                        {story.theme ?? '成长主题'} · {story.educationalGoal ?? '睡前陪伴'}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {story.downloadCount ?? 0} 次下载
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-gray-600">{preview}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {story.style ?? '睡前'}
                    </span>
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                      {story.artStyle ?? '水彩'}
                    </span>
                  </div>
                  <button className="btn-primary w-full" onClick={() => void handleDownload(story)} type="button">
                    下载完整故事（6 Token）
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * 解析故事预览内容
 */
function parseStoryPreview(content: string): string {
  try {
    const pages = JSON.parse(content) as Array<{ text?: string }>
    return pages.slice(0, 2).map((page) => page.text).filter(Boolean).join(' ')
  } catch {
    return content
  }
}

/**
 * 解析图片数组
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

export default CommunityPage
