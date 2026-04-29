import { useEffect, useMemo, useState } from 'react'
import type { Child } from '../types'
import { useChildStore } from '../stores/childStore'

/**
 * 孩子管理页 - 管理孩子的档案信息
 * 支持新增、编辑、删除与切换当前孩子
 */
const ChildrenPage = () => {
  const {
    children,
    currentChild,
    isLoading,
    error,
    fetchChildren,
    addChild,
    updateChild,
    deleteChild,
    setCurrentChild,
    clearError,
  } = useChildStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingChild, setEditingChild] = useState<Child | null>(null)

  useEffect(() => {
    void fetchChildren()
  }, [fetchChildren])

  const submitLabel = useMemo(() => (editingChild ? '保存档案' : '添加孩子'), [editingChild])

  /**
   * 提交孩子档案表单
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()

    try {
      if (editingChild) {
        await updateChild(editingChild.id, { name, description })
      } else {
        await addChild(name, description)
      }
      setName('')
      setDescription('')
      setEditingChild(null)
    } catch {
      // 错误信息由 store 统一维护
    }
  }

  /**
   * 进入编辑态
   */
  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setName(child.name)
    setDescription(buildChildDescription(child))
  }

  /**
   * 删除孩子档案
   */
  const handleDelete = async (child: Child) => {
    const confirmed = window.confirm(`确定删除孩子档案“${child.name}”吗？关联故事也会一并移除。`)
    if (!confirmed) {
      return
    }

    try {
      await deleteChild(child.id)
    } catch {
      // 错误信息由 store 统一维护
    }
  }

  /**
   * 取消编辑状态
   */
  const handleCancelEdit = () => {
    setEditingChild(null)
    setName('')
    setDescription('')
    clearError()
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title mb-2">孩子管理</h1>
          <p className="text-amber-700">通过自然语言描述孩子特征，系统会自动整理为结构化画像。</p>
        </div>
        {currentChild ? (
          <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
            当前孩子：{currentChild.name}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="story-card p-6">
          <h2 className="mb-4 text-xl font-bold text-purple-700">
            {editingChild ? `编辑 ${editingChild.name} 的档案` : '添加新的孩子档案'}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">孩子昵称</label>
              <input
                className="input-field"
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：小米粒"
                required
                value={name}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">自然语言描述</label>
              <textarea
                className="input-field min-h-36 resize-y"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="例如：5岁男孩，活泼好动，今天不想刷牙，最近有点怕黑，喜欢恐龙。"
                required
                value={description}
              />
            </div>
            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-3">
              <button className="btn-primary flex-1" disabled={isLoading} type="submit">
                {isLoading ? '保存中...' : submitLabel}
              </button>
              {editingChild ? (
                <button className="btn-outline" onClick={handleCancelEdit} type="button">
                  取消
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {children.length === 0 ? (
            <div className="story-card p-8 text-center">
              <p className="text-lg text-gray-500">还没有添加孩子，先创建一个专属档案吧。</p>
            </div>
          ) : (
            children.map((child) => {
              const tags = parseChildTags(child.tags)
              return (
                <article className="story-card p-6" key={child.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-amber-800">{child.name}</h3>
                        {currentChild?.id === child.id ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            当前使用中
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-500">
                        {child.age ? `${child.age} 岁` : '年龄待提取'} · {child.gender ?? '未设置性别'}
                      </p>
                      <p className="text-sm leading-6 text-gray-600">
                        性格：{child.personality ?? '待提取'} | 关注点：{child.concerns ?? '待补充'}
                      </p>
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-outline" onClick={() => setCurrentChild(child)} type="button">
                        设为当前孩子
                      </button>
                      <button className="btn-secondary" onClick={() => handleEdit(child)} type="button">
                        编辑
                      </button>
                      <button className="btn-outline" onClick={() => handleDelete(child)} type="button">
                        删除
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </section>
      </div>
    </div>
  )
}

/**
 * 将结构化孩子档案还原为可编辑描述
 */
function buildChildDescription(child: Child): string {
  return [child.age ? `${child.age}岁` : '', child.gender, child.personality, child.concerns]
    .filter(Boolean)
    .join('，')
}

/**
 * 解析孩子标签 JSON
 */
function parseChildTags(rawTags?: string | null): string[] {
  if (!rawTags) {
    return []
  }

  try {
    const parsed = JSON.parse(rawTags) as Record<string, unknown>
    return Object.entries(parsed)
      .flatMap(([, value]) => (typeof value === 'string' ? value.split('、') : []))
      .filter(Boolean)
      .slice(0, 6)
  } catch {
    return []
  }
}

export default ChildrenPage
