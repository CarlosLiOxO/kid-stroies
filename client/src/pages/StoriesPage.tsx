import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChildStore } from '../stores/childStore'
import { useStoryStore } from '../stores/storyStore'
import type { Story } from '../types'

/**
 * 故事库页 - 浏览所有已创建的故事
 * 支持筛选、公开切换、删除和推送
 */
const StoriesPage = () => {
  const children = useChildStore((state) => state.children)
  const fetchChildren = useChildStore((state) => state.fetchChildren)
  const { stories, isLoading, error, fetchStories, updateStory, deleteStory, pushStory } = useStoryStore()

  const [keyword, setKeyword] = useState('')
  const [selectedChildId, setSelectedChildId] = useState('all')
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all')

  useEffect(() => {
    void fetchChildren()
    void fetchStories()
  }, [fetchChildren, fetchStories])

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesKeyword =
        !keyword ||
        story.title.includes(keyword) ||
        (story.summary ?? '').includes(keyword) ||
        (story.theme ?? '').includes(keyword)

      const matchesChild = selectedChildId === 'all' || story.childId === selectedChildId
      const matchesVisibility =
        visibility === 'all' ||
        (visibility === 'public' && story.isPublic) ||
        (visibility === 'private' && !story.isPublic)

      return matchesKeyword && matchesChild && matchesVisibility
    })
  }, [keyword, selectedChildId, stories, visibility])
  const pushedStories = useMemo(() => stories.filter((story) => story.isPushed), [stories])

  /**
   * 删除故事
   */
  const handleDelete = async (story: Story) => {
    const confirmed = window.confirm(`确定删除故事《${story.title}》吗？`)
    if (!confirmed) {
      return
    }
    await deleteStory(story.id)
  }

  /**
   * 切换公开状态
   */
  const handleTogglePublic = async (story: Story) => {
    await updateStory(story.id, { isPublic: !story.isPublic })
  }

  /**
   * 推送故事到孩子端
   */
  const handlePush = async (story: Story) => {
    const confirmed = window.confirm(`确认把《${story.title}》推送到孩子端吗？`)
    if (!confirmed) {
      return
    }
    await pushStory(story.id)
  }

  return (
    <div className="fairy-shell fairy-stack">
      <section className="fairy-hero space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="fairy-kicker">绘本书架</span>
            <h1 className="fairy-title">把每一次创作，都收进属于孩子的故事书架</h1>
            <p className="fairy-subtitle max-w-2xl">
              在这里统一查看你生成过的故事，决定是否推送到孩子端、分享到社区，或继续回到详情页完善它。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="fairy-stat-pill">共 {filteredStories.length} 篇故事</span>
            <span className="fairy-stat-pill">已推送 {pushedStories.length} 篇</span>
            <span className="fairy-stat-pill">已公开 {stories.filter((story) => story.isPublic).length} 篇</span>
          </div>
        </div>
      </section>

      <section className="fairy-filter-bar">
        <div className="mb-4">
          <h2 className="fairy-section-title">筛选你的绘本</h2>
          <p className="fairy-subtitle mt-2">按标题、孩子、可见性快速找到想继续管理的故事。</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            className="input-field"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索标题、摘要或主题"
            value={keyword}
          />
          <select className="input-field" onChange={(event) => setSelectedChildId(event.target.value)} value={selectedChildId}>
            <option value="all">全部孩子</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            onChange={(event) => setVisibility(event.target.value as 'all' | 'public' | 'private')}
            value={visibility}
          >
            <option value="all">全部状态</option>
            <option value="public">仅公开</option>
            <option value="private">仅私密</option>
          </select>
        </div>
      </section>

      {error ? <p className="fairy-message-error">{error}</p> : null}

      {pushedStories.length > 0 ? (
        <section className="fairy-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="fairy-section-title">最近推送历史</h2>
              <p className="fairy-subtitle mt-2">这些故事已经被送到孩子端，可以继续作为下一次创作的灵感。</p>
            </div>
            <span className="fairy-chip-lilac">共 {pushedStories.length} 次推送</span>
          </div>
          <div className="space-y-3">
            {pushedStories.slice(0, 5).map((story) => (
              <article className="fairy-surface-muted flex items-center justify-between gap-4" key={story.id}>
                <div>
                  <p className="font-semibold text-[#6d4c41]">{story.title}</p>
                  <p className="mt-1 text-xs text-[#9a887d]">
                    推送时间：{story.pushedAt ? new Date(story.pushedAt).toLocaleString('zh-CN') : '刚刚推送'}
                  </p>
                </div>
                <span className="fairy-chip-rose">已推送</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <div className="fairy-empty">故事加载中...</div>
      ) : filteredStories.length === 0 ? (
        <div className="fairy-empty">还没有匹配的故事，先去创建一篇吧。</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredStories.map((story) => {
            const childName = children.find((child) => child.id === story.childId)?.name ?? '未关联孩子'
            return (
              <article className="fairy-book-card" key={story.id}>
                <Link
                  aria-label={`查看故事详情：${story.title}`}
                  className="block transition-opacity duration-200 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#d9c3ff]"
                  to={`/stories/${story.id}`}
                >
                  <div className="fairy-book-cover h-52">
                    {story.images[0] ? (
                      <img alt={story.title} className="h-full w-full object-cover" src={story.images[0]} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">📖</div>
                    )}
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-[#6d4c41] hover:text-[#b7773a]">{story.title}</h2>
                        <p className="mt-1 text-sm text-[#9a887d]">
                          {childName} · {story.theme ?? '成长主题'} ·{' '}
                          {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={story.isPublic ? 'fairy-chip-lilac' : 'fairy-chip-warm'}>
                          {story.isPublic ? '已公开' : '私密'}
                        </span>
                        <span className={story.isPushed ? 'fairy-chip-rose' : 'fairy-chip-sky'}>
                          {story.isPushed ? '已推送' : '未推送'}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-sm leading-7 text-[#7d6d64]">
                      {story.summary ?? story.previewText}
                    </p>
                  </div>
                </Link>

                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary" onClick={() => void handlePush(story)} type="button">
                      推送到孩子端
                    </button>
                    <button className="btn-outline" onClick={() => void handleTogglePublic(story)} type="button">
                      {story.isPublic ? '设为私密' : '公开到社区'}
                    </button>
                    <button className="btn-outline" onClick={() => void handleDelete(story)} type="button">
                      删除
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StoriesPage
