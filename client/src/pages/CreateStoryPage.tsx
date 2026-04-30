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
  const storyStyles = ['睡前', '冒险', '治愈', '教育']
  const artStyles = ['水彩', '卡通', '油画', '梦幻']

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
    <div className="fairy-shell fairy-stack">
      <section className="fairy-hero grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <span className="fairy-kicker">故事编织台</span>
          <h1 className="fairy-title">把今天发生的小事，织进一篇温柔的睡前故事</h1>
          <p className="fairy-subtitle max-w-2xl">
            输入孩子今天的经历、想练习的习惯或需要陪伴的小情绪，系统会自动生成适合朗读的童话与插画。
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="fairy-chip-warm">按年龄自动适配篇幅</span>
            <span className="fairy-chip-lilac">支持插画风格</span>
            <span className="fairy-chip-rose">可同步分享到社区</span>
          </div>
        </div>
        <div className="fairy-panel grid gap-4 p-6 sm:grid-cols-3">
          <div className="fairy-surface-muted">
            <p className="text-sm font-semibold text-[#b7773a]">第 1 步</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">选择孩子，带上当前画像和成长状态。</p>
          </div>
          <div className="fairy-surface-muted">
            <p className="text-sm font-semibold text-[#7b57c8]">第 2 步</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">输入故事线索、风格与教育目标。</p>
          </div>
          <div className="fairy-surface-muted">
            <p className="text-sm font-semibold text-[#c76d8d]">第 3 步</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">等待 AI 把主题织成一组绘本页。</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="fairy-panel p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="fairy-section-title">开始编织故事</h2>
            <p className="fairy-subtitle mt-2">把孩子、故事线索和想传达的成长目标整理好，剩下的交给 AI。</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#6d4c41]">选择孩子</label>
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

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#6d4c41]">故事需求</label>
              <textarea
                className="input-field min-h-40 resize-y"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="例如：今天弟弟不想刷牙，想生成一个关于刷牙的勇敢故事。"
                required
                value={prompt}
              />
            </div>

            <div className="grid gap-5">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#6d4c41]">故事风格</label>
                <div className="flex flex-wrap gap-2">
                  {storyStyles.map((item) => (
                    <button
                      className={style === item ? 'fairy-choice-pill-active' : 'fairy-choice-pill-idle'}
                      key={item}
                      onClick={() => setStyle(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#6d4c41]">插画风格</label>
                <div className="flex flex-wrap gap-2">
                  {artStyles.map((item) => (
                    <button
                      className={artStyle === item ? 'fairy-choice-pill-active' : 'fairy-choice-pill-idle'}
                      key={item}
                      onClick={() => setArtStyle(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#6d4c41]">主题（可选）</label>
                <input
                  className="input-field"
                  onChange={(event) => setTheme(event.target.value)}
                  placeholder="例如：刷牙习惯"
                  value={theme}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#6d4c41]">教育目标（可选）</label>
                <input
                  className="input-field"
                  onChange={(event) => setEducationalGoal(event.target.value)}
                  placeholder="例如：建立自律习惯"
                  value={educationalGoal}
                />
              </div>
            </div>

            <label className="fairy-toggle">
              <input checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} type="checkbox" />
              <span>
                <span className="block font-semibold text-[#6d4c41]">同步分享到社区</span>
                <span className="mt-1 block text-xs text-[#8f7d72]">允许其他家长浏览和下载这篇新生成的故事。</span>
              </span>
            </label>

            {currentPreviewChild ? (
              <div className="fairy-profile-hint">
                当前画像：{currentPreviewChild.name} · {currentPreviewChild.personality ?? '等待提取'} ·{' '}
                {currentPreviewChild.concerns ?? '无特殊困扰'}
              </div>
            ) : null}

            {error ? <p className="fairy-message-error">{error}</p> : null}

            <button className="btn-primary w-full" disabled={isLoading || children.length === 0} type="submit">
              {isLoading ? 'AI 正在编织童话...' : '生成故事'}
            </button>
          </form>
        </section>

        <section className="fairy-panel p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="fairy-section-title">故事预览</h2>
              <p className="fairy-subtitle mt-2">生成完成后，这里会像展开的书页一样展示标题、插画和分页内容。</p>
            </div>
            <span className="fairy-chip-sky">预览画板</span>
          </div>

          {isLoading ? (
            <div className="fairy-surface-muted space-y-4">
              <div className="h-6 w-40 rounded-full bg-white/80" />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="h-28 rounded-[24px] bg-white/70" />
                <div className="h-28 rounded-[24px] bg-white/60" />
                <div className="h-28 rounded-[24px] bg-white/50" />
              </div>
              <p className="text-sm leading-7 text-[#7d6d64]">
                星光正在编织故事页，请稍候片刻，系统会把主题、插画与成长目标整合成一篇完整的睡前故事。
              </p>
            </div>
          ) : !generatedStory ? (
            <div className="fairy-empty">
              还没有生成中的故事。先在左侧填入孩子今天的小故事，这里就会展开一组新的绘本页。
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="fairy-chip-warm">{generatedStory.style ?? '睡前'}</span>
                  <span className="fairy-chip-lilac">{generatedStory.artStyle ?? '水彩'}</span>
                  <span className="fairy-chip-rose">{generatedStory.educationalGoal ?? '成长陪伴'}</span>
                </div>
                <div className="rounded-[28px] bg-[#fff7ee] p-5">
                  <h3 className="text-2xl font-bold text-[#6d4c41]">{generatedStory.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#7d6d64]">{generatedStory.summary}</p>
                </div>
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {images.map((image) => (
                    <img
                      alt={generatedStory.title}
                      className="h-40 w-full rounded-[24px] object-cover shadow-sm"
                      key={image}
                      src={image}
                    />
                  ))}
                </div>
              ) : null}

              <div className="space-y-3">
                {pages.map((page) => (
                  <article className="fairy-surface-muted" key={page.page}>
                    <p className="mb-2 text-sm font-semibold text-[#7b57c8]">第 {page.page} 页</p>
                    <p className="text-sm leading-7 text-[#5f5147]">{page.text}</p>
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
