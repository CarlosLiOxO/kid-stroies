# UI 绘本化重设计 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改动核心业务链路的前提下，为家长端建立统一的轻童话绘本风视觉系统，并优先完成首页、创建故事页、故事库、社区页的绘本化升级。

**Architecture:** 本次实现先从全局样式基座入手，把颜色、圆角、阴影、按钮、卡片、输入框和背景动效沉淀到 `client/src/index.css`，再升级全局布局壳与导航，最后逐页改造核心页面。页面改造尽量复用语义类和已有业务结构，避免为了视觉升级引入新的路由、状态管理或接口变化。

**Tech Stack:** React、TypeScript、Vite、TailwindCSS、React Router、Vitest、Testing Library

---

### 任务 1：重构全局设计基座

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/main.tsx`

**Step 1: 梳理现有全局语义类**

- 阅读 `client/src/index.css`，记录当前 `story-card`、`btn-*`、`input-field`、`page-title`、`page-container` 的定义，确认哪些类可以保留并升级，哪些类需要新增。

**Step 2: 设计新的主题层次**

- 在 `client/src/index.css` 中补充新的背景渐变、光晕层、云朵/星屑装饰、按钮、卡片、输入框、标签、分区标题等语义类。
- 保持现有类名兼容，优先通过增强现有类避免全站大面积回归。

**Step 3: 加入轻量背景动效**

- 新增低频率、低透明度的背景动画类。
- 优先使用 `transform` 和 `opacity`，避免高成本动画属性。

**Step 4: 挂载全局背景容器所需的基础类**

- 如有必要，在 `client/src/main.tsx` 或布局层预留背景容器依赖的基础类名或结构。

**Step 5: 运行前端构建验证样式层未破坏编译**

Run: `npm run build`
Expected: PASS，前端成功构建，无样式相关编译错误。

### 任务 2：升级全局布局壳与导航

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/AppLayout.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Header.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/MobileNavigation.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Footer.tsx`
- Test: `/Users/mi/Documents/kid-story/client/src/pages/HomePage.test.tsx`

**Step 1: 调整 `AppLayout` 背景与容器结构**

- 给 `AppLayout` 增加统一背景层、主内容最大宽度和分区留白节奏。
- 保证背景装饰不会覆盖交互元素。

**Step 2: 重做顶部导航**

- 在 `Header.tsx` 中强化品牌名称、页面主入口和当前路由高亮。
- 桌面端与移动端都保持绘本风统一，而不是后台工具栏风格。

**Step 3: 重做移动端底部导航**

- 在 `MobileNavigation.tsx` 中优化选中态、按钮形态和背景层次。
- 保留当前入口结构，不调整路由信息架构。

**Step 4: 收尾底部信息区域**

- 在 `Footer.tsx` 中同步主题色、字体和留白，避免风格割裂。

**Step 5: 运行前端构建验证布局层稳定**

Run: `npm run build`
Expected: PASS，布局与导航升级后前端仍可成功构建。

### 任务 3：重做首页品牌首屏

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/HomePage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/HomePage.test.tsx`

**Step 1: 先补或调整首页结构断言**

- 更新 `HomePage.test.tsx`，确保首页仍保留三大核心入口链接。
- 如新增首屏标题或主 CTA，补充关键文案断言，避免重构后信息丢失。

**Step 2: 重构首页首屏与快捷入口**

- 在 `HomePage.tsx` 中加入更完整的品牌标题、副标题、主行动按钮和情绪化背景层。
- 保留“创建故事 / 故事库 / 社区分享”三大入口，但把它们升级成更像绘本模块的入口卡片。

**Step 3: 强化版式节奏**

- 增加适度的分区标题、说明文案和卡片层级，让页面不再像单纯导航页。

**Step 4: 运行首页测试**

Run: `npm run test -- HomePage`
Expected: PASS，首页入口链接与关键结构断言通过。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，首页改版后前端成功构建。

### 任务 4：重做创建故事页

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 梳理创建故事页现有分区**

- 阅读 `CreateStoryPage.tsx`，标出孩子选择、需求输入、风格选择、生成按钮、状态反馈等区块。

**Step 2: 升级为“故事编织台”布局**

- 将页面改造成更清晰的模块化结构，例如左侧输入/右侧预览提示，或上下分区的绘本工作台。
- 不调整现有表单状态管理和提交逻辑。

**Step 3: 统一表单与操作样式**

- 给输入框、选项、标签、按钮、提示区使用新的绘本风语义类。
- 保证 loading、报错、空态仍清晰可见。

**Step 4: 运行前端构建**

Run: `npm run build`
Expected: PASS，创建故事页视觉升级后无 TypeScript 或构建错误。

### 任务 5：重做故事库页

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.test.tsx`

