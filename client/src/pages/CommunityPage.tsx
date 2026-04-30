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
    <div className="fairy-shell fairy-stack">
      <section className="fairy-hero space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="fairy-kicker">故事集市</span>
            <h1 className="fairy-title">逛逛别的家长分享的灵感，把喜欢的故事带回自己的书架</h1>
            <p className="fairy-subtitle max-w-2xl">
              浏览公开故事、发现主题灵感和教育表达，遇到喜欢的故事时，可以一键下载回自己的故事库。
            </p>
          </div>
          <div className="fairy-token-pill">我的余额：{user?.tokens ?? 0} Token</div>
        </div>
      </section>

      <section className="fairy-filter-bar">
        <div className="mb-4">
          <h2 className="fairy-section-title">探索灵感</h2>
          <p className="fairy-subtitle mt-2">按年龄、主题和热度筛选社区里正在流动的故事灵感。</p>
        </div>
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

      {message ? <div className="fairy-message-success">{message}</div> : null}
      {error ? <div className="fairy-message-error">{error}</div> : null}

      {isLoading ? (
        <div className="fairy-empty">社区故事加载中...</div>
      ) : filteredStories.length === 0 ? (
        <div className="fairy-empty">暂时没有匹配的公开故事。</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredStories.map((story) => {
            const preview = parseStoryPreview(story.content)
            const image = parseImages(story.images)[0]
            return (
              <article className="fairy-book-card" key={story.id}>
                <Link
                  aria-label={`查看社区故事详情：${story.title}`}
                  className="block transition-opacity duration-200 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#d9c3ff]"
                  to={`/stories/${story.id}`}
                >
                  <div className="fairy-book-cover relative h-52">
                    <div className="absolute right-4 top-4 z-10">
                      <span className="fairy-chip-warm">{sortBy === 'popular' ? '热门' : '新分享'}</span>
                    </div>
                    {image ? (
                      <img alt={story.title} className="h-full w-full object-cover" src={image} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">✨</div>
                    )}
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-[#6d4c41] hover:text-[#b7773a]">{story.title}</h2>
                        <p className="mt-1 text-sm text-[#9a887d]">
                          {story.user?.name ? `分享者：${story.user.name}` : '社区家长分享'}
                        </p>
                        <p className="mt-2 text-sm text-[#7d6d64]">
                          {story.theme ?? '成长主题'} · {story.educationalGoal ?? '睡前陪伴'}
                        </p>
                      </div>
                      <span className="fairy-chip-lilac">
                        {story.downloadCount ?? 0} 次下载
                      </span>
                    </div>
                    <p className="line-clamp-4 text-sm leading-7 text-[#7d6d64]">{preview}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="fairy-chip-lilac">{story.style ?? '睡前'}</span>
                      <span className="fairy-chip-rose">{story.artStyle ?? '水彩'}</span>
                    </div>
                  </div>
                </Link>
                <div className="px-6 pb-6">
                  <button className="btn-primary w-full" onClick={() => void handleDownload(story)} type="button">
                    带回我的故事库（6 Token）
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
