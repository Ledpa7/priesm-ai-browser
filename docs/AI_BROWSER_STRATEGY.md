# AI Browser Strategy — "AI가 웹을 쓸 때 쓰는 브라우저"

> **핵심 재정의**  
> Priesm AI Browser는 사람만 보는 멀티 AI 대시보드가 아니다.  
> **사람과 에이전트가 같은 웹 작업면을 공유하고, AI가 웹을 검색·열람·조작할 때 경유하는 인프라**다.

관련 문서: `PRODUCT_VISION.md`, `TECH_ARCHITECTURE.md`, `VERTICAL_SLICE_PLAN.md`  
작성 목적: 제품 방향을 **AI-native browser / Agent web runtime** 으로 재정렬

---

## 1. 왜 이 방향이 맞는가

### 1.1 두 개의 수요가 동시에 커지고 있다

| 수요 | 설명 | 지금 시장 |
|------|------|-----------|
| **Human → Many AIs** | 사람이 여러 모델에 묻고 비교 | Priesm 확장이 이미 검증 |
| **AI → Web** | 에이전트가 검색, 페이지 읽기, 폼, 클릭, 인용 | 각 모델/툴이 제각각 브라우저를 내장 |

후자가 커질수록 ChatGPT 검색, Claude computer use, OpenAI operator, Cursor browser tools처럼  
**브라우저 기능이 모델 안에 파편화**된다.

Priesm의 기회는 그 반대다:

> **웹 런타임을 한곳에 두고, 여러 AI/에이전트가 그걸 쓰게 만든다.**

### 1.2 한 줄 포지셔닝

```
Before:  사람이 Priesm으로 여러 AI를 쓴다
After:   사람 + 여러 AI가 Priesm으로 웹을 쓴다
```

- 사람 입장: 멀티모델 워크스페이스 (기존 DNA)
- AI 입장: 표준화된 웹 접근 레이어 (검색, 탭, DOM, 스크린샷, 세션, 인용)
- 사업 입장: "AI 앱 하나"가 아니라 **에이전트 웹 인프라**

### 1.3 비유

| 역할 | 비유 |
|------|------|
| Chrome | 사람용 일반 OS 브라우저 |
| 각 AI의 내장 브라우징 | 모델 종속 사설 도로 |
| **Priesm** | **AI 교통이 모이는 공용 인터체인지** |

사람들이 우리 UI를 "쓰러" 오기도 하지만,  
더 큰 레버리지는 **AI들이 웹 작업을 할 때 우리를 경유**하는 것이다.

---

## 2. 제품 이중 표면 (Dual Surface)

```
┌─────────────────────────────────────────────────────┐
│                 Priesm AI Browser                    │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │  Human Surface   │    │   Agent Surface       │  │
│  │  Omni-Prompt     │    │  Browser Runtime API  │  │
│  │  Multi slots     │    │  Search / Open / Read │  │
│  │  Ray 종합        │    │  Click / Type (gated) │  │
│  │  Compare mode    │    │  Citation Bundle      │  │
│  └────────┬─────────┘    └───────────┬───────────┘  │
│           └──────────┬───────────────┘              │
│                      ▼                              │
│            Shared Web Workspace                     │
│         tabs · context · citations · skills         │
└─────────────────────────────────────────────────────┘
           ▲                         ▲
     사람 (직접 사용)          외부 AI/에이전트
                              (API · MCP · SDK)
```

### 2.1 Human Surface (이미 시작)
- 멀티 AI 슬롯, Ray, 프롬프트 바
- "내가 묻고 비교한다"

### 2.2 Agent Surface (전략 핵심 추가)
- 에이전트가 호출하는 **웹 런타임**
- "AI가 검색하고, 읽고, 인용하고, (허가 하에) 조작한다"
- 결과는 사람 워크스페이스에 **보이거나**, headless로만 돌 수 있음

**핵심 제품 감각:**  
AI가 웹을 쓰는 모습이 블랙박스가 아니라, Priesm 창에서 **관찰·개입·승인** 가능하다.

---

## 3. Jobs-to-be-Done

### 사람
1. 여러 AI 답을 한 화면에서 비교·종합하고 싶다
2. AI가 웹에서 뭘 봤는지 **근거와 함께** 보고 싶다
3. 위험한 클릭/로그인은 내가 승인하고 싶다

