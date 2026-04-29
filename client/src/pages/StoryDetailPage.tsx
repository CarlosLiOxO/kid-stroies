import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import storyService from '../services/storyService'
import { useStoryStore } from '../stores/storyStore'
import { useAuthStore } from '../stores/authStore'
import type { Story } from '../types'

type ReaderPage = {
  page: number
  text: string
}

/**
 * 故事详情页 - 完整阅读体验
 * 展示故事全部内容、插画、作者信息，支持从社区下载和推送到孩子端
 */
const StoryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { pushStory } = useStoryStore()

  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadMessage, setDownloadMessage] = useState('')

  useEffect(() => {
    const loadStory = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await storyService.getStory(id)
        setStory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载故事失败')
      } finally {
        setIsLoading(false)
      }
    }
    void loadStory()
  }, [id])

  const pages = useMemo(() => parseStoryPages(story?.content), [story?.content])
  const images = useMemo(() => parseImages(story?.images), [story?.images])
  const currentPage = pages[pageIndex]
  const isOwnStory = story?.userId === user?.id

  /**
   * 朗读当前页
   */
  const handleSpeak = () => {
    if (!currentPage?.text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentPage.text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  /**
   * 推送到孩子端
   */
  const handlePush = async () => {
    if (!story) return
    await pushStory(story.id)
    setStory((prev) => (prev ? { ...prev, isPushed: true } : prev))
  }

  /**
   * 下载社区故事
   */
  const handleDownload = async () => {
    if (!story || isDownloading) return
    setIsDownloading(true)
    setDownloadMessage('')
    try {
      const result = await storyService.downloadStory(story.id)
      setStory(result)
      setDownloadMessage('故事下载成功，可以随时查看了')
    } catch (err) {
      setDownloadMessage(err instanceof Error ? err.message : '下载失败，请稍后再试')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-500">故事加载中...</p>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="page-container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-red-500">{error || '故事不存在'}</p>
        <button className="btn-outline" onClick={() => navigate(-1)} type="button">返回上一页</button>
      </div>
    )
  }

  return (
    <div className="page-container max-w-5xl space-y-6">
      {/* 标题与作者信息 */}
      <header className="story-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-800">{story.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {story.user ? (
                <span className="flex items-center gap-1">
                  <span className="text-base">👤</span>
                  {story.user.name}
                </span>
              ) : null}
              {story.child ? (
                <span>
                  📖 为 <span className="font-medium text-purple-600">{story.child.name}</span> 创作
                </span>
              ) : null}
              <span>{new Date(story.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700">
                {story.style ?? '睡前'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {story.theme ? <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">主题：{story.theme}</span> : null}
              {story.educationalGoal ? <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">目标：{story.educationalGoal}</span> : null}
              {story.ageRange ? <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">适龄 {story.ageRange}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isOwnStory && !story.isPushed ? (
              <button className="btn-secondary text-sm" onClick={() => void handlePush()} type="button">推送到孩子端</button>
            ) : null}
            {isOwnStory ? (
              <Link className="btn-outline text-center text-sm" to="/stories">回到故事库</Link>
            ) : story.isPublic ? (
              <button className="btn-primary text-sm" disabled={isDownloading} onClick={() => void handleDownload()} type="button">
                {isDownloading ? '下载中...' : '下载完整故事'}
              </button>
            ) : null}
          </div>
        </div>

        {downloadMessage ? (
          <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${downloadMessage.includes('成功') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {downloadMessage}
          </p>
        ) : null}

        {story.summary ? (
          <p className="mt-5 rounded-2xl bg-amber-50 p-5 text-sm leading-7 text-amber-800">{story.summary}</p>
        ) : null}
      </header>

      {/* 阅读区 */}
      {!currentPage ? (
        <div className="story-card flex min-h-[420px] items-center justify-center p-8 text-gray-400">暂无故事内容</div>
      ) : (
        <div className="story-card overflow-hidden p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold tracking-[0.3em] text-gray-400 uppercase">
              第 {pageIndex + 1} / {pages.length} 页
            </p>
            <button className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200" onClick={handleSpeak} type="button">
              朗读这一页
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-2xl bg-amber-50">
              {images[pageIndex] || images[0] ? (
                <img
                  alt={`${story.title} 第${pageIndex + 1}页`}
                  className="h-full min-h-[220px] sm:min-h-[350px] w-full object-cover"
                  src={images[pageIndex] ?? images[0]}
                />
              ) : (
                <div className="flex h-full min-h-[220px] sm:min-h-[350px] items-center justify-center text-5xl sm:text-7xl">📚</div>
              )}
            </div>
            <article className="flex flex-col rounded-2xl bg-amber-50/50 p-6">
              <p className="text-lg leading-10 text-gray-700">{currentPage.text}</p>
            </article>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
              type="button"
            >
              上一页
            </button>
            <span className="text-sm text-gray-400">第 {pageIndex + 1} 页 / 共 {pages.length} 页</span>
            <button
              className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pageIndex >= pages.length - 1}
              onClick={() => setPageIndex((current) => Math.min(pages.length - 1, current + 1))}
              type="button"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function parseStoryPages(rawContent?: string): ReaderPage[] {
  if (!rawContent) return []
  try {
    const parsed = JSON.parse(rawContent) as ReaderPage[]
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

export default StoryDetailPage
