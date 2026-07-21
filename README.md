# 🚀 Priesm AI Browser — Project Dashboard & Architecture

> **"One question. Many minds. Agent-Native Web Runtime."**  
> Priesm AI Browser는 사람만 쓰는 브라우저가 아닙니다.  
> **AI 에이전트(Cursor, ChatGPT, Claude, AutoGPT 등)가 웹을 탐색하고 읽을 때 토큰을 80%+ 절감하고, 팩트를 검증(Fact Verification)하며, 지식을 지능적으로 조립해 주는 AI 전용 클라우드 브라우저 런타임**입니다.

---

## 🟢 Live System Status & Production Endpoints

| 항목 | 프로덕션 정보 / URL | 상태 |
|------|----------------------|------|
| **Cloud API Base Domain** | [`https://api.priesm.ledpa7.com`](https://api.priesm.ledpa7.com) | 🟢 Active (Vercel Edge) |
| **GitHub Repository** | [`https://github.com/Ledpa7/priesm-ai-browser.git`](https://github.com/Ledpa7/priesm-ai-browser.git) | 🟢 Main Synced |
| **MCP Protocol Endpoint** | `https://api.priesm.ledpa7.com/v1/mcp` | 🟢 Active (MCP 2024-11-05) |
| **AI Discovery Spec (`llms.txt`)**| `https://api.priesm.ledpa7.com/llms.txt` | 🟢 Active |
| **OpenAPI 3.0 Spec (`openapi.json`)**| `https://api.priesm.ledpa7.com/openapi.json` | 🟢 Active |

---

## 🔥 핵심 구축 기능 대시보드 (Core Features)

### 1. 🛡️ Priesm Fact Verification Seal System (독자 팩트 검증 인장)
- **개념**: 외부 웹파서 결과물 위에 Priesm만의 무결성 해시 인장(`[Priesm-Seal: #a3f2]`)을 단락별로 주입.
- **가치**: AI 에이전트가 마크다운을 읽을 때 단락별로 원본 웹 무결성을 보증받아 **환각(Hallucination) 0%에 도전**.

### 2. ⚡ Token Saver & Entropy Compressor Engine
- **개념**: 무거운 HTML/JS/CSS/광고 노이즈를 100% 제거하고 코드 블록(` ``` `)과 표(Table)는 100% 완벽 보존.
- **가치**: 웹페이지 탐색 시 **토큰 소모량을 70~90% 절감**하고 LLM 응답 속도를 3~5배 향상.

### 3. 🎯 Query-Driven RAG & Multi-URL Digest
- **Query RAG**: 10만 토큰 넘는 문서 중 에이전트의 작업 목적(`query`)과 연관된 핵심 단락만 핀포인트 조립.
- **Multi-URL Digest**: 3~5개 웹사이트를 1턴 만에 동시 파싱하여 중복 문단을 자동 제거한 1개 Super Bundle 생성.

### 4. 🔌 Native Model Context Protocol (MCP) Support
- Cursor, Windsurf, Claude Desktop 등에 `https://api.priesm.ledpa7.com/v1/mcp` 한 줄 등록으로 연동.
- 제공 툴: `priesm_extract_web_context`, `priesm_smart_digest`, `priesm_check_health`.

### 5. 🤖 Autonomous AI Discovery System
- 홍보 없이도 전 세계 AI 크롤러/에이전트가 도메인 접속 시 인지하도록 `llms.txt`, `openapi.json`, `/.well-known/mcp.json`, `robots.txt` 자동 서비스.

---

## 🛠️ API 사용 명세 (API Specifications)

### 1) Web Extraction API (`POST /v1/extract`)

```bash
curl -X POST https://api.priesm.ledpa7.com/v1/extract \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://docs.example.com"],
    "query": "authentication bearer token",
    "options": {
      "mode": "full",
      "maxTokenBudget": 2000
    }
  }'
```

### 2) MCP (Model Context Protocol) `mcp.json` 등록

```json
{
  "mcpServers": {
    "priesm-browser": {
      "url": "https://api.priesm.ledpa7.com/v1/mcp"
    }
  }
}
```

---

## 📁 프로젝트 구조 (Project Architecture)

```
80-priesm-AIbrowser/
├── docs/                      # 전략 및 에이전트 관점 명세서
│   ├── AGENT_SURFACE_SPEC.md  # AI 에이전트 관점의 4대 페인포인트 & 기획서
│   ├── AI_BROWSER_STRATEGY.md # Priesm AI Browser 전체 제품 전략
│   └── MCP_INTEGRATION_GUIDE.md# Cursor/Claude Desktop MCP 연동 가이드
├── electron/                  # Electron 메인/프리로드 프로세스 및 런타임
│   ├── runtime/
│   │   ├── citationBundle.ts  # Fact Verification Seal [Priesm-Seal] 주입 엔진
│   │   ├── crawl4aiAdapter.ts # Crawl4AI 연동 + Query RAG + 중복 제거 필터
│   │   └── agentServer.ts     # 로컬 Agent Bridge HTTP 서버
│   ├── main.ts
│   └── preload.ts
├── mcp/                       # Model Context Protocol (MCP) 구현체
│   └── server.ts              # JSON-RPC MCP 서버 (priesm_smart_digest 등)
├── server/                    # Standalone Cloud API Server (Vercel 배포용)
│   ├── discovery.ts           # Autonomous AI Discovery (llms.txt, openapi.json 등)
│   └── index.ts               # Standalone Node.js HTTP Cloud Server
├── src/                       # Desktop Client React UI Workspace
│   ├── components/            # ExtractPanel, SlotCard, RayCard 등 UI
│   └── App.tsx
├── package.json
├── vercel.json                # Vercel 1-Click Serverless Deployment Config
└── README.md                  # Project Dashboard
```

---

## ⚙️ 로컬 개발 및 실행 (Local Development)

```bash
# 1. 의존성 설치
npm install

# 2. Standalone Cloud API 로컬 테스트 서버 구동 (Port 37100)
npm run start:server

# 3. Electron Desktop Client 구동
npm run dev

# 4. TypeScript Strict Linting & Type Check
npm run lint
```

---

## 📜 라이선스

Private / Unpublished — All Rights Reserved by Priesm Team.