### AI / 에이전트
1. 신뢰할 수 있는 검색·페이지 추출이 필요하다
2. 사이트마다 다른 DOM/로그인/봇 차단을 직접 겪고 싶지 않다
3. 인용 가능한 구조화 컨텍스트를 받고 싶다
4. 사용자 로컬 세션/스킬/프로젝트 맥락을 재사용하고 싶다

### 에이전트 개발자
1. 브라우저 자동화를 또 구현하기 싫다
2. MCP/SDK 한 줄로 Priesm 웹 런타임에 붙고 싶다
3. 권한·감사 로그·사용자 승인이 기본 제공되면 좋다

---

## 4. 가치 제안

### 사용자
> AI가 웹을 대신 볼 때, **어느 탭을 열었고 / 무엇을 읽었고 / 왜 그 결론인지**  
> Priesm이 한 자리에서 보여준다.

### AI 에이전트
> 검색·브라우징·추출·세션·인용 패키지를 **표준 API**로 제공한다.  
> 모델은 생각과 생성에 집중하면 된다.

### Priesm 사업
> 멀티모델 UX(기존) + 에이전트 웹 인프라(신규) =  
> 사용 단위가 사람 세션만이 아니라 **agent tool call** 로 확장

---

## 5. AI가 우리 서비스를 이용하는 형태

### 모드 A — Attended (사람 앞 경유) ★ 기본 추천
1. 사용자가 Priesm에서 질문/목표 입력
2. 라우터/에이전트가 웹 필요 시 **Priesm Browser Runtime** 호출
3. 탭이 사용자 눈에 보이며 열림 (또는 타임라인 재생)
4. Citation Bundle 생성
5. 모델/Ray가 인용과 함께 답변
6. 위험 액션은 사용자 승인

**감각:** "AI가 내 옆에서 웹을 켠다"

### 모드 B — Headless (백그라운드 경유)
- UI 최소화, 결과는 citation bundle로 반환
- 파워유저/자동화/CI형 에이전트용

### 모드 C — External Agent Bring-Your-Own
- Cursor, Claude Code, 자체 에이전트가 MCP로 접속
- "브라우저 툴 = Priesm" 으로 설정
- 사용자 PC의 Priesm이 **로컬 웹 게이트웨이**

### 모드 D — Multi-AI Shared Browse ★ Priesm 고유
```
Search once in Priesm
   ↓
Page corpus (normalized Citation Bundle)
   ↓
┌─────┬─────┬─────┐
│ GPT │Claude│Gemini│  … 각자 해석
└─────┴─────┴─────┘
   ↓
Ray citation-aware synthesis
```

**검색 1번, 두뇌 N번.**  
이게 "AI들이 웹 써치할 때 우리 서비스를 이용"의 가장 Priesm다운 형태다.

---

## 6. Agent Web Runtime 기능 계층

### L0. Session & Profile
- 격리 프로필(agent-safe) vs 사용자 프로필(opt-in)
- 사이트별 권한: read / interact / credentials
- 감사 로그

### L1. Navigation & Search
- `search(query)` → 결과 리스트 (엔진 추상화)
- `open(url)` / `open_many(urls)`
- `tabs.list` / `tabs.focus` / `tabs.close`

### L2. Perception (읽기)
- `page.snapshot` (a11y tree / 간결 DOM 요약)
- `page.extract` (본문, 제목, 메타)
- `page.screenshot`
- `page.links` / `page.tables`
- PDF/HTML 리더 모드

### L3. Action (조작) — 기본 deny, 승인 기반
- click, type, select, scroll, wait
- upload/download (강한 제한)
- 로그인 벽 감지 → 사람 핸드오프

### L4. Context Packaging ★ 상품 원자
에이전트에 넘기는 것은 raw HTML이 아니라 **Citation Bundle**:

```json
{
  "query": "user or agent query",
  "sources": [
    {
      "url": "https://...",
      "title": "...",
      "accessedAt": "2026-03-19T00:00:00Z",
      "excerpt": "...",
      "quotes": [{"text": "...", "locator": "..."}],
      "credibilityHints": ["official", "docs", "news"]
    }
  ],
  "browseTrace": ["search", "open#1", "extract", "open#2"],
  "permissionsUsed": ["search", "read"],
  "workspaceId": "..."
}
```

### L5. Multi-Model Fanout
- 동일 bundle을 여러 슬롯에 공급
- 모델별 해석 + Ray 종합

### L6. Skills
- 반복 웹 작업 레시피
- 사람과 에이전트가 같은 skill 호출

