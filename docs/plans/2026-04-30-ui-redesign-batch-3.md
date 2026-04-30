# UI 绘本化重设计第三批 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在前两批绘本化升级的基础上，继续完成 `ChildrenPage`、`KidsPage`、`KidsFavoritesPage` 的强区分视觉升级，让家长端档案页与儿童端阅读/收藏页在统一品牌母体下形成更鲜明的角色分工。

**Architecture:** 本次实现延续已经落地的 `fairy-*` 语义样式体系，并在 `client/src/index.css` 中补少量第三批所需的儿童端与档案页分支语义类。页面层仅调整容器、层级与 className 组合，不改动孩子档案 CRUD、阅读翻页、收藏、本地记录和朗读等既有业务逻辑。

**Tech Stack:** React、TypeScript、Vite、TailwindCSS、React Router、Zustand、Vitest、Testing Library

---

### 任务 1：补齐第三批语义样式类

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 盘点第三批页面所缺样式**

- 阅读 `ChildrenPage.tsx`、`KidsPage.tsx`、`KidsFavoritesPage.tsx`，列出不能直接用前两批 `fairy-*` 类覆盖的区域。

**Step 2: 新增最少量第三批语义类**

- 在 `client/src/index.css` 中补充少量第三批所需类，例如：
- `fairy-archive-card`
- `fairy-kids-stage`
- `fairy-bookmark-tab`
- `fairy-memory-card`
- `fairy-sticker-badge`

**Step 3: 复查与现有 fairy 体系的一致性**

- 确认颜色、圆角、阴影、按钮和空态仍然和前两批同源，不单独分叉新的大型样式体系。

**Step 4: 运行前端构建**

Run: `npm run build`
Expected: PASS，新增样式类后前端成功构建。

### 任务 2：重做 ChildrenPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/ChildrenPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理孩子管理页现有区块**

- 标出页头、当前孩子状态、表单编辑区、空态区、孩子角色卡列表区。

**Step 2: 重构页头为“成长档案工坊”**

- 外层切换到 `fairy-shell fairy-stack`。
- 顶部改成 `fairy-hero`，强化当前孩子状态与档案页定位。

**Step 3: 重构左栏为档案编辑台**

- 保留新增/编辑逻辑、提交逻辑与字段不变。
- 将表单视觉调整为更像角色设定簿与成长档案编辑台。

**Step 4: 重构右栏为角色卡册**

- 每个孩子条目改成更像档案卡，而不是普通管理列表。
- 当前使用中状态、标签、年龄、关注点层级更清晰。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，孩子管理页改版后前端成功构建。

### 任务 3：重做 KidsPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/KidsPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理儿童端阅读页现有区块**

- 标出左侧故事选择区、收藏入口、主阅读头部、图文舞台、翻页控制、朗读按钮。

**Step 2: 重构左侧故事入口为“书架缩略卡”**

- 保留故事切换逻辑、默认选中逻辑与收藏记录逻辑。
- 仅调整结构层级与选中态视觉表达。

**Step 3: 重构右侧主舞台为“今晚故事剧场”**

- 保留图文双栏阅读结构。
- 强化朗读按钮、阅读标题、页码信息与翻页节奏表达。
- 收藏按钮改成更像书签式操作，但不改业务逻辑。

**Step 4: 保持儿童端交互不回退**

- 不改 `handleSpeak`、`handleToggleFavorite`、`handleTurnPage` 的语义。
- 保持本地存储与阅读记录行为不变。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，儿童端阅读页改版后前端成功构建。

### 任务 4：重做 KidsFavoritesPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/KidsFavoritesPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理收藏页现有区块**

- 标出标题区、tab 切换区、空态区、卡片网格区。

**Step 2: 重构页面定位为“回忆收藏册”**

- 调整头部与统计表达，让页面更像孩子的故事书匣，而不是普通历史列表。

**Step 3: 重构 tab 为书签式切换**

- 保留 `activeTab` 逻辑不变。
- 优先复用或轻改 `fairy-choice-pill-*`，必要时补 `fairy-bookmark-tab`。

**Step 4: 重构卡片与空态**

- 收藏卡和记录卡统一升级为更有纪念感的卡片表达。
- 空态切换到统一 fairy 系列的空态容器。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，儿童端收藏页改版后前端成功构建。

### 任务 5：验证与提交

**Files:**
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/spec.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/tasks.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/checklist.md`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/ChildrenPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/KidsPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/KidsFavoritesPage.tsx`
- Create: `/Users/mi/Documents/kid-story/docs/plans/2026-04-30-ui-redesign-batch-3-design.md`
- Create: `/Users/mi/Documents/kid-story/docs/plans/2026-04-30-ui-redesign-batch-3.md`

**Step 1: 检查诊断**

- 对 `ChildrenPage.tsx`、`KidsPage.tsx`、`KidsFavoritesPage.tsx`、`index.css` 执行诊断检查，确认无新增错误。

**Step 2: 运行已有前端测试回归**

Run: `npm run test -- HomePage StoriesPage CommunityPage`
Expected: PASS，前两批页面测试不受第三批样式调整影响。

**Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS，前端完整构建通过。

**Step 4: 手动验证**

- 检查 `ChildrenPage` 的添加、编辑、删除、切换当前孩子。
- 检查 `KidsPage` 的选书、朗读、收藏、翻页和阅读记录写入。
- 检查 `KidsFavoritesPage` 的 tab 切换、空态与收藏列表展示。
- 验证移动端与桌面端均无明显布局断裂。

**Step 5: 提交**

```bash
git add .trae/specs/kid-story-platform/spec.md \
  .trae/specs/kid-story-platform/tasks.md \
  .trae/specs/kid-story-platform/checklist.md \
  docs/plans/2026-04-30-ui-redesign-batch-3-design.md \
  docs/plans/2026-04-30-ui-redesign-batch-3.md \
  client/src/index.css \
  client/src/pages/ChildrenPage.tsx \
  client/src/pages/KidsPage.tsx \
  client/src/pages/KidsFavoritesPage.tsx
git commit -m "feat: extend storybook redesign to kids experience"
```
