import * as http from 'http';
import { extractWithCrawl4AI } from '../electron/runtime/crawl4aiAdapter';
import { createCitationBundle, SharedContextBundle } from '../electron/runtime/citationBundle';
import { handleMCPRequest, PRIESM_MCP_TOOLS } from '../mcp/server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 37100;
const bundleStore = new Map<string, SharedContextBundle>();

function parseRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function createServer() {
  return http.createServer(async (req, res) => {
    // CORS headers for Cloud & Local AI Agent access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const host = req.headers.host || `localhost:${PORT}`;
    const urlObj = new URL(req.url || '/', `http://${host}`);

    // GET /v1/mcp or POST /v1/mcp (Model Context Protocol Endpoint)
    if (urlObj.pathname === '/v1/mcp' || urlObj.pathname === '/mcp') {
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            protocol: 'MCP (Model Context Protocol)',
            version: '2024-11-05',
            tools: PRIESM_MCP_TOOLS,
          })
        );
        return;
      }

      if (req.method === 'POST') {
        try {
          const mcpReq = await parseRequestBody(req);
          const mcpRes = await handleMCPRequest(mcpReq);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mcpRes));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }));
        }
        return;
      }
    }


    // GET /health
    if (req.method === 'GET' && (urlObj.pathname === '/' || urlObj.pathname === '/health' || urlObj.pathname === '/v1/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          service: 'Priesm AI Browser Cloud API Server',
          version: '0.1.0',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // POST /v1/extract or GET /v1/extract?url=...
    if (urlObj.pathname === '/v1/extract') {
      let targetUrl = urlObj.searchParams.get('url');
      let options: any = {};

      if (req.method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          targetUrl = body.url || targetUrl;
          options = body.options || {};
        } catch (e) {
          // ignore json parse error
        }
      }

      if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Missing required "url" parameter' }));
        return;
      }

      try {
        const crawlResult = await extractWithCrawl4AI(targetUrl, options);
        const bundle = createCitationBundle(crawlResult);
        bundleStore.set(bundle.bundleId, bundle);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            bundleId: bundle.bundleId,
            url: bundle.url,
            title: bundle.title,
            extractedMarkdown: bundle.extractedMarkdown,
            rawHtmlLength: bundle.rawHtmlLength,
            extractedLength: bundle.extractedLength,
            tokensEst: bundle.tokensEst,
            savedTokensEst: bundle.savedTokensEst,
            savedRatioPercentage: bundle.savedRatioPercentage,
            source: bundle.source,
            appliedMode: crawlResult.appliedMode || options.mode || 'full',
            createdAt: bundle.createdAt,
          })
        );
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err?.message || 'Extraction failed' }));
      }
      return;
    }


    // GET /v1/bundles
    if (req.method === 'GET' && urlObj.pathname === '/v1/bundles') {
      const bundles = Array.from(bundleStore.values());
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: bundles.length, bundles }));
      return;
    }

    // GET /v1/bundles/:id
    if (req.method === 'GET' && urlObj.pathname.startsWith('/v1/bundles/')) {
      const bundleId = urlObj.pathname.replace('/v1/bundles/', '');
      const bundle = bundleStore.get(bundleId);
      if (bundle) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, bundle }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Bundle not found' }));
      }
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`[Priesm Cloud Server] Server started on http://localhost:${PORT}`);
  });
}
