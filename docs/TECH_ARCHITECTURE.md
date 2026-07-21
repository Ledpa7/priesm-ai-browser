# Tech Architecture — v0.1

## 베이스 선택 (Phase 0)

**Electron + Vite + React + TypeScript**

| 선택 | 이유 |
|------|------|
| Electron | 멀티 웹뷰·네이티브 메뉴·MCP 로컬 서버에 적합 |
| Vite | 기존 Priesm 확장과 동일한 FE 툴링 |
| React 19 | 기존 UI 패턴 이식 용이 |
| 나중에 Tauri/CEF/fork 재평가 | MVP 속도 우선 |

전략: `AI_BROWSER_STRATEGY.md`

---

## Dual Surface 프로세스

```
electron/main.ts
  ├─ app window (Human UI)
  ├─ runtime/          # Agent Web Runtime (목표)
  │   ├─ tabSupervisor
  │   ├─ extractor
  │   ├─ searchAdapter
  │   ├─ actionGuard
  │   └─ citationBundler
  └─ gateway/          # 외부 AI 진입점 (목표)
      ├─ mcpServer
      └─ httpLocal

src/*                  # renderer Human Surface
```

---

## 렌더러 모듈 경계

```
src/
  components/              # 순수 UI
  features/
    workspace/             # 슬롯 레이아웃
    prompt/                # Omni-Prompt
    ray/                   # 종합 엔진
    providers/             # model adapters
    runtime-trace/         # Browse Trace UI (예정)
    sources/               # Citation drawer (예정)
  lib/types.ts
```

---

## Provider Adapter 계약 (Human)

```ts
interface AIProviderAdapter {
  id: string
  capabilities: Array<'chat' | 'stream' | 'tools' | 'vision'>
  send(input: {
    prompt: string
    system?: string
    contextBundle?: CitationBundle
    signal?: AbortSignal
  }): AsyncIterable<{ type: 'text' | 'error' | 'done'; text?: string }>
  health(): Promise<'ready' | 'auth' | 'down'>
}
```

---

## Runtime 계약 (Agent) — 목표

```ts
interface BrowserRuntime {
  search(query: string, opts?: SearchOpts): Promise<SearchResult[]>
  open(url: string, opts?: OpenOpts): Promise<TabRef>
  read(tab: TabRef, opts?: ReadOpts): Promise<ExtractedPage>
  bundle(input: BundleInput): Promise<CitationBundle>
  act(tab: TabRef, action: Action): Promise<ActionResult> // gated
}
```

### 데이터 원자
- **BrowseTraceEvent**: search | open | extract | act | approve | deny
- **CitationBundle**: sources[] + quotes + trace + permissions

---

## IPC 표면 (현재)

| 채널 | 용도 |
|------|------|
| `app:getInfo` | 앱 메타 |
| `workspace:ping` | 헬스 체크 |

### 예정
| 채널 | 용도 |
|------|------|
| `runtime:open` | URL 로드 |
| `runtime:extract` | 본문 추출 |
| `runtime:bundle` | citation 생성 |
| `runtime:trace` | 이벤트 push → UI |

---

## 보안 기본값
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- extract/search: 세션 허용 가능
- act: approval required
- user profile cookies: explicit opt-in
- page content = untrusted input to models
- 시크릿은 userData/OS keychain

---

## 기존 자산 재사용 맵

| 8-priesm-project | 이 레포 |
|------------------|---------|
| `synthesis.ts` | `features/ray/` |
| 슬롯/레이아웃 UX | workspace components |
| message types | 추후 shared messages |
| 매크로 개념 | skills (human+agent) |

---

## 다음 아키텍처 작업
1. providers + OpenAI adapter (H1)
2. runtime open+extract+trace (A1)
3. Citation Bundle spec v0
4. main process stream/proxy
5. MCP skeleton (Phase 2)