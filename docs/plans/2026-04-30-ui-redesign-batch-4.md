# UI 绘本化重设计第四批 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成认证入口批绘本化升级，重做 `LoginPage`、`RegisterPage`，并让认证场景进入更安静的轻壳层模式，使首页到认证页再到登录后主流程的品牌体验形成闭环。

**Architecture:** 本次实现继续复用现有 `fairy-*` 设计基座，在 `client/src/index.css` 中补少量认证场景语义类。页面层只重构视觉布局、文案层级和壳层表现，不改动登录/注册业务逻辑、认证接口、认证 store 与跳转流程。

**Tech Stack:** React、TypeScript、Vite、TailwindCSS、React Router、Zustand、Vitest、Testing Library

---

### 任务 1：补齐认证入口批样式基座

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 盘点认证页与现有 fairy 基座差距**

- 阅读 `LoginPage.tsx`、`RegisterPage.tsx` 和 `AppLayout.tsx`，列出认证场景无法直接复用的样式需求。

**Step 2: 新增最少量认证语义类**

- 在 `client/src/index.css` 中补充少量认证场景语义类，例如：
- `fairy-auth-shell`
- `fairy-auth-card`
- `fairy-auth-hero`
- `fairy-auth-note`

**Step 3: 确认与前三批同源**

- 复查颜色、圆角、阴影和输入框风格与前三批一致，不单独分裂出新的认证主题系统。

### 任务 2：重做 LoginPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/LoginPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 保留登录业务逻辑**

- 保持 `email`、`password`、`login`、`navigate('/dashboard')` 与错误处理逻辑不变。

**Step 2: 重构页面定位为“回到今晚的故事准备台”**

- 外层切到认证专用壳层；
- 顶部文案强化欢迎回来、继续准备故事的氛围；
- 表单区保持登录效率和可读性。

**Step 3: 重构错误态与底部跳转引导**

- 错误提示切换为 fairy 体系；
- “没有账号 -> 去注册”保持跳转逻辑不变，但文案层级和链接表达更自然。

### 任务 3：重做 RegisterPage

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/RegisterPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`

**Step 1: 保留注册业务逻辑**

- 保持 `name`、`email`、`password`、`register` 与 `navigate('/dashboard')` 不变。

**Step 2: 重构页面定位为“为孩子开启第一本专属童话”**

- 强化品牌承诺、副标题和启程感；
- 表单区与引导区分层更明确；
- 相比登录页允许更多品牌性表达，但不添加新业务字段。

**Step 3: 重构错误态与底部跳转引导**

- 错误提示切换为 fairy 体系；
- “已有账号 -> 去登录”保持逻辑不变，但视觉统一。

### 任务 4：实现认证轻壳层

**Files:**
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/AppLayout.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Header.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/MobileNavigation.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Footer.tsx`

**Step 1: 识别认证场景**

- 在壳层中根据当前 pathname 判断是否为 `/login` 或 `/register`。

**Step 2: Header 进入轻模式**

- 保留品牌入口；
- 隐藏主导航；
- 收束右侧入口，避免分散注意力。

**Step 3: 移动端底部导航在认证场景隐藏**

- 不影响非认证页面现有导航逻辑。

**Step 4: Footer 在认证场景弱化**

- 保留品牌一致性，但降低信息密度和视觉权重。

### 任务 5：验证与提交

**Files:**
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/spec.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/tasks.md`
- Modify: `/Users/mi/Documents/kid-story/.trae/specs/kid-story-platform/checklist.md`
- Modify: `/Users/mi/Documents/kid-story/client/src/index.css`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/LoginPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/pages/RegisterPage.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/AppLayout.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Header.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/MobileNavigation.tsx`
- Modify: `/Users/mi/Documents/kid-story/client/src/components/Layout/Footer.tsx`
- Create: `/Users/mi/Documents/kid-story/docs/plans/2026-04-30-ui-redesign-batch-4-design.md`
- Create: `/Users/mi/Documents/kid-story/docs/plans/2026-04-30-ui-redesign-batch-4.md`

**Step 1: 检查诊断**

- 对登录页、注册页、壳层组件和 `index.css` 运行诊断，确认无新增错误。

**Step 2: 运行前端测试回归**

Run: `npm run test -- HomePage StoriesPage CommunityPage KidsPage`
Expected: PASS，现有绘本化页面测试不受认证入口改版影响。

**Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS，认证入口批改版后前端完整构建通过。

**Step 4: 手动验证**

- 检查 `/login`、`/register` 的桌面端与移动端布局；
- 检查认证页下 Header、Footer、MobileNavigation 的轻壳层表现；
- 检查登录/注册成功仍跳转到 `/dashboard`；
- 检查登录/注册错误态仍可正常显示。

**Step 5: 提交**

```bash
git add .trae/specs/kid-story-platform/spec.md \
  .trae/specs/kid-story-platform/tasks.md \
  .trae/specs/kid-story-platform/checklist.md \
  docs/plans/2026-04-30-ui-redesign-batch-4-design.md \
  docs/plans/2026-04-30-ui-redesign-batch-4.md \
  client/src/index.css \
  client/src/pages/LoginPage.tsx \
  client/src/pages/RegisterPage.tsx \
  client/src/components/Layout/AppLayout.tsx \
  client/src/components/Layout/Header.tsx \
  client/src/components/Layout/MobileNavigation.tsx \
  client/src/components/Layout/Footer.tsx
git commit -m "feat: redesign auth entry experience"
```
