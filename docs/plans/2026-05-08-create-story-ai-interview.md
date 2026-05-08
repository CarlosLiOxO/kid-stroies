# 创建故事 AI 采访流 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将创建故事页从传统整页表单改为完全替代表单的半结构化 AI 采访流，并继续复用现有故事生成接口与预览链路。

**Architecture:** 本次实现保持后端 `POST /stories`、`storyStore.addStory()` 和故事预览链路不变，把改动集中在前端创建页。前端新增采访步骤配置与采访结果到 `CreateStoryRequest` 的映射逻辑，用本地状态机驱动对话消息流、摘要确认和生成触发，同时在样式层补足聊天气泡、摘要卡片和快捷回答等语义类。

**Tech Stack:** React、TypeScript、Zustand、Vite、Vitest、Testing Library、TailwindCSS

---

### Task 1: 为创建故事采访流补测试保护

**Files:**
- Create: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 写出首批失败测试**

```tsx
it('在没有孩子档案时提示先添加孩子档案', async () => {
  render(<CreateStoryPage />)
  expect(screen.getByText('请先添加孩子档案')).toBeInTheDocument()
})

it('在采访完成并确认后调用 addStory', async () => {
  render(<CreateStoryPage />)
  await user.click(screen.getByRole('button', { name: '开始采访' }))
  await user.type(screen.getByLabelText('采访输入框'), '今天不想刷牙')
  await user.click(screen.getByRole('button', { name: '发送' }))
  expect(mockAddStory).toHaveBeenCalled()
})
```

**Step 2: 运行测试确认当前失败**

Run: `npm run test -- CreateStoryPage`
Expected: FAIL，提示采访流 UI 或测试目标节点尚不存在。

**Step 3: 补齐测试桩与 store mock**

```tsx
vi.mock('../stores/storyStore', () => ({
  useStoryStore: (selector: any) =>
    selector({
      addStory: mockAddStory,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    }),
}))
```

**Step 4: 再次运行测试，确认失败点聚焦到采访流实现**

Run: `npm run test -- CreateStoryPage`
Expected: FAIL，失败信息集中在页面结构与交互未实现，而不是 mock 或渲染环境异常。

**Step 5: Commit**

```bash
git add client/src/pages/CreateStoryPage.test.tsx client/src/pages/CreateStoryPage.tsx
git commit -m "test: add create story interview coverage"
```

### Task 2: 抽出采访步骤配置与请求映射

**Files:**
- Create: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewConfig.ts`
- Create: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewMapper.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/types/index.ts`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 定义采访步骤与槽位类型**

```ts
export type InterviewStep =
  | 'child'
  | 'incident'
  | 'goal'
  | 'storyStyle'
  | 'artStyle'
  | 'summary'

export interface InterviewState {
  childId: string
  incident: string
  educationalGoal: string
  style: string
  artStyle: string
  isPublic: boolean
}
```

**Step 2: 写最小映射函数**

```ts
export function buildCreateStoryRequest(state: InterviewState): CreateStoryRequest {
  return {
    childId: state.childId || undefined,
    prompt: `孩子今天的情况：${state.incident}\n希望引导：${state.educationalGoal}`,
    style: state.style || '睡前',
    artStyle: state.artStyle || '水彩',
    educationalGoal: state.educationalGoal || undefined,
    isPublic: state.isPublic,
  }
}
```

**Step 3: 在测试中补一个映射相关断言**

```tsx
expect(mockAddStory).toHaveBeenCalledWith(
  expect.objectContaining({
    style: '睡前',
    artStyle: '水彩',
    educationalGoal: '建立刷牙习惯',
  })
)
```

**Step 4: 运行测试确认类型与映射通过**

Run: `npm run test -- CreateStoryPage`
Expected: FAIL 或部分 PASS；映射逻辑可通过，页面采访流主交互仍待实现。

**Step 5: Commit**

```bash
git add client/src/features/create-story/interviewConfig.ts client/src/features/create-story/interviewMapper.ts client/src/types/index.ts client/src/pages/CreateStoryPage.test.tsx
git commit -m "feat: add create story interview config"
```

