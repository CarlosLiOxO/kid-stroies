import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import storyService from '../services/storyService'
import { useStoryStore } from '../stores/storyStore'
import { useAuthStore } from '../stores/authStore'
import type { Story } from '../types'

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

  const pages = story?.pages ?? []
  const images = story?.images ?? []
  const currentPage = pages[pageIndex]
  const isOwnStory = story?.userId === user?.id
  const pageImage = images[pageIndex] ?? images[0]

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
      <div className="fairy-shell">
        <div className="fairy-empty flex min-h-[60vh] items-center justify-center text-base">故事加载中...</div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="fairy-shell">
        <div className="fairy-empty flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="fairy-message-error max-w-xl text-center">{error || '故事不存在'}</p>
          <button className="btn-outline" onClick={() => navigate(-1)} type="button">返回上一页</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fairy-shell fairy-stack max-w-6xl">
      <header className="fairy-hero space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="fairy-kicker">绘本阅读台</span>
            <div className="space-y-3">
              <h1 className="fairy-title text-3xl md:text-4xl">{story.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#8f7d72]">
                <span>{new Date(story.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {story.user ? (
                  <span className="flex items-center gap-1">
                    <span>👤</span>
                    {story.user.name}
                  </span>
                ) : null}
                {story.child ? (
                  <span>
                    为 <span className="font-semibold text-[#7b57c8]">{story.child.name}</span> 创作
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="fairy-chip-warm">{story.style ?? '睡前'}</span>
              {story.theme ? <span className="fairy-chip-lilac">主题：{story.theme}</span> : null}
              {story.educationalGoal ? <span className="fairy-chip-rose">目标：{story.educationalGoal}</span> : null}
              {story.ageRange ? <span className="fairy-chip-sky">适龄 {story.ageRange}</span> : null}
            </div>

            {story.summary ? (
              <p className="fairy-surface-muted max-w-3xl text-sm leading-7 text-[#6d5d54]">{story.summary}</p>
            ) : null}
          </div>

          <div className="fairy-action-row">
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
          <p className={downloadMessage.includes('成功') ? 'fairy-message-success' : 'fairy-message-error'}>
            {downloadMessage}
          </p>
        ) : null}
      </header>

      {!currentPage ? (
        <div className="fairy-empty flex min-h-[420px] items-center justify-center">暂无故事内容</div>
      ) : (
        <section className="fairy-reader-stage">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <p className="fairy-kicker">第 {pageIndex + 1} / {pages.length} 页</p>
              <p className="text-sm text-[#8f7d72]">翻开这一页，继续今晚的童话旅程。</p>
            </div>
            <button className="btn-outline" onClick={handleSpeak} type="button">
              朗读这一页
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="fairy-book-card overflow-hidden">
              {pageImage ? (
                <img
                  alt={`${story.title} 第${pageIndex + 1}页`}
                  className="h-full min-h-[240px] w-full object-cover sm:min-h-[360px]"
                  src={pageImage}
                />
              ) : (
                <div className="fairy-book-cover flex h-full min-h-[240px] items-center justify-center text-5xl sm:min-h-[360px] sm:text-7xl">
                  📚
                </div>
              )}
            </div>

            <article className="fairy-surface-muted flex min-h-[240px] flex-col justify-between sm:min-h-[360px]">
              <div>
                <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-[#b68a63] uppercase">
                  正文书页
                </p>
                <p className="text-lg leading-10 text-[#5f5147]">{currentPage.text}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/80 pt-4">
                <span className="fairy-chip-sky">当前第 {pageIndex + 1} 页</span>
                <span className="text-sm text-[#9a887d]">共 {pages.length} 页</span>
              </div>
            </article>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              aria-label="上一页"
              className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pageIndex === 0}
              onClick={() => {
                window.speechSynthesis?.cancel()
                setPageIndex((current) => Math.max(0, current - 1))
              }}
              type="button"
            >
              上一页
            </button>
            <span className="fairy-chip-warm">第 {pageIndex + 1} 页 / 共 {pages.length} 页</span>
            <button
              aria-label="下一页"
              className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pageIndex >= pages.length - 1}
              onClick={() => {
                window.speechSynthesis?.cancel()
                setPageIndex((current) => Math.min(pages.length - 1, current + 1))
              }}
              type="button"
            >
              下一页
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default StoryDetailPage
