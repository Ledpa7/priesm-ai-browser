import type { RayResult } from '../lib/types'

interface Props {
  result: RayResult | null
  isRunning: boolean
  onDismiss: () => void
}

export function RayCard({ result, isRunning, onDismiss }: Props) {
  if (!isRunning && !result) return null

  return (
    <aside className="ray-card" aria-live="polite">
      <header>
        <div>
          <strong>Ray 종합</strong>
          <span className="ray-card__engine">
            {isRunning ? 'working…' : result?.engine ?? 'stub'}
          </span>
        </div>
        <button type="button" className="ghost-btn" onClick={onDismiss} aria-label="닫기">
          ✕
        </button>
      </header>
      <p>{isRunning ? '여러 슬롯 응답을 모으는 중…' : result?.summary}</p>
    </aside>
  )
}