### Task 3: 重构创建故事页为采访式消息流

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/stores/childStore.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/stores/storyStore.ts`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 引入采访消息与本地状态**

```tsx
const [messages, setMessages] = useState<InterviewMessage[]>([])
const [currentStep, setCurrentStep] = useState<InterviewStep>('child')
const [draftInput, setDraftInput] = useState('')
const [interviewState, setInterviewState] = useState<InterviewState>(initialInterviewState)
```

**Step 2: 替换原整页表单渲染**

```tsx
return (
  <div className="fairy-shell fairy-stack">
    <section className="fairy-interview-layout">
      <InterviewTimeline messages={messages} />
      <InterviewComposer
        value={draftInput}
        suggestions={currentSuggestions}
        onSend={handleSend}
      />
    </section>
  </div>
)
```

**Step 3: 实现步骤推进与摘要确认**

```tsx
const handleSend = async () => {
  const nextState = applyAnswer(currentStep, draftInput, interviewState)
  if (getNextStep(nextState) === 'summary') {
    setMessages((prev) => [...prev, buildSummaryMessage(nextState)])
    return
  }
  setMessages((prev) => [...prev, buildAiQuestion(getNextStep(nextState), nextState)])
}
```

**Step 4: 在摘要确认时调用现有生成链路**

```tsx
const handleConfirmGenerate = async () => {
  clearError()
  const story = await addStory(buildCreateStoryRequest(interviewState))
  setGeneratedStory(story)
  await refreshProfile()
}
```

**Step 5: 运行测试确认主链路通过**

Run: `npm run test -- CreateStoryPage`
Expected: PASS，采访引导、摘要确认和生成触发的关键断言通过。

**Step 6: Commit**

```bash
git add client/src/pages/CreateStoryPage.tsx client/src/stores/childStore.ts client/src/stores/storyStore.ts client/src/pages/CreateStoryPage.test.tsx
git commit -m "feat: build create story interview flow"
```

### Task 4: 补采访流视觉与预览样式

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 新增采访流语义类**

```css
.fairy-chat-bubble-ai { }
.fairy-chat-bubble-user { }
.fairy-interview-card { }
.fairy-interview-composer { }
.fairy-summary-card { }
.fairy-suggestion-pill { }
```

**Step 2: 统一采访区、快捷回答与摘要卡样式**

```tsx
<button className="fairy-suggestion-pill" type="button">
  想温柔陪伴一点
</button>
```

**Step 3: 保留生成中、错误态和故事预览区**

```tsx
{isLoading ? <InterviewLoadingPanel /> : generatedStory ? <StoryPreview /> : <InterviewEmptyPreview />}
```

**Step 4: 运行测试确认结构未被样式改动破坏**

Run: `npm run test -- CreateStoryPage`
Expected: PASS，样式升级后测试仍通过。

**Step 5: Commit**

```bash
git add client/src/index.css client/src/pages/CreateStoryPage.tsx client/src/pages/CreateStoryPage.test.tsx
git commit -m "style: polish create story interview ui"
```

### Task 5: 回归诊断与构建验证

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewConfig.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewMapper.ts`

**Step 1: 检查最近修改文件诊断**

Run: 使用编辑器诊断检查 `CreateStoryPage.tsx`、`CreateStoryPage.test.tsx`、`index.css`、`interviewConfig.ts`、`interviewMapper.ts`
Expected: 无新增 TypeScript、JSX 或测试类型报错。

**Step 2: 运行聚焦测试**

Run: `npm run test -- CreateStoryPage`
Expected: PASS，创建故事采访流测试全部通过。

**Step 3: 运行前端完整构建**

Run: `npm run build`
Expected: PASS，前端可成功构建，无 TypeScript 编译错误。

**Step 4: 进行一次手动回归检查**

Run: `npm run dev`
Expected: 本地打开创建故事页后，能看到 AI 开场、采访输入、摘要确认、生成中状态和故事预览。

**Step 5: Commit**

```bash
git add client/src/pages/CreateStoryPage.tsx client/src/pages/CreateStoryPage.test.tsx client/src/index.css client/src/features/create-story/interviewConfig.ts client/src/features/create-story/interviewMapper.ts
git commit -m "feat: launch create story ai interview flow"
```
