# Agent-Centric Spec: Priesm AI Browser — "AI 에이전트 관점의 브라우저 기획"

> **비전**: Priesm AI Browser는 인간 사용자의 웹 브라우저가 아닙니다.  
> **AI 에이전트가 웹을 탐색하고 조작할 때 토큰, 속도, 정확도를 최적화해 주는 AI 에이전트 전용 런타임 OS**입니다.

---

## 🤖 1. AI 에이전트 관점의 4대 핵심 페인포인트 & Priesm 솔루션

| AI 에이전트의 현실적 고충 | Priesm AI Browser 솔루션 | 제공 기능 (Agent Tool) |
|--------------------------|--------------------------|-----------------------|
| **1. 웹문서 용량이 커서 Context Window 예산이 폭발함** | 에이전트의 **목적(Query)**에 맞는 연관 단락만 RAG 방식으로 핀포인트 조립 | `Query-Driven Smart Excerpting` |
| **2. 여러 URL을 탐색하느라 API 호출 턴(Turn)이 너무 많이 낭비됨** | 3~5개 웹사이트를 한 번에 동시 탐색하고 중복 제거 후 **1개 Super Bundle**로 압축 반환 | `Multi-Tab Parallel Digest` |
| **3. Cloudflare 봇 차단, JS 렌더링, 쿠키 처리 때문에 읽기가 불가능함** | Priesm 브라우저 엔진이 무거운 JS/봇차단을 100% 우회 렌더링 후 깨끗한 마크다운만 전달 | `Bypass & Session Aware Extract` |
| **4. 위험 작업(클릭, 결제, 폼 제출) 시 사용자 승인이 필요함** | 에이전트가 동작하는 모습이 개발자 UI 화면에 실시간 시각화되며 **Human-in-the-Loop 승인** 제공 | `Human Approval Gating` |

---

## 🛠️ 2. 에이전트 관점의 API 규격 설계 (Agent API Specs)

### 1) `priesm_smart_digest` (다중 웹페이지 지능형 요약 & 발췌)
* **에이전트 사용 목적**: "내가 필요한 정보를 찾기 위해 여러 웹사이트를 한 번에 읽고 정돈해 줘"
```json
{
  "urls": [
    "https://docs.example.com/v1-to-v2",
    "https://github.com/example/repo/issues/102"
  ],
  "agentTaskQuery": "Next.js 15 Server Actions migration breaking changes",
  "maxTokensBudget": 2500
}
```

### 2) `priesm_inspect_session` (시각적 관찰 & 인간 승인 요청)
* **에이전트 사용 목적**: "내가 읽고 있는 웹 상태를 사용자에게 눈으로 보여주고 승인을 받아줘"

---

## 🎯 3. 에이전트 관점의 차별화 로드맵

1. **Phase 1 (완료)**: Single URL Token Saver, Crawl4AI Engine & Cloud API / MCP.
2. **Phase 2 (차세대 구현)**: `Query-Driven Smart RAG Filter` (에이전트 질의 기반 연관 단락 핀포인트 발췌 및 다중 URL 중복 제거).
3. **Phase 3 (완성형)**: `Agent Action & Human Approval Interface` (웹 클릭/입력 제어 및 인간 승인 샌드박스).
