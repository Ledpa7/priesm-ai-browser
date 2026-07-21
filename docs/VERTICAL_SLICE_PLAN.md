# Vertical Slice Plan — Phase 0 → 1

## 목표
두 루프를 얇게 증명한다.

```
H-loop: 질문 → 멀티 슬롯 → Ray
A-loop: 웹 필요 → Priesm Runtime 검색/열람 → Citation Bundle → (멀티 모델) → Ray
```

전략 상세: `AI_BROWSER_STRATEGY.md`

---

## Phase 0 — Foundation

### Done
- Electron + Vite + React + TS
- 4슬롯 그리드 + Omni-Prompt
- stub Ray 전송 흐름
- Windows dev 런처 안정화
- AI Browser 전략 문서 (`AI_BROWSER_STRATEGY.md`)

### 의도적 미구현
- 실제 LLM API
- 실제 웹 런타임
- MCP
- 계정/결제

---

## Phase 0.5 — 두 개의 작은 수직 슬라이스

### Slice H1 — Real answer (Human)
1. OpenAI(또는 1개) API Adapter
2. 한 슬롯 실응답 스트리밍
3. 키는 로컬 only

### Slice A1 — Real browse (Agent/Web) ★ 방향 핵심
1. 메인 프로세스에서 URL 로드 (숨김 또는 가시 WebContents)
2. readability/본문 extract
3. UI Browse Trace 에 `open → extract` 기록
4. Citation Bundle JSON 생성
5. bundle 텍스트를 슬롯 프롬프트 컨텍스트로 주입

**A1 성공 기준:**  
"이 링크 읽고 요약" 하면 Priesm이 페이지를 열어 읽고, 근거가 남는다.

---

## Phase 1 — MVP 종료 조건

### Human
- [ ] provider ≥ 2 실응답
- [ ] Ray = stub 아님 (APSE 이식 이상)
- [ ] 설정 영속화

### Agent / Web
- [ ] open + extract + trace 안정
- [ ] citation bundle 스펙 v0 고정
- [ ] bundle → multi-slot fanout 1회 데모
- [ ] 내부 localhost API 또는 툴 핸들러

### Phase 1 밖
- MCP 외부 연동 (Phase 2)
- 자율 click 에이전트
- headless pool 스케일

---

## Phase 2 — 외부 AI가 우리를 쓰기 시작
- [ ] MCP server: search/open/read/bundle
- [ ] Approval UI
- [ ] Cursor 또는 Claude Desktop 1개 연동
- [ ] "See what your AI sees" 데모 완성

---

## Non-Goals (지금)
- Chromium fork 필수화
- 풀 오토 클릭/결제
- 대화 본문 클라우드 저장
- 모든 검색엔진 완벽 커버

---

## 작업 규칙
1. 한 번에 한 슬라이스 (H1 또는 A1)
2. `npm run lint` 통과
3. 웹 액션 기본 deny / 읽기 먼저
4. 전송·추출 안정성 > 화려한 자율성
5. Dual Surface를 깨는 기능 금지 (비가시 위험 액션 기본 허용 등)