import { estimateTokens } from './tokens'

export interface TextChunk {
  id: string
  text: string
  index: number
  tokenEstimate: number
  score: number
}

/** Split main text into paragraph-ish chunks. */
export function chunkText(text: string, targetChars = 450): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const paras = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let buf = ''
  for (const p of paras) {
    if ((buf + '\n\n' + p).length > targetChars && buf) {
      chunks.push(buf.trim())
      buf = p
    } else {
      buf = buf ? `${buf}\n\n${p}` : p
    }
  }
  if (buf.trim()) chunks.push(buf.trim())

  // If still one giant block, hard-split
  const hard: string[] = []
  for (const c of chunks) {
    if (c.length <= targetChars * 1.5) hard.push(c)
    else {
      for (let i = 0; i < c.length; i += targetChars) {
        hard.push(c.slice(i, i + targetChars).trim())
      }
    }
  }

  return hard.filter(Boolean).map((t, index) => ({
    id: `ch_${index + 1}`,
    text: t,
    index,
    tokenEstimate: estimateTokens(t),
    score: 0,
  }))
}

/** Very light query relevance: keyword overlap (Step 2; embedding in Step 4). */
export function scoreChunkAgainstQuery(chunkTextValue: string, query: string): number {
  const q = query.toLowerCase().trim()
  if (!q) return 0.5
  const terms = q
    .split(/[^a-z0-9\uac00-\ud7a3]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
  if (terms.length === 0) return 0.5

  const hay = chunkTextValue.toLowerCase()
  let hit = 0
  for (const t of terms) {
    if (hay.includes(t)) hit += 1
  }
  const coverage = hit / terms.length
  // slight bonus for earlier chunks (lead bias)
  return coverage
}

export function rankChunks(chunks: TextChunk[], query: string): TextChunk[] {
  return chunks
    .map((c, i) => {
      const base = scoreChunkAgainstQuery(c.text, query)
      const lead = i === 0 ? 0.08 : i === 1 ? 0.04 : 0
      return { ...c, score: Math.min(1, base + lead) }
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
}