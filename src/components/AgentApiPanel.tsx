import { useCallback, useEffect, useState } from 'react'

type AgentApiInfo = {
  port: number
  token: string
  baseUrl: string
}

export function AgentApiPanel() {
  const [info, setInfo] = useState<AgentApiInfo | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const fromIpc = await window.priesm?.getAgentApiInfo?.()
      if (fromIpc?.baseUrl) {
        setInfo(fromIpc)
        return
      }
      const app = await window.priesm?.getAppInfo?.()
      if (app?.agentApi?.baseUrl) setInfo(app.agentApi)
    } catch {
      setInfo(null)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const t = setInterval(() => void refresh(), 3000)
    return () => clearInterval(t)
  }, [refresh])

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied('copy-failed')
    }
  }

  const testBundle = async () => {
    if (!info) return
    setTesting(true)
    setTestMsg(null)
    try {
      const res = await fetch(`${info.baseUrl}/v0/bundle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${info.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'what is this page',
          profile: 'standard',
          modelCountTarget: 1,
          urls: ['https://example.com'],
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setTestMsg(`FAIL ${data.code || res.status}: ${data.error || 'unknown'}`)
      } else {
        const r = data.receipt || {}
        setTestMsg(
          `OK · modelContext ~${r.tokensEstimated ?? data.rendered?.tokenEstimate} tok · saved ~${r.savedTokensEstimated} tok (${Math.round((r.savedRatioEstimated || 0) * 100)}%)`,
        )
      }
    } catch (e: unknown) {
      setTestMsg(e instanceof Error ? e.message : 'test failed')
    } finally {
      setTesting(false)
    }
  }

  const curlExample = info
    ? `curl -s ${info.baseUrl}/v0/health\n\ncurl -s -X POST ${info.baseUrl}/v0/bundle \\\n  -H "Authorization: Bearer ${info.token}" \\\n  -H "Content-Type: application/json" \\\n  -d "{\\"query\\":\\"summary\\",\\"urls\\":[\\"https://example.com\\"],\\"profile\\":\\"standard\\"}"`
    : ''

  return (
    <section className="agent-api-panel">
      <header className="extract-panel__head">
        <div>
          <h2>Agent API · 외부 AI 경유</h2>
          <p className="muted">
            다른 에이전트가 여기로 웹 근거(bundle)를 받아 토큰을 절약합니다. 사람용 멀티챗과 별개.
          </p>
        </div>
      </header>

      {!info && (
        <p className="muted">API 정보를 아직 못 읽었습니다. Electron에서 실행 중인지 확인하세요.</p>
      )}

      {info && (
        <>
          <div className="extract-stats">
            <div>
              <span className="label">Base URL</span>
              <strong style={{ fontSize: 12 }}>{info.baseUrl}</strong>
              <small>loopback only</small>
            </div>
            <div>
              <span className="label">Port</span>
              <strong>{info.port}</strong>
              <small>127.0.0.1</small>
            </div>
            <div className="is-save" style={{ gridColumn: '1 / -1' }}>
              <span className="label">Bearer token</span>
              <strong style={{ fontSize: 11, wordBreak: 'break-all' }}>{info.token}</strong>
              <small>로컬 전용 · 커밋 금지</small>
            </div>
          </div>

          <div className="agent-api-actions">
            <button type="button" className="ghost-btn" onClick={() => copy('url', info.baseUrl)}>
              {copied === 'url' ? 'Copied URL' : 'Copy URL'}
            </button>
            <button type="button" className="ghost-btn" onClick={() => copy('token', info.token)}>
              {copied === 'token' ? 'Copied token' : 'Copy token'}
            </button>
            <button type="button" className="ghost-btn" onClick={() => copy('curl', curlExample)}>
              {copied === 'curl' ? 'Copied curl' : 'Copy curl example'}
            </button>
            <button type="button" className="send-btn" disabled={testing} onClick={() => void testBundle()}>
              {testing ? 'Testing…' : 'Test /v0/bundle'}
            </button>
          </div>

          {testMsg && <p className={testMsg.startsWith('OK') ? 'agent-test-ok' : 'extract-panel__error'}>{testMsg}</p>}

          <pre className="extract-panel__preview">{curlExample}</pre>
        </>
      )}
    </section>
  )
}
