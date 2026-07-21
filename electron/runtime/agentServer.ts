import * as http from 'http';
import { extractWithCrawl4AI } from './crawl4aiAdapter';
import { createCitationBundle, SharedContextBundle } from './citationBundle';

export interface AgentServerConfig {
  port: number;
  onBundleCreated?: (bundle: SharedContextBundle) => void;
}

let activeServer: http.Server | null = null;
const bundleStore = new Map<string, SharedContextBundle>();

export function startAgentBridgeServer(config: AgentServerConfig = { port: 37100 }) {
  if (activeServer) {
    return activeServer;
  }

  const server = http.createServer(async (req, res) => {
    // CORS headers for local Agent tools & UI
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url || '/', `http://localhost:${config.port}`);

    // GET /health
    if (req.method === 'GET' && urlObj.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'Priesm AI Browser Agent Bridge', port: config.port }));
      return;
    }

    // POST /v1/extract or GET /v1/extract?url=...
    if (urlObj.pathname === '/v1/extract') {
      let targetUrl = urlObj.searchParams.get('url');

      if (req.method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          targetUrl = body.url || targetUrl;
        } catch (e) {
          // ignore
        }
      }

      if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required "url" parameter' }));
        return;
      }

      try {
        const crawlResult = await extractWithCrawl4AI(targetUrl);
        const bundle = createCitationBundle(crawlResult);
        bundleStore.set(bundle.bundleId, bundle);

        if (config.onBundleCreated) {
          config.onBundleCreated(bundle);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            bundleId: bundle.bundleId,
            url: bundle.url,
            title: bundle.title,
            extractedMarkdown: bundle.extractedMarkdown,
            tokensEst: bundle.tokensEst,
            savedTokensEst: bundle.savedTokensEst,
            savedRatioPercentage: bundle.savedRatioPercentage,
            source: bundle.source,
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

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });

  server.listen(config.port, () => {
    console.log(`[Priesm Agent Bridge] Listening on http://localhost:${config.port}`);
  });

  activeServer = server;
  return server;
}

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