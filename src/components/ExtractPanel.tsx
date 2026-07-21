import { useState, useEffect, type FormEvent } from 'react'


type ExtractOk = {
  ok: true
  url: string
  title: string
  mainText: string
  preview: string
  method: string
  stats: {
    rawHTMLLength: number
    mainTextLength: number
    rawTokensEst: number
    mainTokensEst: number
    compressionRatio: number
    savedTokensEst: number
    savedRatioEst: number
  }
  tookMs: number
}

type ExtractErr = { ok: false; error: string; code: string }
type ExtractUrlResponse = ExtractOk | ExtractErr

type BundleOk = {
  ok: true
  bundle: {
    id: string
    query: { text: string }
    sources: Array<{ id: string; title: string; url: string; excerpts: unknown[] }>
    economy: {
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
    }
    warnings?: string[]
  }
  rendered: { text: string; tokenEstimate: number; profile: string }
}

type BundleResponse = BundleOk | ExtractErr

interface Props {
  onUseAsContext?: (payload: {
    url: string
    title: string
    text: string
    tokensEst: number
    bundleId?: string
    profile?: string
    baselineTokensIfRawPerModel?: number
    savedTokensFanoutEst?: number
    modelCountTarget?: number
  }) => void
}

const PROFILES = ['nano', 'standard', 'debate', 'audit'] as const

