# Priesm AI Browser

> One question. Many minds.

Priesm 서비스에 최적화된 **AI 전용 브라우저 워크스페이스**.
여러 AI에게 동시에 묻고, Ray로 종합하고, 외부 에이전트와 시너지를 내는 것이 목표입니다.

## 제품 방향 (중요)

Priesm은 사람용 멀티 AI 창에서 끝내지 않는다.  
**AI가 웹을 검색·열람할 때 경유하는 브라우저 런타임**이 핵심이다.

- 사람: 여러 모델에 묻고 비교 (Human Surface)
- AI/에이전트: Search·Read·Citation Bundle·(승인된) Act (Agent Surface)
- 고유 루프: **Browse once → Many minds → Ray**

자세한 기획: [`docs/AI_BROWSER_STRATEGY.md`](./docs/AI_BROWSER_STRATEGY.md)

## 현재 단계

**Phase 0 — Foundation (진행 중)**

- [x] 프로젝트 폴더 / 문서 골격
- [x] Electron + Vite + React + TS 셸
- [x] 멀티 슬롯 레이아웃 + Omni-Prompt Bar UI
- [x] Ray stub (전송 흐름 시뮬레이션)
- [x] dev 런처 (GPU fallback, ELECTRON_RUN_AS_NODE 방어)
- [ ] Provider Adapter 1개 (API)
- [ ] Ray 종합 엔진 이식 (APSE)
- [ ] Agent Bridge RFC

기반 확장 분석 레포: `../8-priesm-project`

## 빠른 시작

```bash
cd C:\Users\wjdwl\.gemini\antigravity\scratch\80-priesm-AIbrowser
npm install
npm run dev
```

- `npm run dev` — Vite(5174) + Electron 동시 실행
- `npm run build` — 프로덕션 빌드
- `npm run lint` — TypeScript 체크
- `npm start` — 빌드된 앱 실행 (먼저 `npm run build`)

브라우저 창이 뜨면 하단 Omni-Prompt에 질문을 입력해 보세요.
지금은 **스텁 응답**으로 4슬롯 + Ray 카드 흐름만 시뮬레이션합니다.

### 환경 이슈 메모 (Windows)

- 일부 IDE는 `ELECTRON_RUN_AS_NODE=1` 을 설정합니다. `scripts/launch-electron.cjs`가 이를 제거합니다.
- GPU 가상화 환경에서는 Electron이 크래시할 수 있어 `--disable-gpu` 등 fallback을 적용했습니다.
- 홈 디렉터리의 전역 `postcss.config.*` 충돌을 피하기 위해 프로젝트 로컬 PostCSS 설정을 둡니다.

## 폴더 구조

```
80-priesm-AIbrowser/
├── docs/                 # 기획 · 아키텍처 문서
├── electron/             # 메인 프로세스
├── scripts/              # dev 런처
├── src/                  # 렌더러 UI
│   ├── components/
│   ├── features/ray/
│   ├── lib/
│   └── styles/
├── package.json
└── README.md
```

## 제품 원칙 (요약)

1. Local-First Intelligence
2. Multi-Model Neutrality
3. Agent-Native
4. Priesm Core First (동시 질의 · Ray · 슬롯)
5. 최소 권한 · 대화 본문 기본 미업로드

## 문서

- [AI Browser Strategy](./docs/AI_BROWSER_STRATEGY.md) ← 핵심 방향
- [Product Vision](./docs/PRODUCT_VISION.md)
- [Vertical Slice Plan](./docs/VERTICAL_SLICE_PLAN.md)
- [Tech Architecture](./docs/TECH_ARCHITECTURE.md)

## 단계별 진행

자세한 순서: [`docs/STEP_ROADMAP.md`](./docs/STEP_ROADMAP.md)

- **지금 Step 1**: URL Extract + 토큰 est. UI
- 다음 Step 2: Citation Bundle + budget

## 다음 구현 (Phase 0.5)

1. **A1** Runtime `open+extract+trace` + Citation Bundle (AI가 웹 경유)
2. **H1** OpenAI API Adapter (한 슬롯 실응답)
3. bundle → multi-slot fanout
4. (이어서) MCP skeleton

## 라이선스

Private / Unpublished