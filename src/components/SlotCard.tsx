import type { AiSlot, SharedContext } from '../lib/types'

interface Props {
  slot: AiSlot
  onToggle: (id: AiSlot['id']) => void
  shared?: SharedContext | null
}

const statusLabel: Record<AiSlot['status'], string> = {
  idle: 'Idle',
  ready: 'Ready',
  loading: 'Answering…',
  error: 'Error',
  offline: 'Offline',
}

export function SlotCard({ slot, onToggle, shared }: Props) {
  return (
    <section
      className={`slot-card ${slot.enabled ? 'is-enabled' : 'is-disabled'}`}
      style={{ ['--slot-color' as string]: slot.color }}
    >
      <header className="slot-card__header">
        <div className="slot-card__title">
          <span className="slot-card__dot" aria-hidden />
          <div>
            <h2>{slot.name}</h2>
            <p>{slot.description}</p>
          </div>
        </div>
        <div className="slot-card__meta">
          {slot.enabled && shared && (
            <span className="status status--shared" title="Will receive shared evidence bundle">
              bundle
            </span>
          )}
          {slot.lastPromptTokensEst != null && slot.enabled && (
            <span className="status" title="Last prompt tokens (est.)">
              ~{slot.lastPromptTokensEst}t
            </span>
          )}
          <span className={`status status--${slot.status}`}>{statusLabel[slot.status]}</span>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onToggle(slot.id)}
            aria-pressed={slot.enabled}
          >
            {slot.enabled ? 'On' : 'Off'}
          </button>
        </div>
      </header>

      <div className="slot-card__body">
        {!slot.enabled && <p className="muted">이 슬롯은 비활성 상태입니다.</p>}
        {slot.enabled && slot.status === 'loading' && (
          <p className="muted pulse">
            {shared ? '동일 bundle fanout 중…' : '응답 대기 중…'}
          </p>
        )}
        {slot.enabled && slot.lastResponse && (
          <div className="slot-card__response">{slot.lastResponse}</div>
        )}
        {slot.enabled && !slot.lastResponse && slot.status !== 'loading' && (
          <div className="slot-card__placeholder">
            <span>응답이 여기 표시됩니다</span>
            <small>
              {shared
                ? `Shared bundle ready (~${shared.tokensEst} tok)`
                : 'Step 3 · 같은 근거를 모든 슬롯에 전달'}
            </small>
          </div>
        )}
      </div>
    </section>
  )
}
