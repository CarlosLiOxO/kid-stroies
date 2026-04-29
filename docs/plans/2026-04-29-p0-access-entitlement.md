# P0 访问与归属修复 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复社区全文泄露、下载重复扣费与儿童端依赖家长登录态的问题，形成可验收的 P0 业务闭环。

**Architecture:** 以后端权限与归属模型为主线，新增社区预览投影、下载订单与访问归属、儿童访问会话与故事投递关系。前端同步拆分社区详情、已购内容入口与儿童端凭证访问链路，确保不同页面只消费匹配权限的数据接口。

**Tech Stack:** React + TypeScript + Zustand + Axios、Node.js + Express + Prisma + SQLite、Vitest

---

### Task 1: 扩展 Prisma 模型

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/prisma/migrations/<timestamp>_p0_access_and_entitlement/migration.sql`
- Test: `server/src/__tests__/story-access.test.ts`

**Step 1: 写失败测试草稿**

在 `server/src/__tests__/story-access.test.ts` 先写出目标行为占位：

```ts
it('重复下载同一故事时不会重复扣费', async () => {
  expect(true).toBe(false)
})
```

**Step 2: 运行测试确认当前缺失**

Run: `npm test -- story-access`
Expected: FAIL，提示测试文件不存在或断言失败

**Step 3: 扩展数据模型**

在 `schema.prisma` 中新增最小模型：

```prisma
model StoryEntitlement {
  id        String   @id @default(uuid())
  userId    String
  storyId   String
  type      String
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  story Story @relation(fields: [storyId], references: [id])

  @@unique([userId, storyId])
}
```

同时补充：

- `DownloadOrder`
- `StoryDelivery`
- `ChildSession`
- `User`、`Story`、`Child` 的反向 relation

**Step 4: 生成迁移**

Run: `npm run db:migrate -- --name p0_access_and_entitlement`
Expected: 生成新的 migration 文件且 Prisma 校验通过

**Step 5: 运行构建验证模型无误**

Run: `npm run build`
Expected: PASS

**Step 6: Commit**

```bash
git add server/prisma/schema.prisma server/prisma/migrations
git commit -m "feat: add entitlement and kid access models"
```

### Task 2: 实现社区预览接口

**Files:**
- Modify: `server/src/routes/stories.ts`
- Modify: `server/src/controllers/storyController.ts`
- Create: `server/src/controllers/communityController.ts`
- Create: `server/src/routes/community.ts`
- Modify: `server/src/index.ts`
- Test: `server/src/__tests__/community.test.ts`

**Step 1: 先写失败测试**

```ts
it('社区详情只返回摘要和预览页，不返回完整全文', async () => {
  const response = await request(app).get('/api/community/stories/story-id')
  expect(response.body.data.previewPages).toHaveLength(2)
  expect(response.body.data.content).toBeUndefined()
})
```

**Step 2: 运行测试确认失败**

Run: `npm test -- community`
Expected: FAIL，接口不存在或字段不匹配

**Step 3: 实现社区控制器**

在 `communityController.ts` 中新增：

```ts
export async function getCommunityStory(req: Request, res: Response, next: NextFunction) {
  // 查询公开故事，仅返回预览字段
}
```

要求：

- 列表接口只返回预览 DTO
- 详情接口新增 `previewPages`
- 不返回完整 `content`

**Step 4: 注册路由**

在 `index.ts` 挂载 `/api/community` 路由，并在 `community.ts` 中注册列表与详情接口。

**Step 5: 跑测试**

Run: `npm test -- community`
Expected: PASS

**Step 6: Commit**

```bash
git add server/src/controllers/communityController.ts server/src/routes/community.ts server/src/index.ts server/src/__tests__/community.test.ts
git commit -m "feat: add community preview endpoints"
```

### Task 3: 实现下载归属与幂等

**Files:**
- Modify: `server/src/controllers/storyController.ts`
- Modify: `server/src/routes/stories.ts`
- Test: `server/src/__tests__/story-access.test.ts`

**Step 1: 写失败测试**

```ts
it('同一用户重复下载同一故事时只扣一次 token', async () => {
  expect(firstUser.tokens - secondUser.tokens).toBe(6)
})
```

**Step 2: 运行测试确认失败**

Run: `npm test -- story-access`
Expected: FAIL，当前实现会重复扣费或查不到 entitlement

**Step 3: 改造下载逻辑**

目标逻辑：

```ts
const existingEntitlement = await tx.storyEntitlement.findUnique({
  where: { userId_storyId: { userId, storyId } },
})

