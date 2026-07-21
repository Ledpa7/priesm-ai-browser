# Token Economy — Priesm이 AI 토큰을 절약하는 방법

> Status: **Core product thesis**  
> 관련: `CITATION_BUNDLE_SPEC.md`, `AI_BROWSER_STRATEGY.md`, `AGENT_RUNTIME_API.md`

---

## 1. 왜 토큰 절약이 우리 해자인가

AI 브라우징이 파편화되면 낭비가 기본값이 된다.

```
Model A: 검색 + 페이지 3개 통째로 읽음
Model B: 같은 주제 다시 검색 + 비슷한 페이지 다시 읽음
Model C: 또 다시...
```

비용은 **모델 수 × 페이지 수 × raw 컨텍스트** 로 증가한다.

Priesm의 제안:

```
Priesm: 검색 1번 + 추출/압축 1번 → Citation Bundle
Models: 같은 압축 bundle만 읽음 (N개)
Ray: 로컬/저비용 종합
```

> **Browse once. Compress once. Think many times.**

사용자는 더 싸게 여러 뇌를 돌리고,  
외부 에이전트는 raw HTML 대신 **이미 깎인 근거 패키지**를 쓴다.

---

## 2. 토큰이 새는 지점

| 구간 | 낭비 | Priesm 개입 |
|------|------|-------------|
| 검색 반복 | 모델마다 검색 툴 호출 | Shared search |
| raw HTML | 태그/내비/푸터 | Main-text extract |
| 풀 본문 | 무관 섹션 | Query-ranked excerpts |
| 다중 모델 | 동일 근거 N번 풀 투입 | Fanout of one bundle |
| 재질문 | 같은 URL 재읽기 | Extract cache |
| 긴 대화 | 히스토리+웹 누적 | Budget profiles |
| 종합 | 큰 모델이 전부 재독 | Ray local/nano first |

---

## 3. 절감 레버 (우선순위)

### L1. Shared Browse (최대 임팩트)
- 웹 I/O를 모델 바깥으로 이동
- N모델이 각각 browse 하지 않음
- 절감 ≈ `(N-1) × browse_context_tokens`

### L2. Extractive Compression
- readability / main content only
- boilerplate 제거
- 목표: 원문 대비 **5~20% 토큰** (페이지 유형별)

### L3. Query-aware Selection
- 질의 무관 chunk 폐기
- source당 상위 excerpt K개만

### L4. Render Profiles
- `nano` / `standard` / `debate` / `audit`
- 기본 standard, 실패 시 escalate

### L5. Cache & Dedupe
- URL canonical cache
- 세션 내 bundle 재사용
- 중복 기사 제거

### L6. Cheap Synthesis Path
- Ray APSE / 로컬 소형이 1차 종합
- 비싼 모델은 충돌 구간만 (중기)

### L7. Progressive Disclosure
- 1차: summary + top quotes
- 부족할 때만 `expand`
- **필요 전까지 토큰 0**

---

## 4. 제품 약속 (User-facing)

카피 후보:
- 한 번 읽고, 여러 AI에게 나눠 줍니다.
- 같은 페이지를 AI마다 반복 읽히지 마세요.
- 토큰은 생각하는데 쓰고, 청소질은 Priesm이 합니다.

UI 표시:
- 매 질의 후 **Tokens saved (est.)**
- bundle 카드: `1.2k tokens · saved ~92% vs raw×4`
- 슬롯별 받은 컨텍스트 크기

숫자는 추정치 (`est.`) 명시.

---

## 5. 내부 KPI

| KPI | 정의 | 초기 목표 |
|-----|------|-----------|
| Compression ratio | bundleTokens / rawExtractTokens | ≤ 0.2 median |
| Fanout saving ratio | 1 - (bundle×N)/(raw×N) | ≥ 0.8 when N≥3 |
| Cache hit rate | cached / all sources | session ≥ 0.3 |
| Expand rate | expand / bundle | ≤ 0.25 (과압축 모니터) |
| Answer sufficiency | 👍 or no-retry | 절감·품질 균형 |

### 품질 가드
1. 가능하면 source 최소 2개
2. 근거 부족 시 명시
3. expand path 항상 존재
4. audit profile 원클릭 전환

---

## 6. 예산 기본값 (v0)

```
nano:     hard 500  / soft 400  / perSource 160 / maxSources 3
standard: hard 2500 / soft 1200 / perSource 500 / maxSources 5
debate:   hard 3500 / soft 1800 / perSource 500 / maxSources 6
audit:    hard 6000 / soft 3000 / perSource 800 / maxSources 8
```

- 로컬 소형 모델 → nano 기본
- 리서치 모드 → debate/audit
- MCP 호출자 `max_tokens` override 허용

---

## 7. Fanout 패턴

### A. Single Bundle Multi-Think (MVP 기본)
`Bundle(B) → Model×N`  
Cost ≈ `N×B + N×output`

### B. Specialist Split (중기)
싼 모델 triage → 비싼 모델은 분쟁 구간만

### C. Ray First (중기)
local Ray → confidence 낮을 때만 multi-model

---

## 8. Progressive Expand

```
priesm_expand({
  bundleId, sourceId,
  mode: "more_excerpts" | "section" | "full_main_text",
  maxTokens: 400
})
```

- expand도 budget 강제
- full_main_text는 비용 경고

---

## 9. 캐시 계층

```
L0 Request memo (동일 query+urls 수초)
L1 Session extract cache (URL → ExtractedPage)
L2 Disk cache (TTL)
L3 Project memory of approved sources (나중)
```

로컬 기본, 삭제 UI 필수.

---

## 10. 포지셔닝

> Priesm is the **context compiler** between the web and many AIs.

| 플레이어 | 한계 | 우리 |
|----------|------|------|
| 모델 내장 browse | raw 근접 투입, 벤더 락인 | 공용 압축 레이어 |
| Playwright 계열 | 절약 UX 약함 | budget-first bundle |
| 일반 채팅앱 | 히스토리 비대 | evidence pin + profiles |
| RAG SaaS | 문서 인덱스 중심 | live web + multi-model fanout |

---

## 11. 비즈니스 연결

- Free: standard budget, N≤3, 일일 bundle 한도
- Pro: 큰 budget, disk cache, fanout 4+
- Builder: MCP expand, budget API, headless
- 대시보드: 주간 절감 est. (과장 금지, 방법론 툴팁)

---

## 12. 구현 순서 (토큰 관점)

1. Extract main text  
2. Hard budget cut + economy 메타  
3. Bundle fanout to slots  
4. Cache by URL  
5. Render profiles  
6. Expand API  
7. Ray-first / specialist split  

---

## 13. 고정 의사결정

1. 토큰 절약은 부수 효과가 아니라 **제품 축**이다.  
2. 절감은 반드시 가시화한다 (UI + API).  
3. 압축이 기본, 상세는 expand로 되돌린다.  
4. 품질 가드 없는 절감 최적화는 머지하지 않는다.  
5. 멀티모델 비교의 경제적 정당성은 **shared bundle**에서 나온다.

---

## 14. 요약

팔 것은 "더 많은 브라우징"이 아니다.  
**더 적은 토큰으로 여러 지능이 같은 웹 근거를 생각하게 하는 것**이다.

```
Web ──► Priesm Compiler ──► Small Evidence Bundle ──► Many Minds
                 │
                 └── saved tokens, visible trace, citations
```