export function ExtractPanel({ onUseAsContext }: Props) {
  const [url, setUrl] = useState('https://example.com')
  const [query, setQuery] = useState('key points')
  const [profile, setProfile] = useState<(typeof PROFILES)[number]>('standard')
  const [modelCount, setModelCount] = useState(4)
  const [loading, setLoading] = useState(false)
  const [bundling, setBundling] = useState(false)
  const [result, setResult] = useState<ExtractUrlResponse | null>(null)
  const [bundleRes, setBundleRes] = useState<BundleResponse | null>(null)

  const [useCrawl4AI, setUseCrawl4AI] = useState(true)

  useEffect(() => {
    if (!window.priesm?.onBundleCreated) return;
    const cleanup = window.priesm.onBundleCreated((bundle: any) => {
      console.log('[ExtractPanel] Agent Bridge created bundle:', bundle);
      if (bundle && onUseAsContext) {
        onUseAsContext({
          url: bundle.url,
          title: bundle.title,
          text: bundle.extractedMarkdown,
          tokensEst: bundle.tokensEst,
          bundleId: bundle.bundleId,
          profile: 'agent-bridge',
          baselineTokensIfRawPerModel: Math.ceil(bundle.rawHtmlLength / 3.5),
          savedTokensFanoutEst: bundle.savedTokensEst,
          modelCountTarget: modelCount,
        });
      }
    });
    return () => cleanup();
  }, [onUseAsContext, modelCount]);

  const runExtract = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!url.trim() || loading) return
    
    setLoading(true)
    setResult(null)
    setBundleRes(null)
    try {
      if (useCrawl4AI && window.priesm?.extractWithCrawl4AI) {
        const bundle = await window.priesm.extractWithCrawl4AI(url.trim());
        if (bundle) {
          setResult({
            ok: true,
            url: bundle.url,
            title: bundle.title,
            mainText: bundle.extractedMarkdown,
            preview: bundle.extractedMarkdown.slice(0, 400) + '...',
            method: `crawl4ai (${bundle.source})`,
            stats: {
              rawHTMLLength: bundle.rawHtmlLength,
              mainTextLength: bundle.extractedLength,
              rawTokensEst: Math.ceil(bundle.rawHtmlLength / 3.5),
              mainTokensEst: bundle.tokensEst,
              compressionRatio: bundle.rawHtmlLength > 0 ? bundle.extractedLength / bundle.rawHtmlLength : 1,
              savedTokensEst: bundle.savedTokensEst,
              savedRatioEst: bundle.savedRatioPercentage / 100,
            },
            tookMs: 120,
          });

          if (onUseAsContext) {
            onUseAsContext({
              url: bundle.url,
              title: bundle.title,
              text: bundle.extractedMarkdown,
              tokensEst: bundle.tokensEst,
              bundleId: bundle.bundleId,
              profile: 'crawl4ai',
              baselineTokensIfRawPerModel: Math.ceil(bundle.rawHtmlLength / 3.5),
              savedTokensFanoutEst: bundle.savedTokensEst,
              modelCountTarget: modelCount,
            });
          }
          return;
        }
      }

      if (!window.priesm?.extractUrl) {
        setResult({
          ok: false,
          error: 'Extract API unavailable (not running inside Electron?)',
          code: 'INTERNAL',
        })
        return
      }
      const res = (await window.priesm.extractUrl(url.trim())) as ExtractUrlResponse
      setResult(res)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setResult({ ok: false, error: message, code: 'INTERNAL' })
    } finally {
      setLoading(false)
    }
  }


  const runBundle = async () => {
    if (!result || !result.ok || !window.priesm?.buildBundle) return
    setBundling(true)
    setBundleRes(null)
    try {
      const res = (await window.priesm.buildBundle({
        query: query.trim() || 'general reading',
        profile,
        modelCountTarget: modelCount,
        pages: [
          {
            url: result.url,
            title: result.title,
            mainText: result.mainText,
            rawHTMLLength: result.stats.rawHTMLLength,
            method: result.method,
          },
        ],
      })) as BundleResponse
      setBundleRes(res)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setBundleRes({ ok: false, error: message, code: 'INTERNAL' })
    } finally {
      setBundling(false)
    }
  }

  return (
    <section className="extract-panel">
      <header className="extract-panel__head">
        <div>
          <h2>Step 2 · Extract → Bundle</h2>
          <p className="muted">본문 추출 후 Citation Bundle + budget + economy</p>
        </div>
      </header>

      <form className="extract-panel__form" onSubmit={runExtract}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          spellCheck={false}
        />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useCrawl4AI}
            onChange={(e) => setUseCrawl4AI(e.target.checked)}
          />
          Crawl4AI Engine
        </label>
        <button type="submit" className="send-btn" disabled={loading || !url.trim()}>
          {loading ? 'Extracting…' : 'Extract'}
        </button>
      </form>


      {result && !result.ok && (
        <div className="extract-panel__error">
          <strong>{result.code}</strong>
          <span>{result.error}</span>
        </div>
      )}

      {result && result.ok && (
        <div className="extract-panel__result">
          <div className="extract-panel__meta">
            <strong title={result.url}>{result.title || result.url}</strong>
            <span className="chip">{result.method}</span>
            <span className="chip">{result.tookMs}ms</span>
          </div>

          <div className="extract-stats">
            <div>
              <span className="label">Raw HTML</span>
              <strong>{result.stats.rawHTMLLength.toLocaleString()} ch</strong>
              <small>~{result.stats.rawTokensEst.toLocaleString()} tok</small>
            </div>
            <div>
              <span className="label">Main text</span>
              <strong>{result.stats.mainTextLength.toLocaleString()} ch</strong>
              <small>~{result.stats.mainTokensEst.toLocaleString()} tok</small>
            </div>
            <div>
              <span className="label">Compression</span>
              <strong>{(result.stats.compressionRatio * 100).toFixed(1)}%</strong>
              <small>of raw size</small>
            </div>
            <div className="is-save">
              <span className="label">Saved vs raw (est.)</span>
              <strong>~{result.stats.savedTokensEst.toLocaleString()} tok</strong>
              <small>{(result.stats.savedRatioEst * 100).toFixed(1)}%</small>
            </div>
          </div>

          <pre className="extract-panel__preview">{result.preview}</pre>

          <div className="bundle-controls">
            <label>
              <span>Query (for ranking)</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label>
              <span>Profile</span>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value as (typeof PROFILES)[number])}
              >
                {PROFILES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Fanout models</span>
              <input
                type="number"
                min={1}
                max={8}
                value={modelCount}
                onChange={(e) => setModelCount(Number(e.target.value) || 1)}
              />
            </label>
            <button type="button" className="send-btn" disabled={bundling} onClick={runBundle}>
              {bundling ? 'Bundling…' : 'Build Bundle'}
            </button>
          </div>
        </div>
      )}

      {bundleRes && !bundleRes.ok && (
        <div className="extract-panel__error">
          <strong>{bundleRes.code}</strong>
          <span>{bundleRes.error}</span>
        </div>
      )}

      {bundleRes && bundleRes.ok && (
        <div className="bundle-result">
          <div className="extract-panel__meta">
            <strong>Bundle {bundleRes.bundle.id}</strong>
            <span className="chip">{bundleRes.rendered.profile}</span>
            <span className="chip">{bundleRes.bundle.sources.length} sources</span>
          </div>

          <div className="extract-stats">
            <div>
              <span className="label">Bundle / model</span>
              <strong>~{bundleRes.bundle.economy.tokensForSingleModel.toLocaleString()} tok</strong>
              <small>budget soft {bundleRes.bundle.economy.budgets.softTargetTokens}</small>
            </div>
            <div>
              <span className="label">Raw baseline / model</span>
              <strong>
                ~{bundleRes.bundle.economy.baselineTokensIfRawPerModel.toLocaleString()} tok
              </strong>
              <small>before budget cut</small>
            </div>
            <div>
              <span className="label">Fanout ×{bundleRes.bundle.economy.fanout.modelCountTarget}</span>
              <strong>
                ~{bundleRes.bundle.economy.fanout.totalTokensEstimated.toLocaleString()} tok
              </strong>
              <small>bundle × N</small>
            </div>
            <div className="is-save">
              <span className="label">Saved fanout (est.)</span>
              <strong>
                ~{bundleRes.bundle.economy.fanout.savedTokensEstimated.toLocaleString()} tok
              </strong>
              <small>
                {(bundleRes.bundle.economy.fanout.savedRatioEstimated * 100).toFixed(1)}% vs raw×N
              </small>
            </div>
          </div>

          {bundleRes.bundle.warnings && bundleRes.bundle.warnings.length > 0 && (
            <p className="muted">warnings: {bundleRes.bundle.warnings.join(', ')}</p>
          )}

          <pre className="extract-panel__preview">{bundleRes.rendered.text}</pre>
          <p className="muted">
            render ~{bundleRes.rendered.tokenEstimate.toLocaleString()} tok (model-facing)
          </p>

          {onUseAsContext && (
            <button
              type="button"
              className="ghost-btn"
              onClick={() =>
                onUseAsContext({
                  url: result && result.ok ? result.url : '',
                  title: result && result.ok ? result.title : 'bundle',
                  text: bundleRes.rendered.text,
                  tokensEst: bundleRes.rendered.tokenEstimate,
                  bundleId: bundleRes.bundle.id,
                  profile: bundleRes.rendered.profile,
                  baselineTokensIfRawPerModel:
                    bundleRes.bundle.economy.baselineTokensIfRawPerModel,
                  savedTokensFanoutEst:
                    bundleRes.bundle.economy.fanout.savedTokensEstimated,
                  modelCountTarget: bundleRes.bundle.economy.fanout.modelCountTarget,
                })
              }
            >
              Use bundle as shared context
            </button>
          )}
        </div>
      )}
    </section>
  )
}
