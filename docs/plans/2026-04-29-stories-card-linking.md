# 故事库卡片详情入口实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让故事库页面中的卡片内容区整块可点击进入故事详情，同时保持底部操作按钮独立可用。

**Architecture:** 保持现有故事库数据获取、按钮操作和详情路由不变，只调整 `StoriesPage` 的卡片 DOM 结构。把封面、标题、摘要和标签整合到一个大的 `Link` 容器中，并让底部按钮区继续留在 `Link` 之外，避免事件冒泡冲突。

**Tech Stack:** React、TypeScript、React Router、Vitest、Testing Library

---

### 任务 1：补充交互测试

**Files:**
- Create: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.test.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.tsx`

**Step 1: 写一个失败测试**

- 验证故事卡片存在一个指向 `/stories/:id` 的链接
- 验证底部按钮仍然独立渲染

**Step 2: 运行测试确认失败**

Run: `npm run test -- StoriesPage`
Expected: FAIL，因为当前只有标题是链接，卡片内容区不是整体链接。

### 任务 2：调整卡片结构

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.tsx`

**Step 1: 抽出内容区链接**

- 用 `Link` 包裹封面、标题、摘要、标签区
- 让 `Link` 使用 `block` 并继承当前卡片视觉样式

**Step 2: 保留按钮区独立**

- `公开到社区`
- `推送到孩子端`
- `删除`

这三个按钮保留在链接容器外，避免误触跳详情。

### 任务 3：验证

**Files:**
- Test: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.test.tsx`

**Step 1: 运行测试**

Run: `npm run test -- StoriesPage`
Expected: PASS

**Step 2: 构建前端**

Run: `npm run build`
Expected: PASS

**Step 3: 检查诊断**

- 使用诊断工具检查 `StoriesPage` 与测试文件

**Step 4: 提交**

```bash
git add client/src/pages/StoriesPage.tsx \
  client/src/pages/StoriesPage.test.tsx \
  docs/plans/2026-04-29-stories-card-linking.md
git commit -m "fix: make story cards open details from content area"
```
