# Priesm MCP (Model Context Protocol) Integration Guide

Priesm AI Browser의 초경량 웹 파싱 및 토큰 절약 엔진(`https://api.priesm.ledpa7.com`)을 코딩 AI 에이전트에 등록하는 가이드입니다.

---

## 1. Priesm MCP 제공 도구 (Tools)

- **`priesm_extract_web_context`**:
  - 원본 웹 URL을 받아 불필요한 광고, DOM 노이즈를 100% 제거하고 토큰을 70~90% 절약한 마크다운 컨텍스트 반환.
  - 파라미터: `url` (필수), `mode` (`full` | `code-only` | `summary`), `targetSelector`, `maxTokenBudget`.
- **`priesm_check_health`**:
  - 클라우드 API 및 MCP 서버 가동 상태 확인.

---

## 2. 각 AI 툴별 등록 방법

### 1) Cursor / Windsurf 등록 방법

Cursor 설정 파일(`~/.cursor/mcp.json` 또는 Workspace Setting)에 아래 서버 구성을 추가합니다:

```json
{
  "mcpServers": {
    "priesm-browser": {
      "url": "https://api.priesm.ledpa7.com/v1/mcp"
    }
  }
}
```

### 2) Claude Desktop 등록 방법

Claude Desktop 설정 파일 (`claude_desktop_config.json`)에 등록:

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

## 3. 테스트 및 사용 방법

에이전트에게 다음과 같이 자연어로 지시하면 AI가 자동으로 Priesm MCP 툴을 사용합니다:

> *"Cursor야, Priesm 브라우저 툴을 사용해서 `https://docs.example.com` 웹사이트 읽어와서 토큰 절약된 마크다운으로 코드 수정해줘."*
