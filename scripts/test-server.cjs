const { getLLMSTxt, getOpenAPISpec, getWellKnownMCP, getRobotsTxt } = require('../dist-electron/server/discovery.js');

async function testDiscovery() {
  try {
    console.log('--- Testing Autonomous AI Discovery Specs ---');
    
    // 1. llms.txt
    const llms = getLLMSTxt('https://api.priesm.ledpa7.com');
    console.log('[1. llms.txt Generated OK]:', llms.includes('Priesm AI Browser'));

    // 2. openapi.json
    const openapi = getOpenAPISpec('https://api.priesm.ledpa7.com');
    console.log('[2. openapi.json Generated OK]:', openapi.info.title === 'Priesm AI Browser API');

    // 3. .well-known/mcp.json
    const mcp = getWellKnownMCP('https://api.priesm.ledpa7.com');
    console.log('[3. well-known mcp.json Generated OK]:', mcp.name === 'priesm-ai-browser-mcp');

    // 4. robots.txt
    const robots = getRobotsTxt('https://api.priesm.ledpa7.com');
    console.log('[4. robots.txt Generated OK]:', robots.includes('User-agent: GPTBot'));

  } catch (e) {
    console.error('[Discovery Test Failed]:', e);
  }
}

testDiscovery();
