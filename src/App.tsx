import { useCallback, useEffect, useMemo, useState } from 'react'
import { AgentApiPanel } from './components/AgentApiPanel'
import { ExtractPanel } from './components/ExtractPanel'
import { OmniPromptBar } from './components/OmniPromptBar'
import { RayCard } from './components/RayCard'
import { SlotCard } from './components/SlotCard'
import { buildSlotPrompt, fanoutEconomy } from './features/prompt/buildSlotPrompt'
import { stubSynthesize } from './features/ray/stubSynthesize'
import {
  DEFAULT_SLOTS,
  type AiSlot,
  type RayResult,
  type SharedContext,
  type SlotId,
  type WorkspaceMode,
} from './lib/types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildStubResponse(
  slot: AiSlot,
  prompt: string,
  opts: { usedShared: boolean; promptTokens: number; bundleId?: string },
): string {
  const angles: Record<SlotId, string> = {
    chatgpt: '구조적으로 정리하면',
    claude: '신중히 검토하면',
    gemini: '다양한 관점을 합치면',
    perplexity: '공개 정보 기준으로 보면',
  }
  const shareLine = opts.usedShared
    ? `\n\n[FANOUT] 동일 Evidence Bundle 수신 (${opts.bundleId || 'bundle'}) · prompt ~${opts.promptTokens} tok`
    : '\n\n[FANOUT] shared bundle 없음 · 질문만 전송'
  return `${angles[slot.id]}, 「${prompt}」에 대한 ${slot.name} 스텁 응답입니다.${shareLine}`
}

