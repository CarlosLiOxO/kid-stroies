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
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title mb-2">故事库</h1>
          <p className="text-amber-700">集中管理你生成过的所有故事，并决定是否推送到孩子端或分享到社区。</p>
        </div>
        <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
          共 {filteredStories.length} 篇故事
        </div>
      </div>

      <section className="story-card p-6">
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

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      {pushedStories.length > 0 ? (
        <section className="story-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-purple-700">最近推送历史</h2>
            <span className="text-sm text-gray-500">共 {pushedStories.length} 次推送</span>
          </div>
          <div className="space-y-3">
            {pushedStories.slice(0, 5).map((story) => (
              <article className="flex items-center justify-between rounded-2xl border border-amber-100 p-4" key={story.id}>
                <div>
                  <p className="font-semibold text-amber-800">{story.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    推送时间：{story.pushedAt ? new Date(story.pushedAt).toLocaleString('zh-CN') : '刚刚推送'}
                  </p>
                </div>
                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                  已推送
                </span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <div className="story-card p-8 text-center text-gray-500">故事加载中...</div>
      ) : filteredStories.length === 0 ? (
        <div className="story-card p-8 text-center text-gray-500">还没有匹配的故事，先去创建一篇吧。</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredStories.map((story) => {
            const images = parseImages(story.images)
            const childName = children.find((child) => child.id === story.childId)?.name ?? '未关联孩子'
            return (
              <article className="story-card overflow-hidden" key={story.id}>
                <div className="h-48 bg-amber-100">
                  {images[0] ? (
                    <img alt={story.title} className="h-full w-full object-cover" src={images[0]} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">📖</div>
                  )}
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-amber-800">
                        <Link className="hover:text-amber-600 hover:underline" to={`/stories/${story.id}`}>{story.title}</Link>
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {childName} · {story.theme ?? '成长主题'} ·{' '}
                        {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {story.isPublic ? '已公开' : '私密'}
                      </span>
                      <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                        {story.isPushed ? '已推送' : '未推送'}
                      </span>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-gray-600">
                    {story.summary ?? firstStoryParagraph(story.content)}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button className="btn-outline" onClick={() => void handleTogglePublic(story)} type="button">
                      {story.isPublic ? '设为私密' : '公开到社区'}
                    </button>
                    <button className="btn-secondary" onClick={() => void handlePush(story)} type="button">
                      推送到孩子端
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

/**
 * 提取故事首段文案
 */
function firstStoryParagraph(content: string): string {
  try {
    const pages = JSON.parse(content) as Array<{ text?: string }>
    return pages[0]?.text ?? '点击查看故事详情。'
  } catch {
    return content
  }
}

/**
 * 解析故事插画字段
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

export default StoriesPage