---

## 7. 외부 AI 접속 인터페이스

| 우선순위 | 인터페이스 | 대상 |
|----------|------------|------|
| 1 | **MCP Server** | Cursor, Claude Desktop, MCP 클라이언트 |
| 2 | **Local SDK** (TS/Python) | 커스텀 에이전트 |
| 3 | **HTTP localhost API** | 모든 로컬 툴 |
| 4 | Browser Extension Bridge | 일반 Chrome 온램프 (중기) |
| 5 | Cloud Gateway | 팀/원격 (프라이버시 엄격) |

### MCP Tool 초안
```
priesm_search
priesm_open
priesm_read
priesm_screenshot
priesm_act              (gated)
priesm_bundle           (citation package export)
priesm_ray_synthesize
priesm_workspace_context
```

### 인증
- 로컬 토큰 + 사용자 앱 승인
- capability scope + 세션 TTL
- "이 에이전트가 연 탭" UI 표시

---

## 8. UX — AI의 웹 사용이 보이게

1. **Browse Trace Timeline** — 검색어 → 결과 클릭 → 읽은 섹션 → 인용
2. **Agent Tab Strip** — 에이전트 탭 그룹 색 구분
3. **Approval Toasts** — "클릭 요청" Allow once / Deny
4. **Source Drawer** — 답변 옆 출처, 클릭 시 하이라이트
5. **Takeover** — 사람이 언제든 이어서 브라우징

슬로건 후보:
- See what your AI sees.
- The browser agents borrow.
- Ask once. Browse once. Think many times.

---

## 9. 기존 Priesm 자산 연결

| 기존 | AI Browser 역할 |
|------|-----------------|
| 멀티 슬롯 동시 질의 | 같은 웹 corpus를 N모델에 fanout |
| Ray 종합 | 출처 인식 종합 / 충돌 해석 |
| 매크로/스킬 | 인간·에이전트 공유 웹 스킬 |
| 세션/포커스 노하우 | 탭·프로필 오케스트레이션 |
| 본문 미저장 프라이버시 | 에이전트 로그도 로컬 우선 |

확장 Priesm = 사람이 여러 AI를 호출  
AI Browser = 여러 AI가 웹 런타임을 호출 + 사람도 같은 면 사용

---

## 10. 아키텍처 스케치

```
[External Agents / Models]
        │ MCP / SDK / HTTP
        ▼
[Agent Gateway]  auth · rate limit · capability
        ▼
[Browser Runtime Orchestrator]
   ├─ Profile Manager
   ├─ Tab Supervisor
   ├─ Search Adapters
   ├─ Extractors (readability, a11y)
   ├─ Action Guard (policy + approval)
   └─ Citation Bundler
        ▼
[Chromium WebContents pool]
        ▼
[Shared Workspace Bus] ──► Human UI (trace, tabs, Ray)
```

구현 단계:
1. Electron 앱 내부 WebContents + 로컬 API
2. runtime 프로세스 분리, headless pool
3. 필요 시 Chromium fork (장기)

---

## 11. 보안 · 신뢰 (생사 이슈)

### 원칙
1. Act/download/credential 은 **Default deny**
2. 소비자 기본은 **Visible (attended)**
3. 에이전트 기본 프로필은 **clean isolation**
4. 사용자 로그인 프로필 접근은 명시적 opt-in
5. 페이지 내용 = untrusted (prompt injection 가정)
6. 감사 로그: 누가/언제/어떤 툴/어떤 URL
7. 대화·페이지 본문 기본 로컬, 클라우드는 메타/스킬 중심

### Approval Matrix (초안)

| 행동 | 기본 |
|------|------|
| search / open public URL | allow (session) |
| read / extract | allow |
| screenshot | allow |
| click same-origin nav | prompt |
| type into input | prompt |
| submit form | prompt |
| file upload/download | deny → explicit |
| user logged-in profile | deny → explicit + warning |
| payment / password fields | always block or hard prompt |

---

## 12. 비즈니스 함의

### 사용량 단위
- 기존: MAU, 프롬프트 수
- 추가: tool calls, browse sessions, bundles, external agent connections

### 티어 스케치

| 티어 | Human | Agent runtime |
|------|-------|----------------|
| Free | 2–3 슬롯, 기본 Ray | 일일 browse 제한, attended |
| Pro | 4+ 슬롯, 고급 Ray | 높은 quota, skills sync |
| Builder | 로컬 모델/브리지 | MCP 로컬, headless, SDK |
| Team | 공유 워크스페이스 | 감사 로그, 정책 템플릿 |

