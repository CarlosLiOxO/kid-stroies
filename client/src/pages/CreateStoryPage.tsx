import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import type { Story } from '../types'
import { useAuthStore } from '../stores/authStore'
import { useChildStore } from '../stores/childStore'
import { useStoryStore } from '../stores/storyStore'
import {
  ART_STYLE_OPTIONS,
  STORY_STYLE_OPTIONS,
  buildGoalFollowUp,
  buildIncidentFollowUp,
  buildStyleFollowUp,
  buildSummaryNarration,
  createAiMessage,
  createInitialInterviewState,
  createUserMessage,
  findChildByInput,
  getOpeningMessages,
  getStepPrompt,
  getStepSuggestions,
  normalizeArtStyle,
  normalizeStoryStyle,
  type InterviewMessage,
  type InterviewStep,
} from '../features/create-story/interviewConfig'
import { buildCreateStoryRequest } from '../features/create-story/interviewMapper'

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

  const [childrenReady, setChildrenReady] = useState(false)
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [currentStep, setCurrentStep] = useState<InterviewStep>('child')
  const [draftInput, setDraftInput] = useState('')
  const [interviewState, setInterviewState] = useState(createInitialInterviewState)
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null)

  useEffect(() => {
    let active = true

    /**
     * 初始化孩子列表，确保采访流在拿到档案后再开场。
     */
    const loadChildren = async () => {
      try {
        await fetchChildren()
      } finally {
        if (active) {
          setChildrenReady(true)
        }
      }
    }

    void loadChildren()

    return () => {
      active = false
    }
  }, [fetchChildren])

  useEffect(() => {
    if (!childrenReady || messages.length > 0) {
      return
    }

    const initialChild = currentChild ?? (children.length === 1 ? children[0] : null)

    if (initialChild) {
      setCurrentChild(initialChild)
      setInterviewState((state) => ({
        ...state,
        childId: initialChild.id,
      }))
    }

    setMessages(getOpeningMessages(children, initialChild))
    setCurrentStep(children.length === 1 && initialChild ? 'incident' : 'child')
  }, [children, childrenReady, currentChild, messages.length, setCurrentChild])

  const currentPreviewChild = useMemo(() => {
    if (interviewState.childId) {
      return children.find((child) => child.id === interviewState.childId) ?? null
    }
    return currentChild ?? null
  }, [children, currentChild, interviewState.childId])

  const quickReplies = useMemo(() => getStepSuggestions(currentStep, children), [children, currentStep])

  const interviewSummary = useMemo(
    () => [
      { label: '故事主角', value: currentPreviewChild?.name ?? '还未选择' },
      { label: '今晚线索', value: interviewState.incident || '等待补充' },
      { label: '成长目标', value: interviewState.educationalGoal || '等待补充' },
      { label: '故事口吻', value: interviewState.style },
      { label: '插画风格', value: interviewState.artStyle },
    ],
    [currentPreviewChild?.name, interviewState]
  )

  const summaryNarration = useMemo(
    () => buildSummaryNarration(interviewState, currentPreviewChild?.name),
    [currentPreviewChild?.name, interviewState]
  )

  const appendAiMessage = (text: string) => {
    appendMessage(setMessages, createAiMessage(text))
  }

  /**
   * 处理采访回答并推进到下一步。
   */
  const handleAnswerSubmit = async () => {
    const answer = draftInput.trim()
    if (!answer || isLoading || children.length === 0) {
      return
    }

    setDraftInput('')
    setMessages((prev) => [...prev, createUserMessage(answer)])

    switch (currentStep) {
      case 'child': {
        const matchedChild = findChildByInput(children, answer)
        if (!matchedChild) {
          appendAiMessage('我还没认出这个名字，点一下下面的孩子名字会更快一些。')
          return
        }

        setCurrentChild(matchedChild)
        setInterviewState((state) => ({
          ...state,
          childId: matchedChild.id,
        }))
        setCurrentStep('incident')
        appendAiMessage(getStepPrompt('incident', matchedChild.name, matchedChild.name))
        return
      }

      case 'incident':
        setInterviewState((state) => ({
          ...state,
          incident: answer,
        }))
        setCurrentStep('goal')
        appendAiMessage(`${buildIncidentFollowUp(answer)}${getStepPrompt('goal', currentPreviewChild?.name, answer)}`)
        return

      case 'goal':
        setInterviewState((state) => ({
          ...state,
          educationalGoal: answer,
        }))
        setCurrentStep('style')
        appendAiMessage(`${buildGoalFollowUp(answer)}${getStepPrompt('style', currentPreviewChild?.name, answer)}`)
        return

      case 'style': {
        const normalizedStyle = normalizeStoryStyle(answer)
        setInterviewState((state) => ({
          ...state,
          style: normalizedStyle,
        }))
        setCurrentStep('artStyle')
        appendAiMessage(
          `${buildStyleFollowUp(normalizedStyle)}${getStepPrompt('artStyle', currentPreviewChild?.name, normalizedStyle)}`
        )
        return
      }

      case 'artStyle': {
        const normalizedArtStyle = normalizeArtStyle(answer)
        setInterviewState((state) => ({
          ...state,
          artStyle: normalizedArtStyle,
        }))
        setCurrentStep('summary')
        appendAiMessage(getStepPrompt('summary'))
        return
      }

      case 'summary':
        return
    }
  }

  /**
   * 确认摘要后调用现有故事生成链路。
   */
  const handleGenerateStory = async () => {
    clearError()

    try {
      const story = await addStory(buildCreateStoryRequest(interviewState))
      setGeneratedStory(story)
      await refreshProfile()
    } catch {
      // 错误信息由 store 统一维护
    }
  }

  /**
   * 允许用户在摘要阶段跳回指定步骤微调答案。
   */
  const jumpToStep = (step: InterviewStep) => {
    setCurrentStep(step)
    appendAiMessage(getStepPrompt(step, currentPreviewChild?.name, currentPreviewChild?.name ?? step))
  }

  /**
   * 重新开始采访，并尽量保留已识别到的孩子。
   */
  const restartInterview = () => {
    const initialState = createInitialInterviewState()
    const retainedChild = currentPreviewChild ?? (children.length === 1 ? children[0] : null)
    const nextState = retainedChild
      ? {
          ...initialState,
          childId: retainedChild.id,
        }
      : initialState

    setInterviewState(nextState)
    setGeneratedStory(null)
    setDraftInput('')
    setMessages(getOpeningMessages(children, retainedChild))
    setCurrentStep(retainedChild ? 'incident' : 'child')
  }

  const pages = generatedStory?.pages ?? []
  const images = generatedStory?.images ?? []
  const showComposer = childrenReady && children.length > 0 && currentStep !== 'summary'

  return (
    <div className="fairy-shell fairy-stack">
      <section className="fairy-hero grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <span className="fairy-kicker">AI 采访式编织台</span>
          <h1 className="fairy-title">先聊一聊今天的小事，再把它织成一篇刚刚好的睡前故事</h1>
          <p className="fairy-subtitle max-w-2xl">
            现在不用再填长表单了。AI 会像采访一样一步步陪你梳理孩子、情境、成长目标和画风偏好，再生成今晚的绘本故事。
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="fairy-chip-warm">一轮一问更自然</span>
            <span className="fairy-chip-lilac">生成前会先总结确认</span>
            <span className="fairy-chip-rose">仍支持社区分享</span>
          </div>
        </div>
        <div className="fairy-panel grid gap-4 p-6 sm:grid-cols-3">
          <div className="fairy-surface-muted">
            <p className="text-sm font-semibold text-[#b7773a]">第 1 步</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">先确认今天想写给谁，再进入今晚的小采访。</p>
          </div>
          <div className="fairy-surface-muted">
            <p className="text-sm font-semibold text-[#7b57c8]">第 2 步</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">AI 帮你梳理今天发生的事、想引导的目标与故事口吻。</p>
          </div>
          <div className="fairy-surface-muted">
            <p className="text-sm font-semibold text-[#c76d8d]">第 3 步</p>
            <p className="mt-2 text-sm leading-6 text-[#7d6d64]">确认采访总结后，等待 AI 把内容织成一组绘本页。</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="fairy-panel p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="fairy-section-title">开始今晚的小采访</h2>
            <p className="fairy-subtitle mt-2">你只需要像聊天一样回答，AI 会把散落的线索整理成可生成的故事设定。</p>
          </div>

          <div className="space-y-5">
            <div className="fairy-chat-thread" role="log" aria-label="AI 采访对话">
              {!childrenReady ? (
                <div className="fairy-chat-bubble-ai">正在整理孩子档案，马上开始今晚的小采访...</div>
              ) : (
                messages.map((message) => (
                  <article
                    className={message.role === 'ai' ? 'fairy-chat-bubble-ai' : 'fairy-chat-bubble-user'}
                    key={message.id}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                      {message.role === 'ai' ? 'AI 采访官' : '你的回答'}
                    </p>
                    <p className="mt-2 text-sm leading-7">{message.text}</p>
                  </article>
                ))
              )}
            </div>

            {currentPreviewChild ? (
              <div className="fairy-profile-hint">
                当前画像：{currentPreviewChild.name} · {currentPreviewChild.personality ?? '等待提取'} ·{' '}
                {currentPreviewChild.concerns ?? '无特殊困扰'}
              </div>
            ) : null}

            {childrenReady && children.length === 0 ? (
              <div className="fairy-empty space-y-4">
                <p className="text-base font-semibold text-[#6d4c41]">请先添加孩子档案</p>
                <p>先把今晚故事的小主角建好，我再继续采访并帮你织成故事。</p>
                <Link className="btn-primary" to="/children">
                  去添加孩子档案
                </Link>
              </div>
            ) : null}

            {showComposer ? (
              <div className="fairy-interview-card space-y-4">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((suggestion) => (
                    <button
                      className="fairy-suggestion-pill"
                      key={suggestion}
                      onClick={() => setDraftInput(suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="fairy-interview-composer">
                  <label className="sr-only" htmlFor="create-story-interview-input">
                    采访输入框
                  </label>
                  <textarea
                    aria-label="采访输入框"
                    className="input-field min-h-28 resize-none"
                    id="create-story-interview-input"
                    onChange={(event) => setDraftInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        void handleAnswerSubmit()
                      }
                    }}
                    placeholder="像聊天一样回答就可以，AI 会帮你整理成故事设定。"
                    value={draftInput}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#8f7d72]">每次回答一个重点，AI 会继续往下追问。</span>
                    <button className="btn-primary" onClick={() => void handleAnswerSubmit()} type="button">
                      发送回答
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 'summary' && children.length > 0 ? (
              <div className="fairy-summary-card space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#6d4c41]">这次故事设定</h3>
                  <p className="text-sm leading-7 text-[#7d6d64]">{summaryNarration}</p>
                  <p className="text-sm leading-6 text-[#7d6d64]">如果没问题，就让 AI 按这份采访摘要开始生成。</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {interviewSummary.map((item) => (
                    <div className="fairy-surface-muted p-4" key={item.label}>
                      <p className="text-xs font-semibold tracking-[0.12em] text-[#b68a63] uppercase">{item.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5f5147]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <label className="fairy-toggle">
                  <input
                    checked={interviewState.isPublic}
                    onChange={(event) =>
                      setInterviewState((state) => ({
                        ...state,
                        isPublic: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-semibold text-[#6d4c41]">同步分享到社区</span>
                    <span className="mt-1 block text-xs text-[#8f7d72]">允许其他家长浏览和下载这篇新生成的故事。</span>
                  </span>
                </label>

                <div className="flex flex-wrap gap-2">
                  <button className="fairy-suggestion-pill" onClick={() => jumpToStep('child')} type="button">
                    改孩子
                  </button>
                  <button className="fairy-suggestion-pill" onClick={() => jumpToStep('goal')} type="button">
                    改目标
                  </button>
                  <button className="fairy-suggestion-pill" onClick={() => jumpToStep('style')} type="button">
                    改氛围
                  </button>
                  <button className="fairy-suggestion-pill" onClick={restartInterview} type="button">
                    重新采访
                  </button>
                </div>

                <button className="btn-primary w-full" disabled={isLoading} onClick={() => void handleGenerateStory()} type="button">
                  {isLoading ? 'AI 正在编织童话...' : '就这样生成故事'}
                </button>
              </div>
            ) : null}

            {error ? <p className="fairy-message-error">{error}</p> : null}
          </div>
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
                故事采访已经完成啦，星光正在编织书页，请稍候片刻，系统会把主题、插画与成长目标整理成一篇完整的睡前故事。
              </p>
            </div>
          ) : !childrenReady ? (
            <div className="fairy-empty">AI 正在准备今晚的采访舞台，请稍候片刻。</div>
          ) : children.length === 0 ? (
            <div className="fairy-empty">等你添加好孩子档案后，这里会出现采访摘要和最终生成的绘本页。</div>
          ) : !generatedStory ? (
            <div className="fairy-empty">
              {currentStep === 'summary'
                ? '摘要已经整理好啦，确认后这里就会展开今晚的新故事。'
                : '先在左侧和 AI 聊一聊孩子今天的小故事，这里就会逐步展开本次采访摘要与新的绘本页。'}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="fairy-chip-warm">
                    {generatedStory.style && STORY_STYLE_OPTIONS.includes(generatedStory.style as (typeof STORY_STYLE_OPTIONS)[number])
                      ? generatedStory.style
                      : '睡前'}
                  </span>
                  <span className="fairy-chip-lilac">
                    {generatedStory.artStyle &&
                    ART_STYLE_OPTIONS.includes(generatedStory.artStyle as (typeof ART_STYLE_OPTIONS)[number])
                      ? generatedStory.artStyle
                      : '水彩'}
                  </span>
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

export default CreateStoryPage

/** 追加一条 AI 消息 */
function appendMessage(
  updater: Dispatch<SetStateAction<InterviewMessage[]>>,
  message: InterviewMessage
) {
  updater((prev) => [...prev, message])
}
