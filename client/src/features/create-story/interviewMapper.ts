import type { CreateStoryRequest } from '../../types'
import type { InterviewState } from './interviewConfig'

/** 将采访结果转换为创建故事请求 */
export function buildCreateStoryRequest(state: InterviewState): CreateStoryRequest {
  const promptParts = [
    `孩子今天的情况：${state.incident}`,
    `希望通过故事陪伴和引导的方向：${state.educationalGoal}`,
    `故事风格偏好：${state.style}`,
    `插画风格偏好：${state.artStyle}`,
  ]

  return {
    childId: state.childId || undefined,
    prompt: promptParts.join('\n'),
    style: state.style,
    artStyle: state.artStyle,
    educationalGoal: state.educationalGoal || undefined,
    theme: deriveTheme(state.incident),
    isPublic: state.isPublic,
  }
}

/** 从情境描述中提炼一个轻量主题 */
function deriveTheme(incident: string): string | undefined {
  const normalized = incident.trim()
  if (!normalized) {
    return undefined
  }

  const firstSentence = normalized.split(/[，。！？!?,]/)[0]?.trim()
  if (!firstSentence) {
    return undefined
  }

  return firstSentence.slice(0, 12)
}
