import type { AiSlot, RayResult } from '../../lib/types'

/**
 * Phase 0 stub.
 * Later: port APSE from 8-priesm-project/src/sidepanel/lib/synthesis.ts
 */
export function stubSynthesize(slots: AiSlot[], prompt: string): RayResult {
  const active = slots.filter((s) => s.enabled && s.lastResponse)
  if (active.length === 0) {
    return {
      summary: '아직 수집된 응답이 없습니다. 먼저 질문을 전송하세요.',
      engine: 'stub',
      createdAt: Date.now(),
    }
  }

  const names = active.map((s) => s.name).join(', ')
  const preview = active
    .map((s) => s.lastResponse?.slice(0, 80).replace(/\s+/g, ' '))
    .filter(Boolean)
    .join(' / ')

  return {
    summary: `「${prompt.slice(0, 40)}${prompt.length > 40 ? '…' : ''}」에 대해 ${names} 응답을 종합(스텁). 핵심 미리보기: ${preview}`,
    engine: 'stub',
    createdAt: Date.now(),
  }
}