if (existingEntitlement) {
  return existingEntitlement
}
```

随后在同一事务中：

- 创建 `DownloadOrder`
- 扣减买家 Token
- 增加作者 Token
- 写两条 `TokenRecord`
- 创建 `StoryEntitlement`
- 递增 `downloadCount`

**Step 4: 新增已购列表接口**

新增 `GET /api/stories/purchased`，返回当前用户拥有 entitlement 的故事列表。

**Step 5: 跑测试**

Run: `npm test -- story-access`
Expected: PASS

**Step 6: Commit**

```bash
git add server/src/controllers/storyController.ts server/src/__tests__/story-access.test.ts
git commit -m "feat: make story download idempotent"
```

### Task 4: 实现儿童访问会话与故事投递

**Files:**
- Modify: `server/src/controllers/storyController.ts`
- Create: `server/src/controllers/kidsController.ts`
- Create: `server/src/routes/kids.ts`
- Modify: `server/src/index.ts`
- Test: `server/src/__tests__/kids.test.ts`

**Step 1: 写失败测试**

```ts
it('儿童访问凭证只能读取当前孩子被推送的故事', async () => {
  expect(response.body.data.every((story) => story.childId === childId)).toBe(true)
})
```

**Step 2: 运行测试确认失败**

Run: `npm test -- kids`
Expected: FAIL，接口不存在

**Step 3: 改造推送逻辑**

在 `pushStory` 中，保留兼容性的 `isPushed/pushedAt`，并新增：

```ts
await tx.storyDelivery.create({
  data: { storyId, childId: story.childId!, pushedByUserId: userId },
})
```

**Step 4: 实现 kids 控制器**

新增：

- `POST /api/kids/sessions`
- `GET /api/kids/stories`
- `GET /api/kids/stories/:id`

要求：

- 家长登录后才能为孩子生成 session
- 儿童端后续查询只认 kid token
- 没有 token 时返回 401，不跳家长鉴权逻辑

**Step 5: 跑测试**

Run: `npm test -- kids`
Expected: PASS

**Step 6: Commit**

```bash
git add server/src/controllers/kidsController.ts server/src/routes/kids.ts server/src/__tests__/kids.test.ts server/src/controllers/storyController.ts
git commit -m "feat: add kid scoped story access"
```

### Task 5: 调整前端服务层与路由

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/services/storyService.ts`
- Create: `client/src/services/communityService.ts`
- Create: `client/src/services/kidsService.ts`
- Modify: `client/src/types/index.ts`
- Test: `client/src/pages/HomePage.test.tsx`

**Step 1: 先写或补测试占位**

```ts
it('社区故事跳转到独立社区详情路由', () => {
  expect(screen.getByRole('link', { name: /故事标题/i })).toHaveAttribute('href', '/community/story-id')
})
```

**Step 2: 运行测试确认失败**

Run: `npm test -- HomePage`
Expected: FAIL 或无相关覆盖

**Step 3: 补服务层**

新增接口封装：

```ts
communityService.getStoryPreview(id)
storyService.getPurchasedStories()
kidsService.getKidsStories(token)
```

并在 `types` 中新增：

- `CommunityStoryPreview`
- `PurchasedStory`
- `KidSessionResponse`

**Step 4: 调整路由**

在 `App.tsx` 中新增：

- `/community/:id`
- `/stories/purchased` 可选，或继续复用 stories 页面 tab

**Step 5: 运行前端测试**

