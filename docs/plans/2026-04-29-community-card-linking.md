# 社区卡片详情入口实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让社区页中的卡片内容区整块可点击进入故事详情，同时保持下载按钮独立可用。

**Architecture:** 保持现有社区列表加载、详情路由和下载逻辑不变，只调整 `CommunityPage` 的卡片 DOM 结构。将封面、标题、作者信息、预览摘要、标签和下载次数统一包进一个大的 `Link` 容器，下载按钮继续留在链接容器之外，避免误触跳详情。

**Tech Stack:** React、TypeScript、React Router、Vitest、Testing Library

---

### Task 1: 补充社区卡片测试

**Files:**
- Create: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.test.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.tsx`

**Step 1: 写一个失败测试**

- 验证社区卡片存在一个指向 `/stories/:id` 的链接
- 验证 `下载完整故事（6 Token）` 按钮仍然独立渲染

**Step 2: 运行测试确认失败**

Run: `npm run test -- CommunityPage`
Expected: FAIL，因为当前只有标题是链接，卡片内容区不是整体链接。

### Task 2: 调整社区卡片结构

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.tsx`

**Step 1: 抽出内容区链接**

- 用 `Link` 包裹封面、标题、作者信息、摘要、标签和下载次数区
- 让 `Link` 使用 `block` 并继承当前卡片视觉样式

**Step 2: 保留下载按钮独立**

- `下载完整故事（6 Token）` 按钮放在链接容器外
- 下载行为继续只触发下载，不跳详情

### Task 3: 验证

**Files:**
- Test: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.test.tsx`

**Step 1: 运行测试**

Run: `npm run test -- CommunityPage`
Expected: PASS

**Step 2: 构建前端**

Run: `npm run build`
Expected: PASS

**Step 3: 检查诊断**

- 使用诊断工具检查 `CommunityPage` 与测试文件

**Step 4: 提交**

```bash
git add client/src/pages/CommunityPage.tsx \
  client/src/pages/CommunityPage.test.tsx \
  docs/plans/2026-04-29-community-card-linking.md
git commit -m "fix: make community cards open details from content area"
```