**Step 1: 调整故事库测试以保护关键交互**

- 保留并强化“内容区可点详情、按钮区独立”的现有断言。
- 如新增筛选标题或空态表达，可补充基础结构断言。

**Step 2: 升级故事卡片为绘本书架风格**

- 在 `StoriesPage.tsx` 中增强卡片封面区、标题区、摘要区、标签区和操作区层级。
- 保留当前点击范围设计，避免交互回退。

**Step 3: 强化筛选与页面标题区**

- 让搜索、筛选、页面说明与内容列表更有浏览节奏，而不是普通表单堆叠。

**Step 4: 运行故事库测试**

Run: `npm run test -- StoriesPage`
Expected: PASS，故事库卡片详情跳转与按钮区断言通过。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，故事库改版后前端成功构建。

### 任务 6：重做社区页

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.test.tsx`

**Step 1: 调整社区页测试以保护关键交互**

- 保留“内容区可点详情、下载按钮独立”的现有断言。
- 如新增页面导语或筛选模块，可补充关键结构断言。

**Step 2: 升级社区浏览体验**

- 在 `CommunityPage.tsx` 中强化页面导语、筛选区、故事卡片和下载入口的层级。
- 让社区氛围更像故事集市与灵感广场，而不是普通列表页。

**Step 3: 统一与故事库共享的视觉语言**

- 复用卡片、标签、分区标题、背景与状态样式。
- 用文案、局部色彩和模块布局区分“我的故事”与“社区探索”。

**Step 4: 运行社区页测试**

Run: `npm run test -- CommunityPage`
Expected: PASS，社区详情跳转与下载按钮断言通过。

**Step 5: 运行前端构建**

Run: `npm run build`
Expected: PASS，社区页改版后前端成功构建。

### 任务 7：诊断、回归与提交

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/AppLayout.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Header.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/MobileNavigation.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Footer.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/HomePage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CreateStoryPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/HomePage.test.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/StoriesPage.test.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/CommunityPage.test.tsx`

**Step 1: 检查最近修改文件诊断**

- 对上述文件执行诊断检查，确认没有新增 TypeScript 或 JSX 报错。

**Step 2: 运行聚焦测试**

Run: `npm run test -- HomePage StoriesPage CommunityPage`
Expected: PASS，首页、故事库、社区页测试全部通过。

**Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS，前端完整构建通过。

**Step 4: 手动验证核心页面**

- 本地启动后检查首页、创建故事页、故事库、社区页在移动端宽度和桌面宽度下的表现。
- 确认背景动效不遮挡内容，按钮、输入框和卡片点击区域正常。

**Step 5: 提交**

```bash
git add .trae/specs/kid-story-platform/spec.md \
  .trae/specs/kid-story-platform/tasks.md \
  .trae/specs/kid-story-platform/checklist.md \
  docs/plans/2026-04-30-ui-redesign-design.md \
  docs/plans/2026-04-30-ui-redesign.md \
  client/src/index.css \
  client/src/components/Layout/AppLayout.tsx \
  client/src/components/Layout/Header.tsx \
  client/src/components/Layout/MobileNavigation.tsx \
  client/src/components/Layout/Footer.tsx \
  client/src/pages/HomePage.tsx \
  client/src/pages/CreateStoryPage.tsx \
  client/src/pages/StoriesPage.tsx \
  client/src/pages/CommunityPage.tsx \
  client/src/pages/HomePage.test.tsx \
  client/src/pages/StoriesPage.test.tsx \
  client/src/pages/CommunityPage.test.tsx
git commit -m "feat: redesign parent experience with storybook theme"
```
