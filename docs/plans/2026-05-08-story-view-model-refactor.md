# 故事展示模型统一化 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在前端服务层统一归一化故事数据，消除页面对 `content`/`images` 序列化细节的依赖。

**Architecture:** 保留后端接口不变，在 `client` 侧拆分故事原始响应类型与展示类型，并新增适配器负责分页、图片与预览文案的统一转换。`storyService` 返回归一化后的 `Story`，`storyStore` 与各页面只消费稳定的 `pages`、`images` 和 `previewText` 字段。

**Tech Stack:** React、TypeScript、Zustand、Vitest、Testing Library

---

### Task 1: 建立故事适配层

**Files:**
- Modify: `client/src/types/index.ts`
- Create: `client/src/services/storyAdapter.ts`
- Test: `client/src/services/storyAdapter.test.ts`

**Step 1: 拆分故事类型**

- 新增 `StoryDTO` 表示后端原始响应。
- 新增 `StoryPage` 与归一化后的 `Story` 展示模型。
- 让展示模型直接暴露 `pages`、`images`、`previewText`。

**Step 2: 实现统一归一化**

- 在适配器中实现 `normalizeStory` 与 `normalizeStories`。
- 统一处理 `content` JSON、非法数据、空数组与 `images` 的字符串/数组兼容。
- 为 `previewText` 提供统一兜底文案。

**Step 3: 编写适配器测试**

Run: `npm run test -- storyAdapter`
Expected: PASS

### Task 2: 接入服务层与状态层

**Files:**
- Modify: `client/src/services/storyService.ts`
- Modify: `client/src/stores/storyStore.ts`

**Step 1: 让服务层返回展示模型**

- 所有故事相关接口统一以 `StoryDTO` 作为入站类型。
- 在 `getStories`、`getStory`、`createStory`、`updateStory`、`pushStory`、`downloadStory` 中调用适配器。

**Step 2: 保持 store 对外契约稳定**

- `storyStore` 继续对页面暴露 `Story`，但此时它已经是归一化后的展示模型。
- 确认增删改查与推送流程都仍然工作。

### Task 3: 清理页面分散解析逻辑

**Files:**
- Modify: `client/src/pages/CreateStoryPage.tsx`
- Modify: `client/src/pages/StoryDetailPage.tsx`
- Modify: `client/src/pages/StoriesPage.tsx`
- Modify: `client/src/pages/CommunityPage.tsx`
- Modify: `client/src/pages/KidsPage.tsx`
- Modify: `client/src/pages/KidsFavoritesPage.tsx`

**Step 1: 页面改用统一字段**

- 阅读页改用 `story.pages` 与 `story.images`。
- 列表/社区页改用 `story.previewText` 与 `story.images[0]`。
- 创建页生成成功后直接渲染 `generatedStory.pages` 和 `generatedStory.images`。

**Step 2: 删除重复工具函数**

- 移除页面内的 `parseStoryPages`、`parseImages`、`parseStoryPreview`、`firstStoryParagraph`。
- 保持页面只负责渲染与交互。

### Task 4: 回归验证

**Files:**
- Modify: `client/src/pages/StoriesPage.test.tsx`
- Modify: `client/src/pages/CommunityPage.test.tsx`

**Step 1: 更新受影响测试数据**

- 把页面测试中的故事 mock 改为归一化后的结构。
- 覆盖 `previewText` 与 `images` 数组的直接消费路径。

**Step 2: 运行验证**

Run: `npm run test -- storyAdapter StoriesPage CommunityPage`
Expected: PASS

Run: `npm run build`
Expected: PASS
