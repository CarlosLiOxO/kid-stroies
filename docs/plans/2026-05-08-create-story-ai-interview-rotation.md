# 创建故事 AI 采访流固定轮换 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为创建故事页的 AI 采访流加入稳定可复现的话术轮换，让同一步在不同回答下使用不同的温柔表达，同时保持测试和线上行为可预测。

**Architecture:** 本次实现把固定轮换逻辑集中在 `interviewConfig.ts`，通过一个稳定模板选择器为开场语、承接语、提问语和摘要自然总结提供 2-3 套同义模板。页面层仍然沿用现有步骤推进，只负责把孩子名和用户回答传给配置层，不新增复杂状态。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、TailwindCSS

---

### Task 1: 为固定轮换补测试保护

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 写出新版话术断言**

```tsx
await screen.findByText('收到啦，今晚我们就把今天不想刷牙这件小烦恼，慢慢聊成一个故事。那这次你最想借故事轻轻陪 TA 练习什么，或者缓解哪种小情绪呢？')
```

**Step 2: 运行测试确认当前失败**

Run: `npm run test -- CreateStoryPage`
Expected: FAIL，说明轮换后的话术尚未接入。

**Step 3: 为摘要自然总结补新的固定轮换断言**

```tsx
expect(screen.getByText(/今晚是写给小米的，我们会围绕今天不想刷牙/)).toBeInTheDocument()
```

### Task 2: 实现配置层固定轮换选择器

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewConfig.ts`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 新增稳定模板选择器**

```ts
function pickTemplate(options: string[], seed: string): string {
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return options[hash % options.length]
}
```

**Step 2: 给开场语、承接语和提问语补 2-3 套模板**

```ts
const goalPromptVariants = [
  '这次你最想借故事轻轻陪 TA 练习什么，或者缓解哪种小情绪呢？',
  '那今晚这篇故事，你最想悄悄帮 TA 学会什么呀？',
]
```

**Step 3: 用固定 seed 接入模板选择**

```ts
return pickTemplate(goalPromptVariants, seedText || childName || 'goal')
```

### Task 3: 接入页面并修正测试

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 保持现有流程不变，仅替换配置函数输出**

```tsx
appendAiMessage(`${buildIncidentFollowUp(answer)}${getStepPrompt('goal', currentPreviewChild?.name, answer)}`)
```

**Step 2: 跑测试确认接线正确**

Run: `npm run test -- CreateStoryPage`
Expected: PASS。

### Task 4: 诊断与构建验证

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/features/create-story/interviewConfig.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.test.tsx`

**Step 1: 检查诊断**

Run: 编辑器诊断检查上述文件
Expected: 无新增错误。

**Step 2: 运行聚焦测试**

Run: `npm run test -- CreateStoryPage`
Expected: PASS。

**Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS。
