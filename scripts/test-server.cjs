const { handleMCPRequest } = require('../dist-electron/mcp/server.js');

async function testMCP() {
  try {
    console.log('--- MCP Test Suite ---');
    
    // 1. tools/list
    const listRes = await handleMCPRequest({ id: 1, method: 'tools/list' });
    console.log('[1. MCP tools/list Success]:', listRes.result.tools.map(t => t.name));

    // 2. tools/call priesm_extract_web_context
    const callRes = await handleMCPRequest({
      id: 2,
      method: 'tools/call',
      params: {
        name: 'priesm_extract_web_context',
        arguments: {
          url: 'https://example.com',
          mode: 'full'
        }
      }
    });

    console.log('[2. MCP tools/call Success]:', {
      isError: callRes.result?.isError || false,
      textPreview: callRes.result?.content[0]?.text?.slice(0, 150)
    });
  } catch (e) {
    console.error('[MCP Test Failed]:', e);
  }
}

testMCP();
