import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { WorkspaceMode } from '../lib/types'

interface Props {
  mode: WorkspaceMode
  disabled?: boolean
  onModeChange: (mode: WorkspaceMode) => void
  onSubmit: (prompt: string) => void
}

const MODES: { id: WorkspaceMode; label: string }[] = [
  { id: 'compare', label: 'Compare' },
  { id: 'browse', label: 'Browse' },
  { id: 'agent', label: 'Agent' },
]

export function OmniPromptBar({ mode, disabled, onModeChange, onSubmit }: Props) {
  const [value, setValue] = useState('')

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSubmit(text)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form className="omni-bar" onSubmit={submit}>
      <div className="omni-bar__modes" role="tablist" aria-label="Workspace mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? 'is-active' : ''}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="omni-bar__input-wrap">
        <textarea
          id="priesm-omni-input"
          rows={1}
          placeholder={
            mode === 'compare'
              ? '한 번 물어보고 여러 AI 답을 비교하세요…'
              : mode === 'agent'
                ? '목표를 입력하면 에이전트가 오케스트레이션합니다…'
                : '검색하거나 페이지 액션을 지시하세요…'
          }
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="send-btn" disabled={disabled || !value.trim()}>
          Send
        </button>
      </div>
      <p className="omni-bar__hint">Enter 전송 · Shift+Enter 줄바꿈 · Phase 0은 로컬 스텁 응답</p>
    </form>
  )
}
