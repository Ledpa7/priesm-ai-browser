/**
 * Lightweight token estimator (v0).
 * Not tiktoken-accurate — good enough for economy UI and budgets.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  const s = text.trim()
  if (!s) return 0

  // CJK-heavy text: ~1.5–2 chars/token; Latin: ~4 chars/token
  const cjk = (s.match(/[\u3000-\u9fff\uac00-\ud7af]/g) || []).length
  const ratio = cjk / s.length
  const charsPerToken = ratio > 0.3 ? 1.8 : 4
  return Math.max(1, Math.ceil(s.length / charsPerToken))
}

export function compressionRatio(rawChars: number, mainChars: number): number {
  if (rawChars <= 0) return 0
  return Number((mainChars / rawChars).toFixed(4))
}