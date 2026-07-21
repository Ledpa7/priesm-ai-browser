import type { SharedContext } from '../../lib/types'

/** Rough token estimate for renderer-side display (mirrors main heuristic). */
export function estimateTokensLite(text: string): number {
  if (!text) return 0
  const s = text.trim()
  if (!s) return 0
  const cjk = (s.match(/[\u3000-\u9fff\uac00-\ud7af]/g) || []).length
  const ratio = cjk / s.length
  const charsPerToken = ratio > 0.3 ? 1.8 : 4
  return Math.max(1, Math.ceil(s.length / charsPerToken))
}

/**
 * Step 3: one shared evidence bundle + user question → identical context for every slot.
 * Real adapters later will send `fullPrompt` (or structured messages) to each provider.
 */
export function buildSlotPrompt(userPrompt: string, shared?: SharedContext | null): {
  fullPrompt: string
  tokensEst: number
  usedShared: boolean
} {
  const q = userPrompt.trim()
  if (!shared?.text) {
    return {
      fullPrompt: q,
      tokensEst: estimateTokensLite(q),
      usedShared: false,
    }
  }

  const fullPrompt = [
    shared.text.trim(),
    '',
    '---',
    'User question:',
    q,
    '',
    'Answer using the evidence bundle above when relevant. Cite source ids like [src_01].',
    'If evidence is insufficient, say what is missing.',
  ].join('\n')

  return {
    fullPrompt,
    tokensEst: estimateTokensLite(fullPrompt),
    usedShared: true,
  }
}

export function fanoutEconomy(shared: SharedContext | null | undefined, enabledCount: number, perSlotPromptTok: number) {
  const n = Math.max(1, enabledCount)
  const withBundle = perSlotPromptTok * n
  const rawPer = shared?.baselineTokensIfRawPerModel
  const rawFanout = rawPer != null ? rawPer * n + estimateTokensLite('q') * n : null
  const saved = rawFanout != null ? Math.max(0, rawFanout - withBundle) : shared?.savedTokensFanoutEst ?? null
  const savedRatio = rawFanout && rawFanout > 0 && saved != null ? saved / rawFanout : null
  return { n, withBundle, rawFanout, saved, savedRatio }
}