export default function App() {
  const [slots, setSlots] = useState<AiSlot[]>(DEFAULT_SLOTS)
  const [mode, setMode] = useState<WorkspaceMode>('compare')
  const [lastPrompt, setLastPrompt] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRayRunning, setIsRayRunning] = useState(false)
  const [rayResult, setRayResult] = useState<RayResult | null>(null)
  const [appInfo, setAppInfo] = useState<string>('Priesm AI Browser')
  const [sharedContext, setSharedContext] = useState<SharedContext | null>(null)
  const [showExtract, setShowExtract] = useState(true)
  const [showAgentApi, setShowAgentApi] = useState(true)
  const [lastFanout, setLastFanout] = useState<{
    n: number
    perSlot: number
    total: number
    saved: number | null
    savedRatio: number | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const info = await window.priesm?.getAppInfo()
        if (!cancelled && info) {
          setAppInfo(`${info.name} · v${info.version} · ${info.phase}`)
        }
      } catch {
        // renderer-only preview
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const enabledCount = useMemo(() => slots.filter((s) => s.enabled).length, [slots])

  const toggleSlot = useCallback((id: SlotId) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }, [])

  const handleSubmit = useCallback(
    async (prompt: string) => {
      if (isSending) return
      setIsSending(true)
      setLastPrompt(prompt)
      setRayResult(null)

      // Step 3: build ONE shared prompt payload, fan out to all enabled slots
      const payload = buildSlotPrompt(prompt, sharedContext)
      const eco = fanoutEconomy(sharedContext, enabledCount, payload.tokensEst)
      setLastFanout({
        n: eco.n,
        perSlot: payload.tokensEst,
        total: eco.withBundle,
        saved: eco.saved,
        savedRatio: eco.savedRatio,
      })

      // debug: prove identical payload length for every slot
      console.log('[Priesm Fanout]', {
        enabledCount,
        usedShared: payload.usedShared,
        perSlotTokens: payload.tokensEst,
        totalFanoutTokens: eco.withBundle,
        savedEst: eco.saved,
        promptChars: payload.fullPrompt.length,
      })

      setSlots((prev) =>
        prev.map((s) =>
          s.enabled
            ? {
                ...s,
                status: 'loading',
                lastResponse: undefined,
                lastPromptTokensEst: payload.tokensEst,
                lastUsedSharedContext: payload.usedShared,
              }
            : s,
        ),
      )

      const enabled = slots.filter((s) => s.enabled)

      await Promise.all(
        enabled.map(async (slot, index) => {
          await delay(350 + index * 280)
          // Each slot gets the SAME fullPrompt (stub "receives" it)
          void payload.fullPrompt
          setSlots((prev) =>
            prev.map((s) =>
              s.id === slot.id
                ? {
                    ...s,
                    status: 'ready',
                    lastPromptTokensEst: payload.tokensEst,
                    lastUsedSharedContext: payload.usedShared,
                    lastResponse: buildStubResponse(slot, prompt, {
                      usedShared: payload.usedShared,
                      promptTokens: payload.tokensEst,
                      bundleId: sharedContext?.bundleId,
                    }),
                  }
                : s,
            ),
          )
        }),
      )

      setIsRayRunning(true)
      await delay(450)
      setSlots((current) => {
        const result = stubSynthesize(current, prompt)
        const summary = payload.usedShared
          ? `${result.summary} · fanout ${eco.n} slots × ~${payload.tokensEst} tok (shared bundle)`
          : result.summary
        setRayResult({ ...result, summary })
        setIsRayRunning(false)
        return current
      })

      setIsSending(false)
    },
    [isSending, slots, sharedContext, enabledCount],
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark" aria-hidden />
          <div>
            <strong>Priesm</strong>
            <span>AI Browser</span>
          </div>
        </div>
        <div className="topbar__status">
          <span>{appInfo}</span>
          <span className="chip">{enabledCount} slots</span>
          <span className="chip chip--mode">{mode}</span>
          <button
            type="button"
            className={`chip chip-btn ${showAgentApi ? 'is-on' : ''}`}
            onClick={() => setShowAgentApi((v) => !v)}
          >
            Agent API
          </button>
          <button
            type="button"
            className={`chip chip-btn ${showExtract ? 'is-on' : ''}`}
            onClick={() => setShowExtract((v) => !v)}
          >
            Extract
          </button>
          {sharedContext && (
            <span className="chip chip--save" title={sharedContext.url}>
              bundle ~{sharedContext.tokensEst} tok
            </span>
          )}
          {lastFanout && (
            <span className="chip chip--fanout" title="last fanout economy">
              fanout {lastFanout.n}x{lastFanout.perSlot}
              {lastFanout.saved != null
                ? ` · saved ~${Math.round(lastFanout.savedRatio! * 100)}%`
                : ''}
            </span>
          )}
        </div>
      </header>

      <main className={`workspace ${showExtract || showAgentApi ? 'with-extract' : ''}`}>
        <aside className="context-rail">
          <h1>Workspace</h1>
          <p className="muted">
            우선순위: 외부 AI 에이전트가 Agent API로 bundle을 받아 토큰 절약. 사람용 멀티슬롯은 보조.
          </p>
          <dl className="meta-list">
            <div>
              <dt>Last prompt</dt>
              <dd>{lastPrompt || '—'}</dd>
            </div>
            <div>
              <dt>Shared bundle</dt>
              <dd>
                {sharedContext
                  ? `${sharedContext.bundleId || 'ctx'} · ~${sharedContext.tokensEst} tok`
                  : '— (Extract → Build Bundle → Use)'}
              </dd>
            </div>
            <div>
              <dt>Last fanout</dt>
              <dd>
                {lastFanout
                  ? `${lastFanout.n} slots · ~${lastFanout.total} tok total`
                  : '—'}
              </dd>
            </div>
          </dl>
          <ol className="roadmap">
            <li className="is-done">Step 1–2 · Extract + Bundle</li>
            <li className="is-done">Step A3 · Agent HTTP API</li>
            <li>Step A4 · 절감 receipt 문서화</li>
            <li>Step A5 · MCP</li>
            <li>Step A6 · Embedding (C)</li>
            <li className="is-muted">보류 · 사람용 멀티슬롯 고도화</li>
          </ol>
          {sharedContext && (
            <button type="button" className="ghost-btn" onClick={() => setSharedContext(null)}>
              Clear shared bundle
            </button>
          )}
        </aside>

        {showAgentApi && <AgentApiPanel />}

        {showExtract && (
          <ExtractPanel
            onUseAsContext={(payload) => {
              setSharedContext(payload)
            }}
          />
        )}

        <section className="slot-grid" aria-label="AI slots">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onToggle={toggleSlot} shared={sharedContext} />
          ))}
        </section>
      </main>

      <RayCard
        result={rayResult}
        isRunning={isRayRunning}
        onDismiss={() => setRayResult(null)}
      />

      <OmniPromptBar
        mode={mode}
        disabled={isSending || enabledCount === 0}
        onModeChange={setMode}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
