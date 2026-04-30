import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChildStore } from '../stores/childStore'
import { useStoryStore } from '../stores/storyStore'

/**
 * 家长仪表盘 - 家长端核心页面
 * 汇总孩子、故事、Token 与最近动态
 */
const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const refreshProfile = useAuthStore((state) => state.refreshProfile)
  const children = useChildStore((state) => state.children)
  const currentChild = useChildStore((state) => state.currentChild)
  const fetchChildren = useChildStore((state) => state.fetchChildren)
  const setCurrentChild = useChildStore((state) => state.setCurrentChild)
  const stories = useStoryStore((state) => state.stories)
  const fetchStories = useStoryStore((state) => state.fetchStories)

  useEffect(() => {
    void fetchChildren()
    void fetchStories()
    void refreshProfile()
  }, [fetchChildren, fetchStories, refreshProfile])

  useEffect(() => {
    if (!currentChild && children.length > 0) {
      setCurrentChild(children[0])
    }
  }, [children, currentChild, setCurrentChild])

  const recentStories = stories.slice(0, 3)
  const readingRecords = useMemo(() => getReadingRecords(), [])

  return (
    <div className="fairy-shell fairy-stack">
      <section className="fairy-hero space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="fairy-kicker">今晚故事准备台</span>
            <h1 className="fairy-title text-3xl md:text-4xl">家长仪表盘</h1>
            <p className="fairy-subtitle max-w-2xl">
              {user?.name ? `${user.name}，今晚想给孩子准备什么样的故事呢？` : '开始为孩子准备今晚的睡前童话吧。'}
            </p>
          </div>
          <div className="fairy-action-row">
            <Link className="btn-outline text-center" to="/children">
              管理孩子档案
            </Link>
            <Link className="btn-primary text-center" to="/create-story">
              立即生成故事
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <section className="fairy-metric-card">
            <p className="text-sm text-[#9a887d]">我的故事</p>
            <p className="mt-3 text-4xl font-bold text-[#6d4c41]">{stories.length}</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">已经写进孩子书架里的专属故事</p>
          </section>

          <section className="fairy-metric-card">
            <p className="text-sm text-[#9a887d]">我的孩子</p>
            <p className="mt-3 text-4xl font-bold text-[#6d4c41]">{children.length}</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">当前已建立画像并持续陪伴的孩子档案</p>
          </section>

          <section className="fairy-metric-card">
            <p className="text-sm text-[#9a887d]">剩余 Token</p>
            <p className="mt-3 text-4xl font-bold text-[#6d4c41]">{user?.tokens ?? 0}</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">可用于生成新故事或带回社区里的灵感</p>
          </section>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="fairy-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="fairy-section-title">最近生成的故事</h2>
              <p className="fairy-subtitle mt-2">从这里快速回到最近完成的创作，继续阅读或管理它们。</p>
            </div>
            <Link className="text-sm font-medium text-[#b7773a] hover:underline" to="/stories">
              查看全部
            </Link>
          </div>
          {recentStories.length === 0 ? (
            <div className="fairy-empty">
              还没有故事，先去创建一篇专属于孩子的睡前童话吧。
            </div>
          ) : (
            <div className="space-y-4">
              {recentStories.map((story) => (
                <article className="fairy-surface-muted" key={story.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#6d4c41]">{story.title}</h3>
                      <p className="mt-1 text-sm text-[#8f7d72]">
                        {story.theme ?? '成长主题'} · {story.style ?? '睡前'} ·{' '}
                        {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <span className={story.isPublic ? 'fairy-chip-lilac' : 'fairy-chip-warm'}>
                      {story.isPublic ? '已公开' : '私密'}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#7d6d64]">
                    {story.summary ?? '点击查看故事详情。'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="fairy-panel p-6">
          <div className="mb-4">
            <h2 className="fairy-section-title">当前孩子画像</h2>
            <p className="fairy-subtitle mt-2">用画像把今晚的故事方向收拢得更贴近孩子此刻的成长状态。</p>
          </div>
          {currentChild ? (
            <div className="space-y-4">
              <div className="fairy-surface-muted">
                <p className="text-lg font-semibold text-[#6d4c41]">{currentChild.name}</p>
                <p className="mt-1 text-sm text-[#7d6d64]">
                  {currentChild.age ? `${currentChild.age} 岁` : '年龄待补充'} ·{' '}
                  {currentChild.gender ?? '未设置性别'}
                </p>
              </div>
              <div className="fairy-profile-hint">
                性格：{currentChild.personality ?? '等待 AI 从档案中提取'}
              </div>
              <div className="fairy-surface-muted text-sm leading-7 text-[#7d6d64]">
                关注点：{currentChild.concerns ?? '还没有填写当日困扰'}
              </div>
              <Link className="btn-secondary inline-block text-center" to="/children">
                继续完善档案
              </Link>
            </div>
          ) : (
            <div className="fairy-empty">
              还没有孩子档案，先创建一个档案，AI 才能更懂你的孩子。
            </div>
          )}
        </section>
      </div>

      <section className="fairy-panel p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="fairy-section-title">孩子每日故事记录</h2>
            <p className="fairy-subtitle mt-2">最近 7 次阅读会留下一串轻轻发亮的陪伴轨迹。</p>
          </div>
          <span className="fairy-chip-sky">最近 7 次阅读</span>
        </div>
        {readingRecords.length === 0 ? (
          <div className="fairy-empty">
            孩子端还没有阅读记录，推送一篇故事后可以在这里看到阅读日历。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {readingRecords.map((record) => (
              <article className="fairy-surface-muted" key={`${record.storyId}-${record.readAt}`}>
                <p className="font-semibold text-[#6d4c41]">{record.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#7d6d64]">
                  读到第 {record.page} 页 · {new Date(record.readAt).toLocaleString('zh-CN')}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

type ReadingRecord = {
  storyId: string
  title: string
  page: number
  readAt: string
}

/**
 * 获取本地阅读记录
 */
function getReadingRecords(): ReadingRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const single = JSON.parse(window.localStorage.getItem('kid-last-read') ?? 'null') as ReadingRecord | null
    return single ? [single] : []
  } catch {
    return []
  }
}

export default DashboardPage
