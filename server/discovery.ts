export function getLLMSTxt(baseUrl: string = 'https://api.priesm.ledpa7.com'): string {
  return `# Priesm AI Browser — Web Extractor & Token Saver Engine

> Priesm AI Browser provides a fast, clean, token-optimized web parsing and context extraction runtime for AI Agents (ChatGPT, Claude, Cursor, AutoGPT, LangChain).

## Core Features
- **Token Saver Engine**: Cuts raw HTML noise, script overhead, and ads by 70-90% into clean Markdown.
- **Query-Driven RAG Filtering**: Extracts only relevant paragraphs matching the agent's task query.
- **Code Block Preservation**: 100% preserves code blocks (\`\`\`) and tables without corruption.
- **Multi-URL Digest**: Concurrent multi-tab parsing with automatic paragraph deduplication.
- **Model Context Protocol (MCP)**: Native MCP tool compatibility at \`${baseUrl}/v1/mcp\`.

## Primary Endpoints
- **Web Extraction API**: \`POST ${baseUrl}/v1/extract\`
  - Inputs: \`url\` (string) or \`urls\` (string[]), \`query\` (string), \`options\` (object)
  - Output: JSON containing Evidence Bundle, \`extractedMarkdown\`, and token savings stats.
- **MCP Protocol Endpoint**: \`POST ${baseUrl}/v1/mcp\` (JSON-RPC)
  - Tool Name: \`priesm_extract_web_context\`, \`priesm_smart_digest\`, \`priesm_check_health\`
- **OpenAPI 3.0 Spec**: \`${baseUrl}/openapi.json\`
- **Health Status**: \`${baseUrl}/v1/health\`

## Example Usage for AI Agents
To fetch and condense a web page:
POST ${baseUrl}/v1/extract
Headers: Content-Type: application/json
Body: { "url": "https://docs.example.com", "options": { "mode": "full", "maxTokenBudget": 2000 } }
`;
}

export function getRobotsTxt(baseUrl: string = 'https://api.priesm.ledpa7.com'): string {
  return `User-agent: *
Allow: /

# AI Crawlers & Agents
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# AI Discovery Specification
Sitemap: ${baseUrl}/llms.txt
`;
}

export function getWellKnownMCP(baseUrl: string = 'https://api.priesm.ledpa7.com') {
  return {
    $schema: 'https://modelcontextprotocol.io/schema/well-known.json',
    name: 'priesm-ai-browser-mcp',
    description: 'Priesm AI Browser Token Saver & Web Parser Engine for AI Agents',
    endpoint: `${baseUrl}/v1/mcp`,
    tools: [
      {
        name: 'priesm_extract_web_context',
        description: 'Extracts clean, token-optimized Markdown context from any web URL.',
      },
      {
        name: 'priesm_smart_digest',
        description: 'Multi-URL digest tool with query RAG filtering and deduplication.',
      },
    ],
  };
}

export function getOpenAPISpec(baseUrl: string = 'https://api.priesm.ledpa7.com') {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Priesm AI Browser API',
      description: 'Agent-Native Web Runtime & Token Saver Cloud API for AI Agents and LLMs',
      version: '0.1.0',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Priesm Cloud API Production Server',
      },
    ],
    paths: {
      '/v1/extract': {
        post: {
          summary: 'Extract & Condense Web URL Context',
          description: 'Parses raw web URLs, strips HTML noise, and returns a token-optimized Evidence Bundle in Markdown.',
          operationId: 'extractWebContext',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'Single web URL' },
                    urls: { type: 'array', items: { type: 'string' }, description: 'Multiple web URLs' },
                    query: { type: 'string', description: 'Agent task query for RAG filtering' },
                    options: {
                      type: 'object',
                      properties: {
                        mode: { type: 'string', enum: ['full', 'code-only', 'summary'] },
                        targetSelector: { type: 'string' },
                        maxTokenBudget: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successful extraction',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      bundleId: { type: 'string' },
                      url: { type: 'string' },
                      title: { type: 'string' },
                      extractedMarkdown: { type: 'string' },
                      tokensEst: { type: 'number' },
                      savedTokensEst: { type: 'number' },
                      savedRatioPercentage: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/health': {
        get: {
          summary: 'Service Health Check',
          operationId: 'checkHealth',
          responses: {
            '200': {
              description: 'Service is healthy',
            },
          },
        },
      },
    },
  };
}
