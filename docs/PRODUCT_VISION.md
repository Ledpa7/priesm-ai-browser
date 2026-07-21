# Priesm AI Browser — Product Vision

> **한 줄**  
> 사람과 여러 AI가 **같은 웹 작업면**을 쓰는 AI 네이티브 브라우저.  
> 사람은 여러 모델에 묻고, AI는 웹이 필요할 때 **Priesm을 경유**한다.

상세 전략: [`AI_BROWSER_STRATEGY.md`](./AI_BROWSER_STRATEGY.md)

---

## 1. 핵심 재정의

| 이전 초점 | 현재 초점 |
|-----------|-----------|
| 멀티 AI 사이드패널의 데스크톱 이식 | **Agent Web Runtime + Human Workspace** |
| 사람이 AI를 호출 | 사람이 AI를 호출하고, AI가 웹 런타임을 호출 |
| 채팅 메시지가 원자 | 메시지 + **Citation Bundle + Browse Trace** |

```
사람이 Priesm으로 여러 AI를 쓴다
              +
여러 AI가 Priesm으로 웹을 쓴다
              =
Priesm AI Browser
```

---

## 2. 왜 브라우저인가

확장 Priesm이 증명한 것: 동시 질의, Ray 종합, 슬롯.

확장이 못 여는 천장:
- iframe/CSP/세션 해킹
- 에이전트에 웹 런타임을 서비스로 제공 불가
- AI 브라우징이 모델 안으로 파편화되는 흐름에 끼어들 수 없음

브라우저가 되면:
- 탭/프로필/권한이 1급
- 외부 에이전트에 MCP/SDK로 웹 능력 공급
- 사람 앞에서 AI의 웹 사용을 관측·승인

---

## 3. Dual Surface

### Human Surface
- Omni-Prompt, 멀티 슬롯, Ray, Compare
- 기존 Priesm DNA

### Agent Surface
- Search / Open / Read / (승인된) Act
- Citation Bundle export
- MCP · Local SDK · localhost API

둘은 **Shared Web Workspace** 를 공유한다.

---

## 4. 코어 루프

### Loop H — Human compare
1. 질문 입력
2. 멀티 슬롯 전송
3. Ray 종합

### Loop A — Agent browse (신규 핵심)
1. 목표/질문 (사람 또는 외부 에이전트)
2. 웹 필요 시 Priesm Runtime 호출
3. 검색·열람 과정이 워크스페이스에 trace
4. Citation Bundle 생성
5. 단일 모델 또는 N모델 fanout 해석
6. Ray가 출처 인식 종합
7. 위험 액션은 사람 승인

### Loop S — Shared corpus (Priesm 고유)
**검색 1번 → 여러 뇌가 같은 근거를 해석 → Ray가 충돌 정리**

---

## 5. 원칙

1. Local-First Intelligence
2. Multi-Model Neutrality
3. Agent-Native Web
4. Visible Agency (AI 웹 사용 기본 가시)
5. Default Deny Actions
6. Priesm Core First
7. Permission with Dignity

---

## 6. 페이즈

| Phase | Human | Agent / Web Runtime |
|-------|-------|---------------------|
| P0 | 셸·슬롯·Omni-Prompt·stub Ray | 전략 문서 |
| P0.5 | API adapter 시작 | open+extract+trace 수직 슬라이스 |
| P1 | 실제 멀티 provider + Ray 이식 | Citation Bundle, 내부 browse 툴 |
| P2 | 안정 워크스페이스 | MCP Server, 외부 에이전트 1종 |
| P3 | Router·스킬 | headless pool, shared browse |
| P4 | 팀/생태계 | SDK, policy packs, optional gateway |

---

## 7. 성공의 정의

1. 사용자가 AI 답의 출처 탭을 Priesm에서 다시 열 수 있다
2. 외부 에이전트가 웹이 필요할 때 Priesm runtime을 호출한다
3. 같은 browse bundle을 여러 모델이 해석하고 Ray가 합친다
4. 위험한 웹 액션은 사람 없이 기본 실행되지 않는다
5. 대화/페이지 본문은 기본 로컬에 남는다

---

## 8. Non-goals (초기)

- 완전 자율 결제/계정 탈취형 에이전트
- 특정 모델 전용 브라우저 종속
- 대화 본문 서버 적재 사업
- 첫 버전에 Chromium 풀 fork 필수화

---

## 9. 메시지

- One question. Many minds.
- See what your AI sees.
- The browser agents borrow.
- Ask once. Browse once. Think many times.

---

## 10. 다음 산출물

1. `AI_BROWSER_STRATEGY.md` ✅
2. `AGENT_RUNTIME_API.md`
3. `CITATION_BUNDLE_SPEC.md`
4. Runtime 수직 슬라이스 (`open+extract+trace`)