### 해자
모델 회사는 각자 브라우징을 넣는다.  
비어 있는 자리: **크로스 모델 공용 런타임 + 사람 가시성 + Ray 종합**.

---

## 13. 경쟁 지형

| 유형 | 차이 |
|------|------|
| Chrome/Arc/Brave | 에이전트 1급 아님 |
| AI 브라우저 셸 | 멀티모델 인프라·에이전트 API가 약할 수 있음 |
| 모델 내장 브라우징 | 벤더 락인, 공유 런타임 약함 |
| Playwright/Browserbase | 개발자 인프라, 소비자 UX·Ray 없음 |
| 파편 MCP browser | 워크스페이스/멀티모델 fanout 부재 |

Priesm 자리:  
**Playwright급 런타임 × 멀티모델 워크스페이스 × 로컬-first 신뢰**

---

## 14. 로드맵 삽입

| Phase | Human | Agent/Web Runtime |
|-------|-------|-------------------|
| P0 현재 | 셸·슬롯·stub Ray | 전략 문서 |
| P0.5 | API adapter 시작 | **open+extract+trace** 수직 슬라이스 |
| P1 | 멀티 provider + Ray 이식 | Citation Bundle, 내부 browse 툴 |
| P2 | 안정 워크스페이스 | **MCP**, 외부 에이전트 1종 |
| P3 | Router·스킬 | headless, shared browse |
| P4 | 팀/생태계 | SDK, policy, optional gateway |

---

## 15. MVP 성공 정의 (업데이트)

기존: 확장처럼 여러 AI에 물어본다.  
**추가 쐐기:**

> 웹 정보가 필요할 때 AI/에이전트가 **Priesm을 경유**하고,  
> 그 과정이 사용자에게 보이며,  
> 구조화된 출처 번들로 답에 연결된다.

### 90초 데모 스크립트
1. "이 주제 최신 동향 비교해줘"
2. Priesm이 검색 탭을 연다 (trace 표시)
3. 상위 소스 extract
4. 3개 모델이 같은 bundle로 해석
5. Ray가 출처 달린 종합
6. (보너스) Cursor가 MCP로 `priesm_read` 호출

---

## 16. 리스크

| 리스크 | 대응 |
|--------|------|
| 또 브라우저 자동화 인식 | 가시성 + multi-model + Ray 전면 |
| ToS / 봇 차단 | attended 우선, rate limit, 공식 API 우선 |
| 보안 사고 | default deny, 감사, 프로필 격리 |
| 모델 내장 브라우징 잠식 | 크로스 모델·로컬·관측성 |
| 범위 폭발 | L1–L2 + bundle 먼저, act는 늦게 |

---

## 17. 고정 의사결정

1. 우리는 AI 래퍼 앱이 아니라 **Agent Web Runtime + Human Workspace** 다.
2. AI의 웹 사용은 기본 **visible(attended)** 이다.
3. 상품 원자에는 채팅뿐 아니라 **Citation Bundle + Browse Trace** 가 포함된다.
4. 외부 진입점은 **MCP 우선**이다.
5. 멀티 AI 비교는 폐기하지 않고, **같은 corpus를 여러 뇌에 넣는 엔진**으로 승격한다.

---

## 18. 후속 백로그

### 문서
- [ ] `AGENT_RUNTIME_API.md`
- [ ] `CITATION_BUNDLE_SPEC.md`
- [ ] `APPROVAL_POLICY.md`
- [ ] `THREAT_MODEL_AGENT_BROWSER.md`

### 코드 순서
- [ ] `openAndExtract` 수직 슬라이스
- [ ] Tab supervisor (main process)
- [ ] Citation bundler
- [ ] Browse Trace UI
- [ ] Local MCP skeleton

---

## 19. 요약

맞는 방향이다.

- 사람만 쓰는 멀티 AI 창으로 끝나면 확장의 상위 호환에 가깝다.
- **AI들이 웹을 쓸 때 Priesm을 경유**하게 만들면 제품은 지능형 웹 런타임 플랫폼이 된다.
- 차별화는 단순 속도가 아니라  
  **관측 가능성 · 출처 번들 · 멀티모델 fanout · 로컬 신뢰 · 에이전트 표준 접속**에 있다.