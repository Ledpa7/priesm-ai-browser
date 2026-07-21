import { extractWithCrawl4AI, ExtractOptions } from '../electron/runtime/crawl4aiAdapter';
import { createCitationBundle } from '../electron/runtime/citationBundle';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const PRIESM_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'priesm_extract_web_context',
    description:
      'Extracts clean, token-optimized Markdown context from any web URL. Reduces token usage by 70-90% for AI Agents while preserving code blocks and key content.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The target web page URL to parse and extract (e.g. https://docs.example.com)',
        },
        mode: {
          type: 'string',
          enum: ['full', 'code-only', 'summary'],
          description: 'Extraction mode. "full" for complete text, "code-only" for code blocks only, "summary" for concise points.',
        },
        targetSelector: {
          type: 'string',
          description: 'Optional CSS selector to target specific DOM element (e.g., "#main-article", ".docs-body")',
        },
        maxTokenBudget: {
          type: 'number',
          description: 'Optional maximum token budget limit for truncation',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'priesm_check_health',
    description: 'Checks Priesm AI Browser Cloud API runtime status and service info.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export async function handleMCPRequest(request: any): Promise<any> {
  const { id, method, params } = request || {};

  // 1. initialize
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'priesm-ai-browser-mcp',
          version: '0.1.0',
        },
      },
    };
  }

  // 2. tools/list
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: PRIESM_MCP_TOOLS,
      },
    };
  }

  // 3. tools/call
  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (toolName === 'priesm_check_health') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'ok',
                  service: 'Priesm AI Browser MCP Runtime',
                  endpoint: 'https://api.priesm.ledpa7.com',
                  version: '0.1.0',
                },
                null,
                2
              ),
            },
          ],
        },
      };
    }

    if (toolName === 'priesm_extract_web_context') {
      const url = args.url;
      if (!url) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing required argument "url"' },
        };
      }

      const options: ExtractOptions = {
        mode: args.mode,
        targetSelector: args.targetSelector,
        maxTokenBudget: args.maxTokenBudget,
      };

      try {
        const crawlRes = await extractWithCrawl4AI(url, options);
        const bundle = createCitationBundle(crawlRes);

        const responseText = [
          `# Evidence Bundle: ${bundle.title}`,
          `URL: ${bundle.url}`,
          `Bundle ID: ${bundle.bundleId}`,
          `Stats: ${bundle.tokensEst} tokens (~${bundle.savedRatioPercentage}% saved vs raw HTML)`,
          `Mode: ${crawlRes.appliedMode || 'full'}`,
          `---`,
          bundle.extractedMarkdown,
        ].join('\n\n');

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Extraction Failed: ${err?.message || 'Unknown error'}`,
              },
            ],
          },
        };
      }
    }

    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Tool not found: ${toolName}` },
    };
  }

  // Fallback / ping
  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not supported: ${method}` },
  };
}
