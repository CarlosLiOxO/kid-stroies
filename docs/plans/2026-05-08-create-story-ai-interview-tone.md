# 创建故事 AI 采访流话术优化 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变现有采访流程和生成链路的前提下，把创建故事页的 AI 采访流优化为更像真人采访、偏温柔陪伴型的话术体验。

**Architecture:** 本次实现只调整前端采访话术和摘要表达。核心步骤、请求映射和生成接口保持不变，把优化集中在 `interviewConfig.ts` 的动态承接文案与 `CreateStoryPage.tsx` 的摘要自然总结展示上，同时用聚焦测试保护新的关键表达不回退。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、TailwindCSS

---

### Task 1: 为新版采访话术补测试保护

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 先写失败断言**

```tsx
expect(
  screen.getByText('我记下啦，原来今晚想聊的是刷牙这件小事。那这次你最想借故事陪 TA 练习什么呢？')
).toBeInTheDocument()
```

**Step 2: 运行测试确认失败**

Run: `npm run test -- CreateStoryPage`
Expected: FAIL，现有页面还未输出新的承接话术。

**Step 3: 为摘要自然总结补断言**

```tsx
expect(
  screen.getByText(/我来确认一下：今晚是写给小米的/)
).toBeInTheDocument()
```

**Step 4: 再次运行测试，确认失败点准确**

Run: `npm run test -- CreateStoryPage`
Expected: FAIL，失败信息聚焦在新文案缺失。

### Task 2: 重构采访文案生成逻辑

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewConfig.ts`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 拆出承接语生成函数**

```ts
export function buildIncidentFollowUp(incident: string): string {
  return `我记下啦，原来今晚想聊的是${incident}。`
}
```

**Step 2: 优化风格与画风提问**

```ts
case 'style':
  return '想让我把今晚的故事写得更像轻轻哄睡，还是带一点小冒险的勇气？'
```

**Step 3: 为摘要增加自然总结文案生成器**

```ts
export function buildSummaryNarration(state: InterviewState, childName?: string | null): string {
  return `我来确认一下：今晚是写给${childName}的……`
}
```

**Step 4: 运行测试确认文案逻辑通过**

Run: `npm run test -- CreateStoryPage`
Expected: PASS 或仅剩页面接线相关失败。

### Task 3: 把新版话术接入页面

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 在用户回答后插入新的承接消息**

```tsx
appendAiMessage(`${buildIncidentFollowUp(answer)}${getStepPrompt('goal')}`)
```

**Step 2: 在摘要卡前展示自然总结段落**

```tsx
<p className="fairy-subtitle">{summaryNarration}</p>
```

**Step 3: 保持现有快捷建议和回跳能力**

```tsx
<button className="fairy-suggestion-pill" onClick={() => jumpToStep('style')} type="button">
  改氛围
</button>
```

**Step 4: 运行测试确认页面接线正确**

Run: `npm run test -- CreateStoryPage`
Expected: PASS，新的承接话术和摘要总结已可见。

### Task 4: 回归与构建验证

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewConfig.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 检查诊断**

Run: 编辑器诊断检查上述文件
Expected: 无新增 TypeScript 或 JSX 报错。

**Step 2: 运行聚焦测试**

Run: `npm run test -- CreateStoryPage`
Expected: PASS。

**Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS，前端成功构建。
