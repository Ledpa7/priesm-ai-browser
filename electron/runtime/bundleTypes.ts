/** Citation Bundle v0.1 — subset used in Step 2 */

export type RenderProfileId = 'nano' | 'standard' | 'debate' | 'audit'

export interface BundleBudgets {
  hardMaxTokens: number
  softTargetTokens: number
  perSourceMaxTokens: number
  maxSources: number
}

export const PROFILE_BUDGETS: Record<RenderProfileId, BundleBudgets> = {
  nano: { hardMaxTokens: 500, softTargetTokens: 400, perSourceMaxTokens: 160, maxSources: 3 },
  standard: { hardMaxTokens: 2500, softTargetTokens: 1200, perSourceMaxTokens: 500, maxSources: 5 },
  debate: { hardMaxTokens: 3500, softTargetTokens: 1800, perSourceMaxTokens: 500, maxSources: 6 },
  audit: { hardMaxTokens: 6000, softTargetTokens: 3000, perSourceMaxTokens: 800, maxSources: 8 },
}

export interface Excerpt {
  id: string
  text: string
  rank: number
  reason?: string
  tokenEstimate: number
}

export interface Quote {
  id: string
  text: string
  tokenEstimate: number
}

export interface BundleSource {
  id: string
  url: string
  title: string
  accessedAt: string
  pageSummary: string
  excerpts: Excerpt[]
  quotes: Quote[]
  scores: { relevance: number }
  economy: {
    rawCharsEstimated: number
    excerptChars: number
    estimatedTokens: number
    compressionRatio: number
  }
  flags?: string[]
}

export interface BrowseTraceEvent {
  type: string
  at: string
  [key: string]: unknown
}

export interface BundleEconomy {
  baselineTokensIfRawPerModel: number
  tokensForSingleModel: number
  fanout: {
    modelCountTarget: number
    totalTokensEstimated: number
    savedTokensEstimated: number
    savedRatioEstimated: number
  }
  budgets: {
    hardMaxTokens: number
    softTargetTokens: number
    perSourceMaxTokens: number
  }
  cache: {
    hitSourceIds: string[]
    missSourceIds: string[]
  }
}

export interface CitationBundle {
  version: '0.1'
  id: string
  createdAt: string
  query: {
    text: string
    language?: string
    intent?: string
  }
  sources: BundleSource[]
  trace: BrowseTraceEvent[]
  economy: BundleEconomy
  render: {
    defaultProfile: RenderProfileId
  }
  permissionsUsed: Array<'search' | 'open' | 'read' | 'screenshot' | 'act'>
  warnings?: string[]
}

export interface BuildBundleInput {
  query: string
  profile?: RenderProfileId
  modelCountTarget?: number
  pages: Array<{
    url: string
    title: string
    mainText: string
    rawHTMLLength: number
    method?: string
    fromCache?: boolean
  }>
}