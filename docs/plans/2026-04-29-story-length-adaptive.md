# 故事篇幅自适应实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让故事生成按孩子年龄自动输出更长的篇幅，并同步放宽生成接口超时，避免线上生成故事过短或请求过早超时。

**Architecture:** 保持现有“前端表单 -> storyStore -> storyService -> 后端 controller -> aiService -> Prisma 持久化”的链路不变，把篇幅策略集中收口到后端 `aiService`。前端不新增长度选项，只在生成接口上增加更合理的超时与错误提示，减少对现有页面结构的影响。

**Tech Stack:** React、TypeScript、Zustand、Axios、Node.js、Express、Prisma、GLM-4.7

---

### 任务 1：更新规范文档

**Files:**
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/spec.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/tasks.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/checklist.md`

**Step 1: 补充需求描述**

- 在 `spec.md` 的 AI 故事生成章节新增按年龄自适应篇幅规则：
- `3-5 岁 6 页`
- `6-8 岁 8 页`
- `9-12 岁 10 页`
- 每页 `3-5` 句，整体保持适合儿童朗读。

**Step 2: 更新任务列表**

- 在 `tasks.md` 中新增故事篇幅自适应与生成超时优化任务，标记为当前待完成项。

**Step 3: 更新验收清单**

- 在 `checklist.md` 中新增按年龄分段页数、生成接口超时与错误提示检查项。

### 任务 2：重构后端篇幅策略

**Files:**
- Modify: `/Users/mi/Documents/kid-story/server/src/services/aiService.ts`

**Step 1: 提取年龄分段规则**

- 新增一个函数，返回目标页数与单页句数要求：

```ts
function getStoryLengthPlan(age?: number): { pageCount: number; sentenceGuide: string } {
  if (!age || age <= 5) {
    return { pageCount: 6, sentenceGuide: '每页 3-4 句' };
  }

  if (age <= 8) {
    return { pageCount: 8, sentenceGuide: '每页 3-4 句' };
  }

  return { pageCount: 10, sentenceGuide: '每页 4-5 句' };
}
```

**Step 2: 调整 GLM 提示词**

- 把固定 `4 页`、`每页 2-3 句` 改为动态文案。
- 让 JSON 输出示例按目标页数动态生成。

**Step 3: 修复解析裁剪逻辑**

- 去掉固定 `slice(0, 4)`。
- 改为按目标页数保留，并在不足时补 fallback 页。

**Step 4: 同步调整兜底故事**

- 让 `buildFallbackPages` 根据年龄输出 6/8/10 页。
- 兜底内容保持首因、冒险、转折、解决、收束的完整结构。

### 任务 3：放宽前端生成接口超时

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/services/api.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/services/storyService.ts`
- Modify: `/Users/mi/Documents/kid-story/client/src/stores/storyStore.ts`

**Step 1: 保持普通接口策略简单**

- 全局 axios timeout 维持通用设置或适度上调，避免影响全部接口。

**Step 2: 给生成故事单独加长超时**

- 在 `storyService.createStory` 对 `POST /stories` 单独传入更长 timeout，例如 `90000`。

**Step 3: 优化超时报错**

- 在 `storyStore.addStory` 中优先提取后端 `message`。
- 对超时错误映射为更友好的中文提示，例如“AI 正在生成较长故事，请稍候重试”。

### 任务 4：本地验证与回归

**Files:**
- Test: `/Users/mi/Documents/kid-story/server/src/services/aiService.ts`
- Test: `/Users/mi/Documents/kid-story/client/src/services/storyService.ts`

**Step 1: 构建后端**

Run: `npm run build`
Expected: PASS，无 TypeScript 编译错误。

**Step 2: 运行后端测试**

Run: `npm run test`
Expected: PASS，现有接口与数据库逻辑不回归。

**Step 3: 构建前端**

Run: `npm run build`
Expected: PASS，生成页面仍可正常渲染。

**Step 4: 检查诊断**

- 对最近修改文件执行诊断检查，确认未引入新的类型错误。

**Step 5: 提交**

```bash
git add .trae/specs/kid-story-platform/spec.md \
  .trae/specs/kid-story-platform/tasks.md \
  .trae/specs/kid-story-platform/checklist.md \
  client/src/services/api.ts \
  client/src/services/storyService.ts \
  client/src/stores/storyStore.ts \
  server/src/services/aiService.ts \
  docs/plans/2026-04-29-story-length-adaptive.md
git commit -m "feat: make story length adaptive by age"
```
