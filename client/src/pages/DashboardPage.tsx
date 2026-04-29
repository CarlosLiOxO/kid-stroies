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
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title mb-2">家长仪表盘</h1>
          <p className="text-amber-700">
            {user?.name ? `${user.name}，今晚想给孩子准备什么样的故事呢？` : '开始为孩子准备今晚的睡前童话吧。'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link className="btn-outline text-center" to="/children">
            管理孩子档案
          </Link>
          <Link className="btn-primary text-center" to="/create-story">
            立即生成故事
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="story-card p-6">
          <h2 className="mb-2 text-lg font-bold text-purple-700">我的故事</h2>
          <p className="text-4xl font-bold text-amber-500">{stories.length}</p>
          <p className="mt-2 text-sm text-gray-500">已创建的故事</p>
        </section>

        <section className="story-card p-6">
          <h2 className="mb-2 text-lg font-bold text-purple-700">我的孩子</h2>
          <p className="text-4xl font-bold text-amber-500">{children.length}</p>
          <p className="mt-2 text-sm text-gray-500">已添加的孩子</p>
        </section>

        <section className="story-card p-6">
          <h2 className="mb-2 text-lg font-bold text-purple-700">剩余代币</h2>
          <p className="text-4xl font-bold text-amber-500">{user?.tokens ?? 0}</p>
          <p className="mt-2 text-sm text-gray-500">生成故事和下载社区内容可用</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="story-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-purple-700">最近生成的故事</h2>
            <Link className="text-sm font-medium text-amber-600 hover:underline" to="/stories">
              查看全部
            </Link>
          </div>
          {recentStories.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 p-6 text-sm text-gray-500">
              还没有故事，先去创建一篇专属于孩子的睡前童话吧。
            </div>
          ) : (
            <div className="space-y-4">
              {recentStories.map((story) => (
                <article key={story.id} className="rounded-2xl border border-amber-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-amber-800">{story.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {story.theme ?? '成长主题'} · {story.style ?? '睡前'} ·{' '}
                        {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {story.isPublic ? '已公开' : '私密'}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                    {story.summary ?? '点击查看故事详情。'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="story-card p-6">
          <h2 className="mb-4 text-xl font-bold text-purple-700">当前孩子画像</h2>
          {currentChild ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-lg font-semibold text-amber-800">{currentChild.name}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {currentChild.age ? `${currentChild.age} 岁` : '年龄待补充'} ·{' '}
                  {currentChild.gender ?? '未设置性别'}
                </p>
              </div>
              <p className="text-sm leading-6 text-gray-600">
                性格：{currentChild.personality ?? '等待 AI 从档案中提取'}
              </p>
              <p className="text-sm leading-6 text-gray-600">
                关注点：{currentChild.concerns ?? '还没有填写当日困扰'}
              </p>
              <Link className="btn-secondary inline-block text-center" to="/children">
                继续完善档案
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50 p-6 text-sm text-gray-500">
              还没有孩子档案，先创建一个档案，AI 才能更懂你的孩子。
            </div>
          )}
        </section>
      </div>

      <section className="story-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-purple-700">孩子每日故事记录</h2>
          <span className="text-sm text-gray-500">最近 7 次阅读</span>
        </div>
        {readingRecords.length === 0 ? (
          <div className="rounded-2xl bg-amber-50 p-6 text-sm text-gray-500">
            孩子端还没有阅读记录，推送一篇故事后可以在这里看到阅读日历。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {readingRecords.map((record) => (
              <article className="rounded-2xl border border-amber-100 p-4" key={`${record.storyId}-${record.readAt}`}>
                <p className="font-semibold text-amber-800">{record.title}</p>
                <p className="mt-1 text-sm text-gray-500">
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
