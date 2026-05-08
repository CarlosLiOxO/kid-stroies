# 首页快捷入口图标微调 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 移除首页快捷入口区右上角标签，并将三张入口卡片的字徽替换为 emoji 图标。

**Architecture:** 仅修改首页快捷入口的数据结构与展示层，不触碰路由、卡片布局和其他页面。通过最小 UI 变更完成视觉微调，并用现有首页测试与构建进行回归验证。

**Tech Stack:** React、TypeScript、Tailwind CSS、Vitest、Testing Library

---

### Task 1: 更新首页快捷入口展示

**Files:**
- Modify: `client/src/pages/HomePage.tsx`
- Test: `client/src/pages/HomePage.test.tsx`

**Step 1: 修改快捷入口数据**

- 删除右上角“3 个核心入口”标签。
- 将快捷入口数据中的字徽替换为 emoji 图标：
  - `创建故事` -> `✨`
  - `故事库` -> `📚`
  - `社区分享` -> `🌟`

**Step 2: 保持结构不变**

- 不修改卡片链接目标。
- 不修改卡片主文案和副文案。

**Step 3: 运行回归验证**

Run: `npm run test -- HomePage`
Expected: PASS

Run: `npm run build`
Expected: PASS
