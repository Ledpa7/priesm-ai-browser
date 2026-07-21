export type SlotId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity'

export type SlotStatus = 'idle' | 'ready' | 'loading' | 'error' | 'offline'

export interface AiSlot {
  id: SlotId
  name: string
  description: string
  color: string
  status: SlotStatus
  enabled: boolean
  /** Placeholder response until real adapters land */
  lastResponse?: string
  /** Step 3: last prompt payload size sent to this slot */
  lastPromptTokensEst?: number
  /** whether shared bundle was attached on last send */
  lastUsedSharedContext?: boolean
}

export type WorkspaceMode = 'compare' | 'browse' | 'agent'

export interface RayResult {
  summary: string
  engine: 'stub' | 'apse' | 'nano' | 'local'
  createdAt: number
}

export interface SharedContext {
  url: string
  title: string
  /** model-facing evidence text (render output) */
  text: string
  tokensEst: number
  bundleId?: string
  profile?: string
  /** raw baseline tokens for economy display */
  baselineTokensIfRawPerModel?: number
  savedTokensFanoutEst?: number
  modelCountTarget?: number
}

export const DEFAULT_SLOTS: AiSlot[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI',
    color: '#10a37f',
    status: 'ready',
    enabled: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic',
    color: '#d97706',
    status: 'ready',
    enabled: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google',
    color: '#4285f4',
    status: 'ready',
    enabled: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Search AI',
    color: '#20b8cd',
    status: 'ready',
    enabled: true,
  },
]
