# UI 绘本化重设计第二批 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在第一批绘本化升级的基础上，继续完成 `StoryDetailPage`、`DashboardPage`、`ProfilePage` 的视觉统一，让家长端形成从浏览、创作、阅读到账户管理的一致轻童话绘本风体验。

**Architecture:** 本次实现继续复用已经落地的 `fairy-*` 语义样式体系，优先通过页面外壳、分区面板、标签、状态条与列表容器替换完成视觉统一，不改动既有业务链路、store、接口和路由结构。若现有语义类不足，再在 `client/src/index.css` 中补少量新类，分别服务阅读台、指标卡与账本行。

**Tech Stack:** React、TypeScript、Vite、TailwindCSS、React Router、Zustand、Vitest、Testing Library

---

### 任务 1：补齐第二批语义样式类

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 盘点第二批页面所缺样式**

- 阅读 `StoryDetailPage.tsx`、`DashboardPage.tsx`、`ProfilePage.tsx`，记录当前无法直接复用第一批 `fairy-*` 类的区域，例如阅读舞台、指标卡和流水行。

**Step 2: 新增最少量语义类**

- 在 `client/src/index.css` 中补充少量通用类，例如：
- `fairy-reader-stage`
- `fairy-metric-card`
- `fairy-ledger-row`
- `fairy-action-row`

**Step 3: 统一消息与空态复用**

- 确认 `fairy-message-success`、`fairy-message-error`、`fairy-empty` 足以覆盖第二批页面。
- 若不足，只做轻量增强，不再新增平行体系。

**Step 4: 运行前端构建**

Run: `npm run build`
Expected: PASS，样式层补充后前端仍成功构建。

### 任务 2：重做 StoryDetailPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoryDetailPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理详情页现有区块**

- 标出头部信息区、操作区、下载消息、摘要区、阅读区、分页控制区。

**Step 2: 重构头部为“故事封面信息区”**

- 将详情页外层切换到 `fairy-shell fairy-stack`。
- 将标题、作者、孩子、适龄、摘要和主操作组合到 `fairy-hero` 中。
- 标签切换到统一 `fairy-chip-*`。

**Step 3: 重构阅读区为“绘本阅读台”**

- 把当前图文区升级为更强的左右书页布局。
- 保留现有分页逻辑、朗读逻辑、下载逻辑和推送逻辑不变。

**Step 4: 统一消息、加载和空态**

- 加载态使用更柔和的阅读占位样式。
- 错误态与下载反馈统一使用 `fairy-message-*`。
- 无内容时使用 `fairy-empty`。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，详情页改版后前端成功构建。

### 任务 3：重做 DashboardPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/DashboardPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理仪表盘现有内容结构**

- 标出欢迎区、CTA、三张统计卡、最近故事、孩子画像、阅读记录。

**Step 2: 重构顶部为“今晚故事准备台”**

- 使用 `fairy-hero` 承载欢迎语、主行动按钮和任务导向文案。
- 不改变 CTA 的跳转目标。

**Step 3: 升级指标卡与内容区**

- 将三张数据卡切换为统一 `fairy-metric-card` 风格。
- 最近故事改为更轻的绘本卡列表。
- 当前孩子画像切换到与第一批一致的语义块。

**Step 4: 优化阅读记录区**

- 保留数据来源与读取逻辑。
- 仅调整标题、卡片层级、空态和列表样式。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，仪表盘改版后前端成功构建。

### 任务 4：重做 ProfilePage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/ProfilePage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理个人中心现有区块**

- 标出账户资料区、Token 余额区、充值区、流水区和退出按钮。

**Step 2: 重构页面头部与账户卡**

- 外层改成 `fairy-shell fairy-stack`。
- 头部改成 `fairy-hero`，突出“个人中心 / 账户与资产小屋”的定位。
- 左侧账户资料区升级为更完整的账户卡。

**Step 3: 重构 Token 充值区与流水区**

- 充值区改成更清晰的钱包操作区，但保留现有按钮与逻辑。
- 流水列表改为账本式布局，复用或新增 `fairy-ledger-row`。

**Step 4: 统一错误与空态**

- 使用 `fairy-message-error` 和 `fairy-empty`，不再保留旧的红底/黄底分散样式。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，个人中心改版后前端成功构建。

### 任务 5：验证与提交

**Files:**
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/spec.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/tasks.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/checklist.md`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoryDetailPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/DashboardPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/ProfilePage.tsx`
- Create: `/Users/mi/Documents/kid-story/docs/plans/2026-04-30-ui-redesign-batch-2-design.md`
- Create: `/Users/mi/Documents/kid-story/docs/plans/2026-04-30-ui-redesign-batch-2.md`

**Step 1: 检查诊断**

- 对 `StoryDetailPage.tsx`、`DashboardPage.tsx`、`ProfilePage.tsx`、`index.css` 执行诊断检查，确认无新增错误。

**Step 2: 运行聚焦测试**

- 若本轮新增或修改了测试，执行对应聚焦测试。
- 若未新增测试，至少回归已有前端测试。

Run: `npm run test -- HomePage StoriesPage CommunityPage`
Expected: PASS，第一批页面测试不被第二批样式调整破坏。

**Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS，前端完整构建通过。

**Step 4: 手动验证**

- 检查 `StoryDetailPage` 的翻页、朗读、下载/推送按钮。
- 检查 `DashboardPage` 的主 CTA、最近故事和孩子画像。
- 检查 `ProfilePage` 的退出登录、模拟充值和流水展示。
- 验证移动端与桌面端均无明显布局断裂。

**Step 5: 提交**

```bash
git add .trae/specs/kid-story-platform/spec.md \
  .trae/specs/kid-story-platform/tasks.md \
  .trae/specs/kid-story-platform/checklist.md \
  docs/plans/2026-04-30-ui-redesign-batch-2-design.md \
  docs/plans/2026-04-30-ui-redesign-batch-2.md \
  client/src/index.css \
  client/src/pages/StoryDetailPage.tsx \
  client/src/pages/DashboardPage.tsx \
  client/src/pages/ProfilePage.tsx
git commit -m "feat: extend storybook redesign to detail and account pages"
```
