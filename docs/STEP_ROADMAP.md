# Step Roadmap — Agent-first (토큰 절약 런타임)

> **제품 우선순위 (사용자 확정)**  
> 1순위: **다른 AI 에이전트가 Priesm 브라우저를 경유해 웹을 읽고 토큰을 절약**  
> 2순위: 사람용 멀티 AI 동시 답변 (기존 확장 Priesm이 이미 검증) → **당분간 보류**

원칙: 한 단계가 동작·검증될 때까지 다음으로 가지 않는다.  
터미널/빌드/모듈 테스트는 에이전트가 하고, 사람에게는 UI 체감·방향 결정만 요청한다.

---

## 가치 한 줄

```
External AI Agent
    → Priesm Runtime (search/open/read/bundle)
    → Citation Bundle (압축된 근거)
    → Agent thinks with fewer tokens
```

**Browse once. Compress once. Agent thinks cheap.**

멀티 슬롯 fanout UI는 “사람 데모용”일 뿐, 핵심 KPI가 아니다.

---

## 전체 지도 (재정렬)

```
✅ Step 1  open + extract + token estimate
✅ Step 2  Citation Bundle + budget + render
⏸ Step 3  Human multi-slot fanout UI     ← 보류 (기존 Priesm 영역)
✅ Step A3 Agent HTTP API (localhost)
   Step A4 Agent 호출 예시 + 절감 receipt
   Step A5 MCP server (Cursor 등 접속)
   Step A6 Embedding chunk selection (C)
   Step A7 웹AI 번역(구조화 추출)
   Step A8 Progressive expand
```

---

## 완료로 보는 것

### Step 1–2 (기반) ✅
- URL → 본문 추출 → bundle → model-facing render
- economy (saved tokens est.) 필드

### Step A3 — Agent Local API ✅
에이전트(또는 curl)가 우리 프로세스에:

- `GET /v0/health`
- `POST /v0/extract` { url }
- `POST /v0/bundle` { query, urls[] | pages[], budget }
- `POST /v0/render` { bundle, profile }

을 쳐도 동일 결과가 나온다.  
→ **“다른 AI가 우리를 쓴다”의 최소 증명**

### Step A4 — 절감이 receipt로 돌아옴
매 응답에:

```json
{
  "economy": {
    "tokensForSingleModel": 180,
    "baselineTokensIfRawPerModel": 4000,
    "savedTokensEstimated": 3820,
    "savedRatioEstimated": 0.95
  }
}
```

에이전트 개발자가 “왜 Priesm을 붙이는지” 숫자로 설명 가능.

### Step A5 — MCP
`priesm_bundle` 등 도구로 Cursor/Claude Desktop이 경유.

### Step A6–A7 — 더 싼 컨텍스트
embedding 선별 + 구조화(웹AI 번역)로 bundle을 더 줄임.

---

## 명시적 보류

| 항목 | 이유 |
|------|------|
| 4슬롯 동시 스텁 답 UI 고도화 | 이미 확장 Priesm 핵심 |
| 실모델 멀티 어댑터 병렬 호출 | 지금 해자 아님 |
| Ray 종합 UX 폴리시 | 에이전트 경로 이후 |

사람용 Omni-Prompt/슬롯은 **남겨 두되 투자 최소화**.

---

## 성공 KPI (에이전트 경로)

1. 외부 프로세스가 localhost API만으로 bundle을 받는다  
2. raw 대비 tokens 절감 est.가 응답에 항상 있다  
3. 에이전트 권장 플로우 문서 1페이지로 통합된다  
4. (이후) MCP 1개 클라이언트 연동  

---

## 작업 규칙

1. Agent Surface > Human multi-chat  
2. Bundle이 상품 원자  
3. 토큰 절감은 가시화 필수  
4. act/클릭 자동화는 나중  
