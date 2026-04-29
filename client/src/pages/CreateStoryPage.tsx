import { useEffect, useMemo, useState } from 'react'
import type { Story } from '../types'
import { useAuthStore } from '../stores/authStore'
import { useChildStore } from '../stores/childStore'
import { useStoryStore } from '../stores/storyStore'

/**
 * 创建故事页 - AI 辅助生成个性化童话故事
 * 结合孩子画像和家长需求调用后端生成故事
 */
const CreateStoryPage = () => {
  const refreshProfile = useAuthStore((state) => state.refreshProfile)
  const children = useChildStore((state) => state.children)
  const currentChild = useChildStore((state) => state.currentChild)
  const fetchChildren = useChildStore((state) => state.fetchChildren)
  const setCurrentChild = useChildStore((state) => state.setCurrentChild)

  const addStory = useStoryStore((state) => state.addStory)
  const isLoading = useStoryStore((state) => state.isLoading)
  const error = useStoryStore((state) => state.error)
  const clearError = useStoryStore((state) => state.clearError)

  const [selectedChildId, setSelectedChildId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('睡前')
  const [artStyle, setArtStyle] = useState('水彩')
  const [theme, setTheme] = useState('')
  const [educationalGoal, setEducationalGoal] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null)

  useEffect(() => {
    void fetchChildren()
  }, [fetchChildren])

  const effectiveChildId = selectedChildId || currentChild?.id || children[0]?.id || ''

  const currentPreviewChild = useMemo(
    () => children.find((child) => child.id === effectiveChildId) ?? null,
    [children, effectiveChildId]
  )

  /**
   * 提交故事生成请求
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()

    try {
      const story = await addStory({
        childId: effectiveChildId || undefined,
        prompt,
        style,
        artStyle,
        isPublic,
        theme: theme || undefined,
        educationalGoal: educationalGoal || undefined,
      })
      setGeneratedStory(story)
      await refreshProfile()
    } catch {
      // 错误信息由 store 统一维护
    }
  }

  const pages = parseStoryPages(generatedStory?.content)
  const images = parseImages(generatedStory?.images)

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="page-title mb-2">创建故事</h1>
        <p className="text-amber-700">输入孩子今天的经历或想练习的习惯，系统会自动生成睡前童话与插画。</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="story-card p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">选择孩子</label>
              <select
                className="input-field"
                disabled={children.length === 0}
                onChange={(event) => {
                  setSelectedChildId(event.target.value)
                  const child = children.find((item) => item.id === event.target.value) ?? null
                  setCurrentChild(child)
                }}
                required
                value={effectiveChildId}
              >
                <option value="">{children.length === 0 ? '请先添加孩子档案' : '请选择孩子'}</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">故事需求</label>
              <textarea
                className="input-field min-h-36 resize-y"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="例如：今天弟弟不想刷牙，想生成一个关于刷牙的勇敢故事。"
                required
                value={prompt}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">故事风格</label>
                <select className="input-field" onChange={(event) => setStyle(event.target.value)} value={style}>
                  <option value="睡前">睡前</option>
                  <option value="冒险">冒险</option>
                  <option value="治愈">治愈</option>
                  <option value="教育">教育</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">插画风格</label>
                <select className="input-field" onChange={(event) => setArtStyle(event.target.value)} value={artStyle}>
                  <option value="水彩">水彩</option>
                  <option value="卡通">卡通</option>
                  <option value="油画">油画</option>
                  <option value="梦幻">梦幻</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">主题（可选）</label>
                <input
                  className="input-field"
                  onChange={(event) => setTheme(event.target.value)}
                  placeholder="例如：刷牙习惯"
                  value={theme}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">教育目标（可选）</label>
                <input
                  className="input-field"
                  onChange={(event) => setEducationalGoal(event.target.value)}
                  placeholder="例如：建立自律习惯"
                  value={educationalGoal}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-gray-700">
              <input checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} type="checkbox" />
              生成后同步分享到社区，允许其他家长浏览和下载
            </label>

            {currentPreviewChild ? (
              <div className="rounded-2xl bg-purple-50 px-4 py-3 text-sm text-purple-700">
                当前画像：{currentPreviewChild.name} · {currentPreviewChild.personality ?? '等待提取'} ·{' '}
                {currentPreviewChild.concerns ?? '无特殊困扰'}
              </div>
            ) : null}

            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

            <button className="btn-primary w-full" disabled={isLoading || children.length === 0} type="submit">
              {isLoading ? 'AI 正在编织童话...' : '生成故事'}
            </button>
          </form>
        </section>

        <section className="story-card p-8">
          <h2 className="mb-4 text-xl font-bold text-purple-700">故事预览</h2>
          {!generatedStory ? (
            <div className="rounded-2xl bg-amber-50 p-6 text-sm leading-6 text-gray-500">
              生成完成后，这里会展示故事标题、插画预览和分页内容。
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {generatedStory.style ?? '睡前'}
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    {generatedStory.artStyle ?? '水彩'}
                  </span>
                  <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                    {generatedStory.educationalGoal ?? '成长陪伴'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-amber-800">{generatedStory.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{generatedStory.summary}</p>
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {images.map((image) => (
                    <img
                      alt={generatedStory.title}
                      className="h-40 w-full rounded-2xl object-cover"
                      key={image}
                      src={image}
                    />
                  ))}
                </div>
              ) : null}

              <div className="space-y-3">
                {pages.map((page) => (
                  <article className="rounded-2xl border border-amber-100 p-4" key={page.page}>
                    <p className="mb-2 text-sm font-semibold text-purple-700">第 {page.page} 页</p>
                    <p className="text-sm leading-7 text-gray-700">{page.text}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

type StoryPageContent = {
  page: number
  text: string
}

/**
 * 解析故事分页 JSON
 */
function parseStoryPages(rawContent?: string): StoryPageContent[] {
  if (!rawContent) {
    return []
  }

  try {
    const parsed = JSON.parse(rawContent) as StoryPageContent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 解析故事插画列表
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

export default CreateStoryPage