Run: `npm test`
Expected: PASS

**Step 6: Commit**

```bash
git add client/src/App.tsx client/src/services client/src/types
git commit -m "feat: split community and kids service routes"
```

### Task 6: 改造社区详情与已购内容 UI

**Files:**
- Modify: `client/src/pages/CommunityPage.tsx`
- Create: `client/src/pages/CommunityStoryPage.tsx`
- Modify: `client/src/pages/StoriesPage.tsx`
- Modify: `client/src/pages/StoryDetailPage.tsx`
- Test: `client/src/pages/CommunityPage.test.tsx`

**Step 1: 写失败测试**

```ts
it('未购用户在社区详情页看不到完整分页正文', async () => {
  expect(screen.queryByText(/第 3 页/)).not.toBeInTheDocument()
})
```

**Step 2: 运行测试确认失败**

Run: `npm test -- CommunityPage`
Expected: FAIL，当前详情页仍渲染全文

**Step 3: 实现页面改造**

要求：

- 社区列表跳转到 `/community/:id`
- 社区详情页只展示摘要、前两页、作者信息、下载按钮
- 故事库增加“我的创作 / 已购内容”切换
- `StoryDetailPage` 仅面向作者或已购用户的完整阅读

**Step 4: 运行测试**

Run: `npm test -- CommunityPage`
Expected: PASS

**Step 5: Commit**

```bash
git add client/src/pages/CommunityPage.tsx client/src/pages/CommunityStoryPage.tsx client/src/pages/StoriesPage.tsx client/src/pages/StoryDetailPage.tsx
git commit -m "feat: add community preview page and purchased stories view"
```

### Task 7: 改造儿童端访问链路

**Files:**
- Modify: `client/src/pages/KidsPage.tsx`
- Modify: `client/src/pages/KidsFavoritesPage.tsx`
- Create: `client/src/components/Kids/KidAccessGate.tsx`
- Test: `client/src/pages/KidsPage.test.tsx`

**Step 1: 写失败测试**

```ts
it('没有儿童访问凭证时展示引导信息而不是跳转登录页', async () => {
  expect(screen.getByText(/请输入访问凭证|请先让家长生成访问入口/)).toBeInTheDocument()
})
```

**Step 2: 运行测试确认失败**

Run: `npm test -- KidsPage`
Expected: FAIL，当前会直接调用家长故事接口

**Step 3: 实现最小访问门**

要求：

- 从 URL 查询参数或 localStorage 读取 kid token
- 没有 token 时展示引导卡片
- 有 token 时调用 kids service 读取故事列表
- 收藏仍可暂存 localStorage，但数据来源改为 kid scoped 接口

**Step 4: 运行测试**

Run: `npm test -- KidsPage`
Expected: PASS

**Step 5: Commit**

```bash
git add client/src/pages/KidsPage.tsx client/src/pages/KidsFavoritesPage.tsx client/src/components/Kids/KidAccessGate.tsx
git commit -m "feat: add kid token based reading flow"
```

### Task 8: 更新文档并完成整体验证

**Files:**
- Modify: `.trae/specs/kid-story-platform/tasks.md`
- Modify: `.trae/specs/kid-story-platform/checklist.md`
- Modify: `.trae/specs/kid-story-platform/spec.md`
- Modify: `docs/plans/2026-04-29-p0-access-entitlement-design.md`

**Step 1: 按实际实现更新勾选状态**

把已完成任务从未完成改为已完成，仅更新真实已交付项。

**Step 2: 运行后端验证**

Run: `npm run build && npm test`
Expected: PASS

**Step 3: 运行前端验证**

Run: `npm run build && npm run lint && npm test`
Expected: PASS

**Step 4: 手工冒烟验证**

检查以下链路：

- 社区详情未购仅预览
- 下载后已购内容可见
- 重复下载不重复扣费
- 儿童端凭证访问成功

**Step 5: Commit**

```bash
git add .trae/specs/kid-story-platform docs/plans
git commit -m "docs: update p0 remediation status"
```
